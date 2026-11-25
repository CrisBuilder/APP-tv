import { useState } from 'react';
import { Upload, Plus, Trash2, Clock, CheckCircle2, Layers } from 'lucide-react';
import { broadcastToDisplays } from '../../services/displayService';
import { saveMediaToLibrary } from '../../services/mediaLibraryService';
import MediaLibraryPanel from './MediaLibraryPanel';

export default function CarouselManager({
  user,
  displays,
  targets,
  imgbbKey,
  onFeedback
}) {
  const [slides, setSlides] = useState([]);
  const [durationSec, setDurationSec] = useState(10);
  const [uploading, setUploading] = useState(false);
  const [directUrl, setDirectUrl] = useState('');

  const handleAddUploadedImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!imgbbKey) {
      alert('Configure sua chave de API do ImgBB na aba Configurações ou adicione por URL direta abaixo.');
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
        const newSlide = {
          id: `slide_${Date.now()}`,
          url: data.data.url,
          name: file.name
        };
        setSlides((prev) => [...prev, newSlide]);
      } else {
        alert('Erro ao enviar imagem: ' + (data.error?.message || 'Falha'));
      }
    } catch {
      alert('Falha ao enviar arquivo. Verifique sua conexão.');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleAddDirectUrl = async (e) => {
    e.preventDefault();
    if (!directUrl.trim()) return;

    const cleanUrl = directUrl.trim();
    const slideName = `Slide ${slides.length + 1}`;
    await saveMediaToLibrary(user.uid, {
      name: cleanUrl.split('/').pop()?.split('?')[0] || slideName,
      url: cleanUrl,
      type: 'image'
    });

    const newSlide = {
      id: `slide_${Date.now()}`,
      url: cleanUrl,
      name: slideName
    };
    setSlides((prev) => [...prev, newSlide]);
    setDirectUrl('');
  };

  const handleSelectFromLibrary = (item) => {
    setSlides((prev) => [
      ...prev,
      { id: `slide_${Date.now()}`, url: item.url, name: item.name }
    ]);
  };

  const handleRemoveSlide = (index) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublishCarousel = async () => {
    if (slides.length === 0) {
      alert('Adicione pelo menos uma imagem ao carrossel.');
      return;
    }

    const payload = {
      type: 'carousel',
      slides,
      durationSec: Number(durationSec) || 10,
      timestamp: Date.now()
    };

    await broadcastToDisplays(user.uid, targets, 'background', payload, displays);
    onFeedback(`Carrossel com ${slides.length} imagens transmitido com sucesso (troca a cada ${durationSec}s)!`);
  };

  return (
    <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-card)', padding: '1.25rem', border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--pri)" />
          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--ink)' }}>
            Construtor de Carrossel Rotativo
          </h4>
        </div>

        {/* Duração de exibição por slide */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <Clock size={15} color="var(--pri)" />
          <span style={{ fontWeight: '600' }}>Tempo por slide:</span>
          <select
            value={durationSec}
            onChange={(e) => setDurationSec(Number(e.target.value))}
            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--line)', background: '#FFFFFF', fontWeight: '600' }}
          >
            <option value={5}>5 segundos</option>
            <option value={8}>8 segundos</option>
            <option value={10}>10 segundos (Recomendado)</option>
            <option value={15}>15 segundos</option>
            <option value={20}>20 segundos</option>
            <option value={30}>30 segundos</option>
          </select>
        </div>
      </div>

      {/* Adicionar Imagens ao Carrossel */}
      <div className="df-grid-2" style={{ marginBottom: '1.25rem' }}>
        <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-btn)', border: '1px solid var(--line)' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
            <Upload size={14} color="var(--pri)" /> Upload de Imagem do Celular/PC
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAddUploadedImage}
            disabled={uploading}
            style={{ width: '100%', fontSize: '0.8rem' }}
          />
          {uploading && <p style={{ fontSize: '0.78rem', color: 'var(--pri)', marginTop: '4px' }}>Enviando slide...</p>}
        </div>

        <form onSubmit={handleAddDirectUrl} style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-btn)', border: '1px solid var(--line)' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>
            Ou Adicionar via Link de Imagem
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="url"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              placeholder="https://exemplo.com/banner.jpg"
              style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.82rem', borderRadius: '6px', border: '1px solid var(--line)' }}
            />
            <button type="submit" className="df-btn df-btn-sec" style={{ padding: '0.4rem 0.75rem', minHeight: 'auto', fontSize: '0.8rem' }}>
              <Plus size={14} /> Inserir
            </button>
          </div>
        </form>
      </div>

      {/* Grade de Slides Adicionados */}
      {slides.length > 0 ? (
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--mute)', display: 'block', marginBottom: '0.5rem' }}>
            Slides no Carrossel ({slides.length}):
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {slides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                style={{
                  position: 'relative',
                  aspectRatio: '16 / 9',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '2px solid var(--line)',
                  background: '#000000'
                }}
              >
                <img
                  src={slide.url}
                  alt={`Slide ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', top: '4px', left: '4px',
                  background: 'rgba(0,0,0,0.6)', color: '#FFFFFF',
                  fontSize: '0.7rem', fontWeight: '700', padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  #{idx + 1}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSlide(idx)}
                  style={{
                    position: 'absolute', top: '4px', right: '4px',
                    background: 'rgba(230,91,100,0.9)', color: '#FFFFFF',
                    border: 'none', borderRadius: '50%', width: '22px', height: '22px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                  title="Remover slide"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--mute)', fontSize: '0.85rem' }}>
          Nenhum slide adicionado. Adicione 2 ou mais imagens acima para criar a rotação automática.
        </div>
      )}

      <button
        type="button"
        onClick={handlePublishCarousel}
        disabled={slides.length === 0}
        className="df-btn df-btn-pri"
        style={{ width: '100%' }}
      >
        <Layers size={16} /> Publicar Carrossel nas TVs ({slides.length} slides)
      </button>

      <MediaLibraryPanel
        user={user}
        filterType="image"
        selectLabel="Ao Carrossel"
        onSelectMedia={handleSelectFromLibrary}
      />
    </div>
  );
}
