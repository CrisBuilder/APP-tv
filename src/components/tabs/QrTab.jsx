import { useState } from 'react';
import { QrCode, CheckCircle2, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { broadcastToDisplays } from '../../services/displayService';
import DisplayTargetSelector from '../DisplayTargetSelector';

export default function QrTab({
  user,
  displays,
  selectedDisplayId,
  initialUrl = ''
}) {
  const [targets, setTargets] = useState(selectedDisplayId);
  const [url, setUrl] = useState(initialUrl);
  const [statusMsg, setStatusMsg] = useState('');

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      alert('Informe o link para o QR Code.');
      return;
    }

    await broadcastToDisplays(user.uid, targets, 'qrCode', {
      url: url.trim(),
      visible: true,
      timestamp: Date.now()
    }, displays);

    setStatusMsg('QR Code exibido na TV com sucesso!');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleClear = async () => {
    await broadcastToDisplays(user.uid, targets, 'qrCode', {
      url: '',
      visible: false
    }, displays);
    setUrl('');
    setStatusMsg('QR Code ocultado da TV.');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  return (
    <div className="df-card">
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--ink)' }}>
          QR Code Dinâmico (Interação Rápida)
        </h3>
        <p style={{ color: 'var(--mute)', fontSize: '0.88rem' }}>
          Conecte a tela ao smartphone dos seus clientes: aponte a câmera para acessar cardápios digitais, WhatsApp, promoções ou redes sociais.
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

      <div className="df-grid-2">
        <form onSubmit={handlePublish}>
          <div className="df-field">
            <label>Link de Destino do QR Code</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://wa.me/258840000000 ou link do site"
              required
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>
              Pode ser um link de WhatsApp, Instagram, cardápio PDF ou website.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button type="submit" className="df-btn df-btn-pri" style={{ minWidth: '150px' }}>
              <QrCode size={16} /> Exibir QR na TV
            </button>

            <button type="button" onClick={handleClear} className="df-btn df-btn-sec">
              <Trash2 size={16} color="var(--bad)" /> Ocultar da TV
            </button>
          </div>
        </form>

        {/* Pré-visualização do QR Code */}
        <div style={{
          background: 'var(--bg)',
          borderRadius: 'var(--radius-card)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--line)'
        }}>
          {url ? (
            <>
              <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                <QRCodeSVG value={url} size={140} bgColor="#FFFFFF" fgColor="#161B3D" />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--mute)', marginTop: '0.75rem' }}>
                Pré-visualização do QR Code
              </span>
            </>
          ) : (
            <p style={{ color: 'var(--mute)', fontSize: '0.85rem', textAlign: 'center' }}>
              Digite um link ao lado para gerar o código visual.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
