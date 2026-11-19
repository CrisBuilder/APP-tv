import { useState } from 'react';
import { Upload, Plus, Trash2, PlaySquare, Video } from 'lucide-react';
import { broadcastToDisplays } from '../../services/displayService';
import { uploadVideoToStorage } from '../../services/videoStorageService';

export default function DirectVideoManager({ user, displays, targets, onFeedback }) {
  const [videoList, setVideoList] = useState([]);
  const [directVideoUrl, setDirectVideoUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploaded = await uploadVideoToStorage(user.uid, file, (percent) => {
        setUploadProgress(percent);
      });

      const newVideo = {
        id: `vid_${Date.now()}`,
        name: uploaded.name,
        url: uploaded.url
      };
      setVideoList((prev) => [...prev, newVideo]);
      onFeedback(`Vídeo "${uploaded.name}" carregado com sucesso!`);
    } catch (err) {
      alert('Erro no envio do vídeo: ' + (err.message || 'Falha no Storage.'));
    } finally {
      setUploading(false);
      setUploadProgress(null);
      e.target.value = null;
    }
  };

  const handleAddDirectUrl = (e) => {
    e.preventDefault();
    if (!directVideoUrl.trim()) return;

    const newVideo = {
      id: `vid_${Date.now()}`,
      name: `Vídeo ${videoList.length + 1}`,
      url: directVideoUrl.trim()
    };
    setVideoList((prev) => [...prev, newVideo]);
    setDirectVideoUrl('');
  };

  const handlePublish = async () => {
    if (videoList.length === 0) {
      alert('Adicione pelo menos um vídeo.');
      return;
    }

    const payload = videoList.length === 1
      ? { type: 'video', url: videoList[0].url, name: videoList[0].name, timestamp: Date.now() }
      : { type: 'video_playlist', items: videoList, timestamp: Date.now() };

    await broadcastToDisplays(user.uid, targets, 'background', payload, displays);
    onFeedback(
      videoList.length === 1
        ? 'Vídeo único transmitido em loop contínuo para as TVs!'
        : `Playlist de ${videoList.length} vídeos transmitida com avanço automático!`
    );
  };

  return (
    <div>
      <div className="df-grid-2" style={{ marginBottom: '1rem' }}>
        <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-btn)', border: '1px solid var(--line)' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
            <Upload size={14} color="var(--pri)" /> Carregar Vídeo do Dispositivo (MP4 / WebM)
          </label>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleUploadVideo}
            disabled={uploading}
            style={{ width: '100%', fontSize: '0.8rem' }}
          />
          {uploading && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--pri)' }}>
                Enviando: {uploadProgress}%
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--line)', borderRadius: '3px', overflow: 'hidden', marginTop: '3px' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--pri)', transition: 'width 0.2s' }} />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleAddDirectUrl} style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-btn)', border: '1px solid var(--line)' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>
            Ou Inserir Link Direto de Vídeo (.mp4)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="url"
              value={directVideoUrl}
              onChange={(e) => setDirectVideoUrl(e.target.value)}
              placeholder="https://exemplo.com/comercial.mp4"
              style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.82rem', borderRadius: '6px', border: '1px solid var(--line)' }}
            />
            <button type="submit" className="df-btn df-btn-sec" style={{ padding: '0.4rem 0.75rem', minHeight: 'auto', fontSize: '0.8rem' }}>
              <Plus size={14} /> Inserir
            </button>
          </div>
        </form>
      </div>

      {videoList.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--mute)', display: 'block', marginBottom: '0.5rem' }}>
            Vídeos na Fila ({videoList.length}):
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {videoList.map((item, idx) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--ink)' }}>
                  <PlaySquare size={16} color="var(--pri)" />
                  <strong>#{idx + 1}</strong> <span style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                </div>
                <button type="button" onClick={() => setVideoList(prev => prev.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bad)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handlePublish}
        disabled={videoList.length === 0}
        className="df-btn df-btn-pri"
        style={{ width: '100%' }}
      >
        <Video size={16} /> Transmitir {videoList.length > 1 ? `Playlist (${videoList.length} vídeos)` : 'Vídeo Único'} na TV
      </button>
    </div>
  );
}
