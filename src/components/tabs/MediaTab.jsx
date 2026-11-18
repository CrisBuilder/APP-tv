import { useState } from 'react';
import { Upload, Video, Trash2, Image as ImageIcon, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { broadcastToDisplays } from '../../services/displayService';
import DisplayTargetSelector from '../DisplayTargetSelector';

export default function MediaTab({
  user,
  displays,
  selectedDisplayId,
  imgbbKey
}) {
  const [targets, setTargets] = useState(selectedDisplayId);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [directImageUrl, setDirectImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const showFeedback = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!imgbbKey) {
      alert('Configure sua chave de API do ImgBB na aba "Configurações" ou cole uma URL direta abaixo.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (data.success) {
        await broadcastToDisplays(user.uid, targets, 'background', {
          type: 'image',
          url: data.data.url,
          timestamp: Date.now()
        }, displays);
        showFeedback('Imagem transmitida com sucesso para as TVs!');
      } else {
        alert('Erro no envio: ' + (data.error?.message || 'Falha no ImgBB'));
      }
    } catch (err) {
      alert('Falha ao enviar imagem. Verifique sua conexão.');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleDirectImageSubmit = async (e) => {
    e.preventDefault();
    if (!directImageUrl) return;

    await broadcastToDisplays(user.uid, targets, 'background', {
      type: 'image',
      url: directImageUrl.trim(),
      timestamp: Date.now()
    }, displays);

    showFeedback('Imagem direta transmitida para as TVs!');
    setDirectImageUrl('');
  };

  const handleYoutubeSubmit = async (e) => {
    e.preventDefault();
    if (!youtubeLink) return;

    let videoId = '';
    try {
      if (youtubeLink.includes('youtu.be/')) {
        videoId = youtubeLink.split('youtu.be/')[1].split('?')[0];
      } else if (youtubeLink.includes('youtube.com/watch')) {
        const url = new URL(youtubeLink);
        videoId = url.searchParams.get('v');
      } else {
        videoId = youtubeLink.trim();
      }

      if (!videoId) throw new Error('ID não encontrado');

      await broadcastToDisplays(user.uid, targets, 'background', {
        type: 'youtube',
        videoId,
        timestamp: Date.now()
      }, displays);

      showFeedback('Vídeo do YouTube transmitido em loop para as TVs!');
      setYoutubeLink('');
    } catch {
      alert('Link do YouTube inválido. Ex: https://www.youtube.com/watch?v=...');
    }
  };

  const handleClear = async () => {
    if (window.confirm('Deseja remover a mídia de fundo da(s) tela(s) selecionada(s)?')) {
      await broadcastToDisplays(user.uid, targets, 'background', { type: 'none' }, displays);
      showFeedback('Fundo limpo na(s) TV(s)!');
    }
  };

  return (
    <div className="df-card">
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--ink)' }}>
          Mídia de Fundo (Imagens & Vídeos)
        </h3>
        <p style={{ color: 'var(--mute)', fontSize: '0.88rem' }}>
          Defina o visual principal que será exibido em tela cheia na sua rede de TVs.
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
        {/* Upload de Imagem */}
        <div style={{ background: 'var(--bg)', padding: '1.25rem', borderRadius: 'var(--radius-card)', border: '1px solid var(--line)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem' }}>
            <Upload size={18} color="var(--pri)" /> Enviar Imagem do Celular/PC
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '1rem' }}>
            Formatos recomendados: JPG, PNG ou WEBP em 1080p ou 4K.
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            style={{ width: '100%', fontSize: '0.85rem' }}
          />
          {uploading && <p style={{ marginTop: '0.5rem', color: 'var(--pri)', fontSize: '0.85rem', fontWeight: '600' }}>Enviando imagem...</p>}
        </div>

        {/* Link Direto de Imagem */}
        <div style={{ background: 'var(--bg)', padding: '1.25rem', borderRadius: 'var(--radius-card)', border: '1px solid var(--line)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem' }}>
            <LinkIcon size={18} color="var(--pri)" /> Inserir URL Direta de Imagem
          </h4>
          <form onSubmit={handleDirectImageSubmit}>
            <div className="df-field">
              <input
                type="url"
                value={directImageUrl}
                onChange={(e) => setDirectImageUrl(e.target.value)}
                placeholder="https://exemplo.com/banner.jpg"
                required
              />
            </div>
            <button type="submit" className="df-btn df-btn-sec" style={{ width: '100%' }}>
              Aplicar Imagem por URL
            </button>
          </form>
        </div>
      </div>

      {/* Transmitir Vídeo do YouTube */}
      <div style={{ marginTop: '1.25rem', background: 'var(--bg)', padding: '1.25rem', borderRadius: 'var(--radius-card)', border: '1px solid var(--line)' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          <Video size={18} color="var(--pri)" /> Vídeo do YouTube em Loop Contínuo
        </h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '1rem' }}>
          Ideal para vídeos institucionais, trailers de lançamentos e playlists que tocam sem parar.
        </p>
        <form onSubmit={handleYoutubeSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            placeholder="Cole o link: https://www.youtube.com/watch?v=..."
            style={{ flex: 1, minWidth: '220px', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-btn)', border: '1px solid var(--line)' }}
            required
          />
          <button type="submit" className="df-btn df-btn-pri">
            Transmitir Vídeo
          </button>
        </form>
      </div>

      <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={handleClear} className="df-btn df-btn-bad">
          <Trash2 size={16} /> Remover Fundo da TV
        </button>
      </div>
    </div>
  );
}
