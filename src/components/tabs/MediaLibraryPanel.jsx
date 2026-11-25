import { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, PlaySquare, Edit3, Trash2, Check, X, Tv, PlusCircle, FolderOpen } from 'lucide-react';
import { subscribeMediaLibrary, updateMediaItem, deleteMediaItem } from '../../services/mediaLibraryService';

export default function MediaLibraryPanel({
  user,
  filterType = 'all',
  onSelectMedia,
  onBroadcastMedia,
  selectLabel = 'Adicionar'
}) {
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState(filterType);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    setActiveFilter(filterType);
  }, [filterType]);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeMediaLibrary(user.uid, setItems);
  }, [user?.uid]);

  const filteredItems = items.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name || '');
  };

  const handleSaveEdit = async (itemId) => {
    if (!editName.trim()) return;
    await updateMediaItem(user.uid, itemId, { name: editName.trim() });
    setEditingId(null);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Excluir "${item.name}" da biblioteca?`)) return;
    await deleteMediaItem(user.uid, item.id, item.storagePath);
  };

  return (
    <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FolderOpen size={18} color="var(--pri)" />
          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--ink)' }}>
            Biblioteca de Mídia Salva ({filteredItems.length})
          </h4>
        </div>

        {filterType === 'all' && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'Todos' },
              { id: 'image', label: 'Imagens' },
              { id: 'video', label: 'Vídeos' },
              { id: 'youtube', label: 'YouTube' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`df-btn ${activeFilter === f.id ? 'df-btn-pri' : 'df-btn-sec'}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', minHeight: 'auto' }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.25rem', background: 'var(--bg)', borderRadius: 'var(--radius-btn)', border: '1px dashed var(--line)', color: 'var(--mute)', fontSize: '0.84rem' }}>
          Nenhum arquivo salvo nesta categoria. Ao fazer upload ou adicionar um link, ele ficará salvo aqui para reutilização e edição.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.75rem' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--line)',
                borderRadius: '10px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Thumbnail */}
              <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#0F172A', overflow: 'hidden' }}>
                {item.type === 'image' && (
                  <img src={item.url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                {item.type === 'video' && (
                  <video src={item.url} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                {item.type === 'youtube' && (
                  <img
                    src={`https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                <span style={{
                  position: 'absolute', top: '6px', left: '6px',
                  background: 'rgba(15, 23, 42, 0.8)', color: '#FFFFFF',
                  padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700',
                  display: 'flex', alignItems: 'center', gap: '3px'
                }}>
                  {item.type === 'image' && <><ImageIcon size={10} /> IMG</>}
                  {item.type === 'video' && <><Video size={10} /> MP4</>}
                  {item.type === 'youtube' && <><PlaySquare size={10} /> YT</>}
                </span>
              </div>

              {/* Nome & Ações */}
              <div style={{ padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {editingId === item.id ? (
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ flex: 1, fontSize: '0.78rem', padding: '3px 6px', borderRadius: '4px', border: '1px solid var(--pri)', minWidth: 0 }}
                    />
                    <button type="button" onClick={() => handleSaveEdit(item.id)} style={{ background: 'none', border: 'none', color: 'var(--ok-text)', cursor: 'pointer' }} title="Salvar">
                      <Check size={14} />
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', color: 'var(--mute)', cursor: 'pointer' }} title="Cancelar">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                    <span title={item.name} style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <button type="button" onClick={() => handleStartEdit(item)} style={{ background: 'none', border: 'none', color: 'var(--mute)', cursor: 'pointer' }} title="Renomear">
                        <Edit3 size={13} />
                      </button>
                      <button type="button" onClick={() => handleDelete(item)} style={{ background: 'none', border: 'none', color: 'var(--bad)', cursor: 'pointer' }} title="Excluir">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.35rem', marginTop: 'auto' }}>
                  {onSelectMedia && (
                    <button
                      type="button"
                      onClick={() => onSelectMedia(item)}
                      className="df-btn df-btn-sec"
                      style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.74rem', minHeight: 'auto' }}
                    >
                      <PlusCircle size={13} /> {selectLabel}
                    </button>
                  )}
                  {onBroadcastMedia && (
                    <button
                      type="button"
                      onClick={() => onBroadcastMedia(item)}
                      className="df-btn df-btn-pri"
                      style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.74rem', minHeight: 'auto' }}
                    >
                      <Tv size={13} /> Exibir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
