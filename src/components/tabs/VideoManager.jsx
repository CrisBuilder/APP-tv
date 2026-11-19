import { useState } from 'react';
import { Upload, ListVideo } from 'lucide-react';
import DirectVideoManager from './DirectVideoManager';
import YoutubePlaylistManager from './YoutubePlaylistManager';

export default function VideoManager({ user, displays, targets, onFeedback }) {
  const [videoType, setVideoType] = useState('upload'); // 'upload' | 'youtube'

  return (
    <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-card)', padding: '1.25rem', border: '1px solid var(--line)' }}>
      {/* Seletor entre Vídeo Direto (Upload/MP4) e YouTube */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--line)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setVideoType('upload')}
          className={`df-btn ${videoType === 'upload' ? 'df-btn-pri' : 'df-btn-sec'}`}
          style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}
        >
          <Upload size={15} /> Upload de Vídeo (PC/Celular & MP4)
        </button>

        <button
          type="button"
          onClick={() => setVideoType('youtube')}
          className={`df-btn ${videoType === 'youtube' ? 'df-btn-pri' : 'df-btn-sec'}`}
          style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}
        >
          <ListVideo size={15} /> Múltiplos Vídeos do YouTube
        </button>
      </div>

      {videoType === 'upload' ? (
        <DirectVideoManager
          user={user}
          displays={displays}
          targets={targets}
          onFeedback={onFeedback}
        />
      ) : (
        <YoutubePlaylistManager
          user={user}
          displays={displays}
          targets={targets}
          onFeedback={onFeedback}
        />
      )}
    </div>
  );
}
