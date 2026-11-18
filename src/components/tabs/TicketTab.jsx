import { useState } from 'react';
import { Bell, Volume2, CheckCircle2 } from 'lucide-react';
import { broadcastToDisplays } from '../../services/displayService';
import { playChimeSound } from '../../services/audioService';
import DisplayTargetSelector from '../DisplayTargetSelector';

export default function TicketTab({
  user,
  displays,
  selectedDisplayId
}) {
  const [targets, setTargets] = useState(selectedDisplayId);
  const [number, setNumber] = useState('');
  const [desk, setDesk] = useState('Guichê 01');
  const [statusMsg, setStatusMsg] = useState('');
  const [history, setHistory] = useState([]);

  const handleCallTicket = async (e) => {
    e.preventDefault();
    if (!number.trim()) {
      alert('Digite o número ou código da senha.');
      return;
    }

    const payload = {
      number: number.trim().toUpperCase(),
      desk: desk.trim(),
      timestamp: Date.now(),
      visible: true
    };

    // Toca som nativo de gongo de confirmação no painel e na TV
    playChimeSound();

    await broadcastToDisplays(user.uid, targets, 'ticket', payload, displays);

    setHistory((prev) => [payload, ...prev.slice(0, 4)]);
    setStatusMsg(`Senha ${payload.number} chamada com sucesso com som de gongo!`);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleQuickNext = () => {
    const nextNum = parseInt(number, 10);
    if (!isNaN(nextNum)) {
      setNumber(String(nextNum + 1).padStart(2, '0'));
    }
  };

  return (
    <div className="df-card">
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--ink)' }}>
          Chamador de Senhas com Som Nativo
        </h3>
        <p style={{ color: 'var(--mute)', fontSize: '0.88rem' }}>
          Emita chamadas de atendimento com som de sino/gongo sintetizado pelo navegador (Web Audio API 100% offline).
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

      <form onSubmit={handleCallTicket}>
        <div className="df-grid-2">
          <div className="df-field">
            <label>Número / Código da Senha</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Ex: A042 ou 15"
                style={{ fontSize: '1.2rem', fontWeight: '700', textAlign: 'center' }}
                required
              />
              <button
                type="button"
                onClick={handleQuickNext}
                className="df-btn df-btn-sec"
                title="Avançar próximo número"
              >
                +1
              </button>
            </div>
          </div>

          <div className="df-field">
            <label>Local / Guichê / Mesa</label>
            <input
              type="text"
              value={desk}
              onChange={(e) => setDesk(e.target.value)}
              placeholder="Ex: Guichê 01, Recepção, Mesa 4"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <button type="submit" className="df-btn df-btn-pri" style={{ minWidth: '180px' }}>
            <Bell size={18} /> Chamar Senha na TV
          </button>

          <button
            type="button"
            onClick={() => playChimeSound()}
            className="df-btn df-btn-sec"
            title="Ouvir som sintetizado do gongo"
          >
            <Volume2 size={16} /> Testar Áudio
          </button>
        </div>
      </form>

      {history.length > 0 && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--line)' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--mute)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            Últimas Senhas Chamadas
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {history.map((item, idx) => (
              <span key={idx} className="df-chip df-chip-pri" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                <strong>{item.number}</strong> — {item.desk}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
