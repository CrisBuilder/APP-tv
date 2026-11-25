import { useState } from 'react';
import { MessageSquare, CheckCircle2, Trash2 } from 'lucide-react';
import { broadcastToDisplays } from '../../services/displayService';
import DisplayTargetSelector from '../DisplayTargetSelector';

export default function AnnouncementTab({
  user,
  displays,
  selectedDisplayId,
  initialText = ''
}) {
  const [targets, setTargets] = useState(selectedDisplayId);
  const [text, setText] = useState(initialText);
  const [size, setSize] = useState('medium');
  const [badge, setBadge] = useState('INFORMAÇÕES');
  const [statusMsg, setStatusMsg] = useState('');

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Digite o texto do letreiro.');
      return;
    }

    await broadcastToDisplays(user.uid, targets, 'announcement', {
      text: text.trim(),
      size,
      badge: badge.trim().toUpperCase() || 'INFORMAÇÕES',
      visible: true,
      timestamp: Date.now()
    }, displays);

    setStatusMsg('Letreiro publicado na TV com sucesso!');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleClear = async () => {
    await broadcastToDisplays(user.uid, targets, 'announcement', {
      text: '',
      visible: false
    }, displays);
    setText('');
    setStatusMsg('Letreiro removido da tela.');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  return (
    <div className="df-card">
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--ink)' }}>
          Letreiro Rotativo (Avisos & Comunicados)
        </h3>
        <p style={{ color: 'var(--mute)', fontSize: '0.88rem' }}>
          Exibe uma faixa de texto animada e fluida na parte inferior da TV para chamar atenção instantânea do público.
        </p>
      </div>

      <DisplayTargetSelector
        displays={displays}
        globalTarget={selectedDisplayId}
        selectedTargets={Array.isArray(targets) ? targets : [targets]}
        onChangeTargets={setTargets}
      />

      {statusMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--ok-soft)', color: 'var(--ok-text)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-btn)', fontSize: '0.88rem', fontWeight: '600', marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} /> {statusMsg}
        </div>
      )}

      <form onSubmit={handlePublish}>
        <div className="df-grid-2" style={{ marginBottom: '0.75rem' }}>
          <div className="df-field" style={{ marginBottom: 0 }}>
            <label>Tamanho do Letreiro</label>
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="small">Pequeno (Discreto)</option>
              <option value="medium">Médio (Padrão)</option>
              <option value="large">Grande (Destaque Máximo)</option>
            </select>
          </div>

          <div className="df-field" style={{ marginBottom: 0 }}>
            <label>Etiqueta em Destaque</label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="Ex: INFORMAÇÕES, PROMOÇÃO, URGENTE"
              maxLength={24}
            />
          </div>
        </div>

        <div className="df-field">
          <label>Texto do Letreiro Noticiário</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Ex: 🔥 SUPER PROMOÇÃO HOJE: 20% DE DESCONTO EM TODOS OS PRODUTOS DA LOJA! CONFIRA NOSSAS OFERTAS ESPECIAIS..."
            required
          />
          <span style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>
            Dica: use letras maiúsculas e emojis para aumentar o impacto visual nos displays.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <button type="submit" className="df-btn df-btn-pri" style={{ minWidth: '160px' }}>
            <MessageSquare size={16} /> Publicar Letreiro na TV
          </button>

          <button type="button" onClick={handleClear} className="df-btn df-btn-sec">
            <Trash2 size={16} color="var(--bad)" /> Ocultar da TV
          </button>
        </div>
      </form>
    </div>
  );
}
