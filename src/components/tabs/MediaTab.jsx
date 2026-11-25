import { useState } from 'react';
import { Upload, Video, Trash2, Image as ImageIcon, Link as LinkIcon, Layers, CheckCircle2 } from 'lucide-react';
import { broadcastToDisplays } from '../../services/displayService';
import { saveMediaToLibrary } from '../../services/mediaLibraryService';
import DisplayTargetSelector from '../DisplayTargetSelector';
import CarouselManager from './CarouselManager';
import VideoManager from './VideoManager';
import MediaLibraryPanel from './MediaLibraryPanel';

export default function MediaTab({
  user,
  displays,
  selectedDisplayId,
  imgbbKey
}) {
  const [targets, setTargets] = useState(selectedDisplayId);
  const [mediaMode, setMediaMode] = useState('single'); // 'single' | 'carousel' | 'video'
  const [directImageUrl, setDirectImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const showFeedback = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleSingleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!imgbbKey) {
      alert('Configure sua chave de API do ImgBB na aba "Configurações" ou cole uma URL direta.');
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
        await saveMediaToLibrary(user.uid, {
          name: file.name,
          url: data.data.url,
          type: 'image',
          size: file.size
        });
        await broadcastToDisplays(user.uid, targets, 'background', {
          type: 'image',
          url: data.data.url,
          timestamp: Date.now()
        }, displays);
        showFeedback('Imagem única salva na biblioteca e transmitida para as TVs!');
      } else {
        alert('Erro no envio: ' + (data.error?.message || 'Falha no ImgBB'));
      }
    } catch {
      alert('Falha ao enviar imagem. Verifique sua conexão.');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleDirectImageSubmit = async (e) => {
    e.preventDefault();
    if (!directImageUrl.trim()) return;

    const cleanUrl = directImageUrl.trim();
    await saveMediaToLibrary(user.uid, {
      name: cleanUrl.split('/').pop()?.split('?')[0] || 'Imagem URL',
      url: cleanUrl,
      type: 'image'
    });

    await broadcastToDisplays(user.uid, targets, 'background', {
      type: 'image',
      url: cleanUrl,
      timestamp: Date.now()
    }, displays);

    showFeedback('Imagem única salva na biblioteca e transmitida para as TVs!');
    setDirectImageUrl('');
  };

  const handleBroadcastFromLibrary = async (item) => {
    if (item.type === 'image') {
      await broadcastToDisplays(user.uid, targets, 'background', {
        type: 'image',
        url: item.url,
        timestamp: Date.now()
      }, displays);
      showFeedback(`Imagem "${item.name}" transmitida para as TVs!`);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Deseja remover a mídia de fundo da(s) tela(s)?')) {
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
          Defina o visual principal da tela: imagem única, carrossel rotativo ou reprodução de vídeos diretos e do YouTube.
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

      {/* Seletor de Modo de Mídia */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--line)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setMediaMode('single')}
          className={`df-btn ${mediaMode === 'single' ? 'df-btn-pri' : 'df-btn-sec'}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
        >
          <ImageIcon size={16} /> Imagem Única
        </button>

        <button
          type="button"
          onClick={() => setMediaMode('carousel')}
          className={`df-btn ${mediaMode === 'carousel' ? 'df-btn-pri' : 'df-btn-sec'}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
        >
          <Layers size={16} /> Carrossel de Imagens
        </button>

        <button
          type="button"
          onClick={() => setMediaMode('video')}
          className={`df-btn ${mediaMode === 'video' ? 'df-btn-pri' : 'df-btn-sec'}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
        >
          <Video size={16} /> Vídeos (Upload / YouTube)
        </button>
      </div>

      {/* Modo: Imagem Única */}
      {mediaMode === 'single' && (
        <>
          <div className="df-grid-2">
            <div style={{ background: 'var(--bg)', padding: '1.25rem', borderRadius: 'var(--radius-card)', border: '1px solid var(--line)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                <Upload size={18} color="var(--pri)" /> Upload do Celular/PC
              </h4>
              <input
                type="file"
                accept="image/*"
                onChange={handleSingleImageUpload}
                disabled={uploading}
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
              {uploading && <p style={{ marginTop: '0.5rem', color: 'var(--pri)', fontSize: '0.85rem', fontWeight: '600' }}>Enviando imagem...</p>}
            </div>

            <div style={{ background: 'var(--bg)', padding: '1.25rem', borderRadius: 'var(--radius-card)', border: '1px solid var(--line)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                <LinkIcon size={18} color="var(--pri)" /> Inserir por URL Direta
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
                  Aplicar Imagem
                </button>
              </form>
            </div>
          </div>

          <MediaLibraryPanel
            user={user}
            filterType="image"
            onBroadcastMedia={handleBroadcastFromLibrary}
          />
        </>
      )}

      {/* Modo: Carrossel Rotativo */}
      {mediaMode === 'carousel' && (
        <CarouselManager
          user={user}
          displays={displays}
          targets={targets}
          imgbbKey={imgbbKey}
          onFeedback={showFeedback}
        />
      )}

      {/* Modo: Gerenciador Avançado de Vídeos (Upload e YouTube) */}
      {mediaMode === 'video' && (
        <VideoManager
          user={user}
          displays={displays}
          targets={targets}
          onFeedback={showFeedback}
        />
      )}

      <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={handleClear} className="df-btn df-btn-bad">
          <Trash2 size={16} /> Limpar Mídia da TV
        </button>
      </div>
    </div>
  );
}
