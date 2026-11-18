import { useState } from 'react';
import { Tv, Plus, Copy, Trash2, ExternalLink, MapPin, Check } from 'lucide-react';
import { deleteDisplay } from '../../services/displayService';

export default function DisplaysTab({
  displays = [],
  selectedDisplayId,
  setSelectedDisplayId,
  onOpenPairModal,
  user
}) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyLink = (displayId) => {
    const url = `${window.location.origin}/tv/${user?.uid}/${displayId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(displayId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (display) => {
    if (window.confirm(`Tem certeza que deseja remover a tela "${display.name}"?`)) {
      await deleteDisplay(user.uid, display.id);
      if (selectedDisplayId === display.id) {
        setSelectedDisplayId('all');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--ink)' }}>Minhas Telas & Displays</h2>
          <p style={{ color: 'var(--mute)', fontSize: '0.88rem' }}>
            Gerencie todas as Smart TVs e monitores da sua rede em tempo real.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenPairModal}
          className="df-btn df-btn-pri"
        >
          <Plus size={18} />
          <span>Conectar Nova Tela</span>
        </button>
      </div>

      {displays.length === 0 ? (
        <div className="df-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{
            display: 'inline-flex', padding: '16px', background: 'var(--tint)',
            color: 'var(--pri)', borderRadius: '20px', marginBottom: '1rem'
          }}>
            <Tv size={40} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--ink)' }}>
            Nenhuma tela conectada ainda
          </h3>
          <p style={{ color: 'var(--mute)', fontSize: '0.9rem', maxWidth: '420px', margin: '0.5rem auto 1.5rem auto' }}>
            Conecte sua primeira Smart TV abrindo <code>/pair</code> na TV ou adicionando manualmente pelo nome.
          </p>
          <button type="button" onClick={onOpenPairModal} className="df-btn df-btn-pri">
            <Plus size={16} /> Adicionar Minha Primeira TV
          </button>
        </div>
      ) : (
        <div className="df-grid-2">
          {displays.map((display) => {
            const isSelected = selectedDisplayId === display.id;
            const tvUrl = `${window.location.origin}/tv/${user?.uid}/${display.id}`;

            return (
              <div
                key={display.id}
                className="df-card"
                style={{
                  border: isSelected ? '2px solid var(--pri)' : '1px solid var(--line)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      background: isSelected ? 'var(--tint)' : 'var(--bg)',
                      color: isSelected ? 'var(--pri)' : 'var(--mute)',
                      padding: '8px', borderRadius: '10px'
                    }}>
                      <Tv size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--ink)' }}>
                        {display.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--mute)' }}>
                        <MapPin size={12} /> {display.location || 'Sem localização'}
                      </div>
                    </div>
                  </div>

                  <span className={`df-chip ${display.status === 'online' ? 'df-chip-ok' : 'df-chip-warn'}`}>
                    {display.status === 'online' ? 'Online' : 'Conectada'}
                  </span>
                </div>

                <div style={{ background: 'var(--bg)', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', wordBreak: 'break-all', color: 'var(--mute)', marginBottom: '1rem' }}>
                  <strong>Link da TV:</strong> {tvUrl}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedDisplayId(display.id)}
                    className={`df-btn ${isSelected ? 'df-btn-pri' : 'df-btn-sec'}`}
                    style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
                  >
                    {isSelected ? '✓ Tela Selecionada' : 'Selecionar Tela'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(display.id)}
                    className="df-btn df-btn-sec"
                    style={{ padding: '0.45rem 0.65rem' }}
                    title="Copiar URL para abrir na TV"
                  >
                    {copiedId === display.id ? <Check size={16} color="var(--ok)" /> : <Copy size={16} />}
                  </button>

                  <a
                    href={tvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="df-btn df-btn-sec"
                    style={{ padding: '0.45rem 0.65rem' }}
                    title="Abrir TV em tela cheia"
                  >
                    <ExternalLink size={16} />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDelete(display)}
                    className="df-btn df-btn-bad"
                    style={{ padding: '0.45rem 0.65rem' }}
                    title="Remover esta TV"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
