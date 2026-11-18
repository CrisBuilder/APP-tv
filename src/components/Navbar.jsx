import { Tv, Eye, Plus, ExternalLink, Smartphone } from 'lucide-react';

export default function Navbar({
  displays = [],
  selectedDisplayId,
  setSelectedDisplayId,
  onOpenPreview,
  onOpenPairModal,
  user
}) {
  const currentDisplay = displays.find((d) => d.id === selectedDisplayId);
  const activeTvUrl = selectedDisplayId === 'all'
    ? `${window.location.origin}/tv/${user?.uid}`
    : `${window.location.origin}/tv/${user?.uid}/${selectedDisplayId}`;

  return (
    <header className="df-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tv size={20} color="var(--pri)" />
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--mute)' }}>
            Canal de Transmissão:
          </span>
        </div>

        {/* Seletor Global de TV (Solução A) */}
        <select
          value={selectedDisplayId}
          onChange={(e) => setSelectedDisplayId(e.target.value)}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-btn)',
            border: '1px solid var(--line)',
            fontSize: '0.88rem',
            fontWeight: '600',
            color: 'var(--ink)',
            background: 'var(--card)',
            cursor: 'pointer'
          }}
        >
          <option value="all">📡 Todas as Telas Simultâneas</option>
          {displays.map((display) => (
            <option key={display.id} value={display.id}>
              📺 {display.name || `TV ${display.id}`} {display.location ? `(${display.location})` : ''}
            </option>
          ))}
        </select>

        {currentDisplay && (
          <span className={`df-chip ${currentDisplay.status === 'online' ? 'df-chip-ok' : 'df-chip-warn'}`}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: currentDisplay.status === 'online' ? 'var(--ok)' : 'var(--warn)'
            }} />
            {currentDisplay.status === 'online' ? 'Online' : 'Conectada'}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Botão de Emparelhar nova tela */}
        <button
          type="button"
          onClick={onOpenPairModal}
          className="df-btn df-btn-sec"
          style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
          title="Conectar uma nova TV por código ou link"
        >
          <Plus size={16} color="var(--pri)" />
          <span className="hide-on-mobile">Adicionar Tela</span>
        </button>

        {/* Botão de Live Preview */}
        <button
          type="button"
          onClick={onOpenPreview}
          className="df-btn df-btn-pri"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
          title="Ver o que está passando nesta TV agora"
        >
          <Eye size={16} />
          <span>Ver Preview</span>
        </button>

        {/* Link direto para a TV abrir em nova aba */}
        <a
          href={activeTvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="df-btn df-btn-sec"
          style={{ padding: '0.45rem 0.65rem' }}
          title="Abrir URL real da TV em tela cheia"
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </header>
  );
}
