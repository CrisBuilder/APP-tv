import { useState } from 'react';
import { Tv, Check } from 'lucide-react';

export default function DisplayTargetSelector({
  displays = [],
  globalTarget,
  selectedTargets,
  onChangeTargets
}) {
  const [mode, setMode] = useState('sync'); // 'sync' = usar topo, 'custom' = escolher telas

  const handleToggle = (id) => {
    let next;
    if (id === 'all') {
      next = selectedTargets.includes('all') ? [] : ['all'];
    } else {
      const filtered = selectedTargets.filter((t) => t !== 'all');
      next = filtered.includes(id) ? filtered.filter((t) => t !== id) : [...filtered, id];
      if (next.length === displays.length) next = ['all'];
    }
    onChangeTargets(next.length === 0 ? 'all' : next);
  };

  return (
    <div style={{
      background: 'var(--bg)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-btn)',
      padding: '0.75rem 1rem',
      marginBottom: '1.25rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: '700', color: 'var(--ink)' }}>
          <Tv size={15} color="var(--pri)" />
          <span>Destino desta Publicação:</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`df-chip ${mode === 'sync' ? 'df-chip-pri' : ''}`}
            onClick={() => { setMode('sync'); onChangeTargets(globalTarget); }}
            style={{ border: 'none', cursor: 'pointer' }}
          >
            Usar seleção do topo
          </button>
          <button
            type="button"
            className={`df-chip ${mode === 'custom' ? 'df-chip-pri' : ''}`}
            onClick={() => setMode('custom')}
            style={{ border: 'none', cursor: 'pointer' }}
          >
            Personalizar
          </button>
        </div>
      </div>

      {mode === 'sync' ? (
        <div style={{ fontSize: '0.8rem', color: 'var(--mute)' }}>
          {globalTarget === 'all'
            ? 'Transmitindo para: 📡 Todas as Telas simultaneamente'
            : `Transmitindo para a tela selecionada: 📺 ${displays.find((d) => d.id === globalTarget)?.name || 'TV Ativa'}`}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={() => handleToggle('all')}
            className={`df-btn df-btn-sec ${selectedTargets.includes('all') ? 'active' : ''}`}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.78rem',
              background: selectedTargets.includes('all') ? 'var(--tint)' : '#FFFFFF',
              borderColor: selectedTargets.includes('all') ? 'var(--pri)' : 'var(--line)',
              color: selectedTargets.includes('all') ? 'var(--pri)' : 'var(--ink)'
            }}
          >
            {selectedTargets.includes('all') && <Check size={14} />} Todas as Telas
          </button>

          {displays.map((d) => {
            const isChecked = selectedTargets.includes('all') || selectedTargets.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => handleToggle(d.id)}
                className="df-btn df-btn-sec"
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.78rem',
                  background: isChecked ? 'var(--tint)' : '#FFFFFF',
                  borderColor: isChecked ? 'var(--pri)' : 'var(--line)',
                  color: isChecked ? 'var(--pri)' : 'var(--ink)'
                }}
              >
                {isChecked && <Check size={14} />} {d.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
