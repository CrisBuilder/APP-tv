import { useState, useMemo } from 'react';
import { Tv, Plus, Copy, Trash2, ExternalLink, MapPin, Check, Search, Edit3, Sliders } from 'lucide-react';
import { deleteDisplay, updateDisplayMeta, updateDisplaySettings } from '../../services/displayService';

export default function DisplaysTab({
  displays = [],
  selectedDisplayId,
  setSelectedDisplayId,
  onOpenPairModal,
  user
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'recent' | 'offline'
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', location: '' });
  const [showAdjustments, setShowAdjustments] = useState(false);

  const now = Date.now();
  const hasRecentSignal = (d) => Boolean(d.lastSeen && now - d.lastSeen < 60000);

  const recentCount = displays.filter(hasRecentSignal).length;
  const offlineCount = displays.length - recentCount;

  const filteredDisplays = useMemo(() => {
    return displays.filter((d) => {
      const matchesSearch = !searchTerm.trim() ||
        (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.location || '').toLowerCase().includes(searchTerm.toLowerCase());
      const recent = hasRecentSignal(d);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'recent' && recent) || (statusFilter === 'offline' && !recent);
      return matchesSearch && matchesStatus;
    });
  }, [displays, searchTerm, statusFilter]);

  const handleCopyLink = (displayId) => {
    const url = `${window.location.origin}/tv/${user?.uid}/${displayId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(displayId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartEdit = (d) => {
    setEditingId(d.id);
    setEditForm({ name: d.name || '', location: d.location || '' });
  };

  const handleSaveEdit = async (displayId) => {
    await updateDisplayMeta(user.uid, displayId, editForm);
    setEditingId(null);
  };

  const handleDelete = async (display) => {
    if (window.confirm(`Tem certeza que deseja remover a tela "${display.name}"?`)) {
      await deleteDisplay(user.uid, display.id);
      if (selectedDisplayId === display.id) setSelectedDisplayId('all');
    }
  };

  const activeTargetDisplay = displays.find((d) => d.id === selectedDisplayId) || displays[0];

  const handleSettingChange = async (field, value) => {
    const targetIds = selectedDisplayId === 'all' ? displays.map((d) => d.id) : [selectedDisplayId];
    await Promise.all(targetIds.map((id) => updateDisplaySettings(user.uid, id, { [field]: value })));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--pri)', textTransform: 'uppercase' }}>TVs da sua loja</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--ink)' }}>Suas TVs, em um só lugar</h2>
          <p style={{ color: 'var(--mute)', fontSize: '0.88rem' }}>
            Acompanhe o sinal recente de cada tela, conecte novas TVs e ajuste a exibição.
          </p>
        </div>

        <button type="button" onClick={onOpenPairModal} className="df-btn df-btn-pri">
          <Plus size={18} /> Conectar TV
        </button>
      </div>

      {/* Resumo de Sinal */}
      <div className="df-card" style={{ marginBottom: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>TVs cadastradas</span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--ink)' }}>{displays.length}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>Com sinal recente</span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--ok-text)' }}>{recentCount}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>Sem sinal recente</span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--warn)' }}>{offlineCount}</div>
        </div>
      </div>

      {/* Busca & Filtro */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mute)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar pelo nome ou local da TV..."
            style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem', borderRadius: '8px', border: '1px solid var(--line)', background: '#FFFFFF' }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid var(--line)', background: '#FFFFFF', fontWeight: '600', fontSize: '0.85rem' }}
        >
          <option value="all">Todas as TVs</option>
          <option value="recent">Com sinal recente</option>
          <option value="offline">Sem sinal recente</option>
        </select>
      </div>

      {/* Grade de TVs */}
      <div className="df-grid-2">
        {filteredDisplays.map((display) => {
          const isSelected = selectedDisplayId === display.id;
          const isRecent = hasRecentSignal(display);
          const tvUrl = `${window.location.origin}/tv/${user?.uid}/${display.id}`;

          return (
            <div key={display.id} className="df-card" style={{ marginBottom: 0, border: isSelected ? '2px solid var(--pri)' : '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
                  <div style={{ background: isSelected ? 'var(--tint)' : 'var(--bg)', color: isSelected ? 'var(--pri)' : 'var(--mute)', padding: '8px', borderRadius: '10px' }}>
                    <Tv size={20} />
                  </div>

                  {editingId === display.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Nome da TV" style={{ padding: '3px 6px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid var(--pri)' }} />
                      <input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} placeholder="Local" style={{ padding: '3px 6px', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid var(--line)' }} />
                      <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                        <button type="button" onClick={() => handleSaveEdit(display.id)} className="df-btn df-btn-pri" style={{ padding: '2px 8px', fontSize: '0.74rem', minHeight: 'auto' }}>Salvar</button>
                        <button type="button" onClick={() => setEditingId(null)} className="df-btn df-btn-sec" style={{ padding: '2px 8px', fontSize: '0.74rem', minHeight: 'auto' }}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--ink)' }}>{display.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--mute)' }}>
                        <MapPin size={12} /> {display.location || 'Local não informado'}
                      </div>
                    </div>
                  )}
                </div>

                <span className={`df-chip ${isRecent ? 'df-chip-ok' : 'df-chip-warn'}`}>
                  {isRecent ? 'Sinal ativo' : 'Sem sinal recente'}
                </span>
              </div>

              <div style={{ background: 'var(--bg)', padding: '0.55rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', wordBreak: 'break-all', color: 'var(--mute)', marginBottom: '0.85rem' }}>
                <strong>Último sinal:</strong> {display.lastSeen ? new Date(display.lastSeen).toLocaleString() : 'Aguardando primeira conexão'}
                <div style={{ marginTop: '2px' }}><strong>Link:</strong> {tvUrl}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setSelectedDisplayId(display.id)} className={`df-btn ${isSelected ? 'df-btn-pri' : 'df-btn-sec'}`} style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
                  {isSelected ? '✓ Selecionada' : 'Selecionar'}
                </button>
                <button type="button" onClick={() => handleStartEdit(display)} className="df-btn df-btn-sec" style={{ padding: '0.4rem 0.6rem' }} title="Renomear / editar">
                  <Edit3 size={15} />
                </button>
                <button type="button" onClick={() => handleCopyLink(display.id)} className="df-btn df-btn-sec" style={{ padding: '0.4rem 0.6rem' }} title="Copiar URL">
                  {copiedId === display.id ? <Check size={15} color="var(--ok)" /> : <Copy size={15} />}
                </button>
                <a href={tvUrl} target="_blank" rel="noopener noreferrer" className="df-btn df-btn-sec" style={{ padding: '0.4rem 0.6rem' }} title="Abrir TV">
                  <ExternalLink size={15} />
                </a>
                <button type="button" onClick={() => handleDelete(display)} className="df-btn df-btn-bad" style={{ padding: '0.4rem 0.6rem' }} title="Remover">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel Expansível: Imagem e Relógio na TV */}
      {displays.length > 0 && (
        <div className="df-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowAdjustments(!showAdjustments)}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={16} color="var(--pri)" /> Imagem e relógio na TV
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--mute)' }}>Preenchimento da tela, posição e visibilidade do relógio.</p>
            </div>
            <span className="df-btn df-btn-sec" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
              {showAdjustments ? 'Fechar' : 'Ajustar'}
            </span>
          </div>

          {showAdjustments && activeTargetDisplay && (
            <div className="df-grid-2" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--line)' }}>
              <div className="df-field" style={{ marginBottom: 0 }}>
                <label>Preenchimento da Mídia</label>
                <select value={activeTargetDisplay.settings?.objectFit || 'cover'} onChange={(e) => handleSettingChange('objectFit', e.target.value)}>
                  <option value="cover">Preencher tela toda (Cover)</option>
                  <option value="contain">Ajustar sem cortar (Contain)</option>
                </select>
              </div>

              <div className="df-field" style={{ marginBottom: 0 }}>
                <label>Relógio na Tela da TV</label>
                <select value={activeTargetDisplay.settings?.clockPosition || 'top-right'} onChange={(e) => {
                  const val = e.target.value;
                  handleSettingChange('showClock', val !== 'hidden');
                  if (val !== 'hidden') handleSettingChange('clockPosition', val);
                }}>
                  <option value="top-right">Canto Superior Direito</option>
                  <option value="top-left">Canto Superior Esquerdo</option>
                  <option value="hidden">Ocultar Relógio</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
