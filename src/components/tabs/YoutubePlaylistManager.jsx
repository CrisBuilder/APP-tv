import { useState } from 'react';
import { Plus, Trash2, ListVideo, Video } from 'lucide-react';
import { broadcastToDisplays } from '../../services/displayService';
import { extractYoutubeId } from '../../services/videoStorageService';
import { saveMediaToLibrary } from '../../services/mediaLibraryService';
import MediaLibraryPanel from './MediaLibraryPanel';

export default function YoutubePlaylistManager({ user, displays, targets, onFeedback }) {
  const [youtubeList, setYoutubeList] = useState([]);
  const [youtubeInput, setYoutubeInput] = useState('');

  const handleAddYoutubeLink = async (e) => {
    e.preventDefault();
    const videoId = extractYoutubeId(youtubeInput);
    if (!videoId) {
      alert('Link do YouTube inválido.');
      return;
    }

    const cleanLink = youtubeInput.trim();
    await saveMediaToLibrary(user.uid, {
      name: `YouTube (${videoId})`,
      url: cleanLink,
      videoId,
      type: 'youtube'
    });

    const newItem = {
      id: `yt_${Date.now()}`,
      videoId,
      originalLink: cleanLink
    };
    setYoutubeList((prev) => [...prev, newItem]);
    setYoutubeInput('');
  };

  const handleSelectFromLibrary = (item) => {
    if (!item.videoId) return;
    setYoutubeList((prev) => [
      ...prev,
      { id: `yt_${Date.now()}`, videoId: item.videoId, originalLink: item.url }
    ]);
  };

  const handleBroadcastSingleFromLibrary = async (item) => {
    if (!item.videoId) return;
    await broadcastToDisplays(user.uid, targets, 'background', {
      type: 'youtube',
      videoId: item.videoId,
      timestamp: Date.now()
    }, displays);
    onFeedback(`Vídeo do YouTube (${item.videoId}) transmitido para as TVs!`);
  };

  const handlePublish = async () => {
    if (youtubeList.length === 0) {
      alert('Adicione pelo menos um vídeo do YouTube.');
      return;
    }

    const payload = youtubeList.length === 1
      ? { type: 'youtube', videoId: youtubeList[0].videoId, timestamp: Date.now() }
      : { type: 'youtube_playlist', videoIds: youtubeList.map((y) => y.videoId), timestamp: Date.now() };

    await broadcastToDisplays(user.uid, targets, 'background', payload, displays);
    onFeedback(
      youtubeList.length === 1
        ? 'Vídeo do YouTube transmitido em loop para as TVs!'
        : `Playlist com ${youtubeList.length} vídeos do YouTube transmitida para as TVs!`
    );
  };

  return (
    <div>
      <form onSubmit={handleAddYoutubeLink} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={youtubeInput}
          onChange={(e) => setYoutubeInput(e.target.value)}
          placeholder="Cole o link do YouTube (watch, youtu.be ou Shorts)..."
          style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid var(--line)', background: '#FFFFFF' }}
        />
        <button type="submit" className="df-btn df-btn-sec" style={{ minWidth: '120px' }}>
          <Plus size={16} /> Adicionar
        </button>
      </form>

      {youtubeList.length > 0 ? (
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--mute)', display: 'block', marginBottom: '0.5rem' }}>
            Fila de Reprodução do YouTube ({youtubeList.length}):
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
            {youtubeList.map((item, idx) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                  <Video size={16} color="#DC2626" />
                  <strong>#{idx + 1}</strong>
                  <span style={{ color: 'var(--mute)' }}>ID: {item.videoId}</span>
                </div>
                <button type="button" onClick={() => setYoutubeList(prev => prev.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bad)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ color: 'var(--mute)', fontSize: '0.82rem', marginBottom: '1rem' }}>
          Nenhum vídeo do YouTube adicionado. Cole um ou mais links acima para criar uma fila de exibição contínua.
        </p>
      )}

      <button
        type="button"
        onClick={handlePublish}
        disabled={youtubeList.length === 0}
        className="df-btn df-btn-pri"
        style={{ width: '100%' }}
      >
        <ListVideo size={16} /> Transmitir {youtubeList.length > 1 ? `Playlist do YouTube (${youtubeList.length} vídeos)` : 'Vídeo do YouTube'} na TV
      </button>

      <MediaLibraryPanel
        user={user}
        filterType="youtube"
        selectLabel="À Fila"
        onSelectMedia={handleSelectFromLibrary}
        onBroadcastMedia={handleBroadcastSingleFromLibrary}
      />
    </div>
  );
}
