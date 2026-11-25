import { useState, useMemo } from 'react';
import { X, Sparkles, Tv, Tag } from 'lucide-react';
import { BUSINESS_SEGMENTS, CAMPAIGN_TEMPLATES } from '../../data/campaignTemplates';
import { broadcastToDisplays } from '../../services/displayService';
import { saveMediaToLibrary } from '../../services/mediaLibraryService';

export default function CampaignGalleryModal({
  isOpen,
  onClose,
  user,
  displays,
  selectedDisplayId,
  initialSegment = 'Todos os negócios',
  onApplied
}) {
  const [segmentFilter, setSegmentFilter] = useState(initialSegment);
  const [applyingId, setApplyingId] = useState(null);

  const filteredTemplates = useMemo(() => {
    if (!segmentFilter || segmentFilter === 'Todos os negócios') return CAMPAIGN_TEMPLATES;
    return CAMPAIGN_TEMPLATES.filter((t) => t.segment === segmentFilter);
  }, [segmentFilter]);

  if (!isOpen) return null;

  const handleApplyTemplate = async (tpl) => {
    setApplyingId(tpl.id);
    try {
      await saveMediaToLibrary(user.uid, {
        name: `${tpl.title} (${tpl.segment})`,
        url: tpl.imageUrl,
        type: 'image'
      });

      await broadcastToDisplays(user.uid, selectedDisplayId, 'background', {
        type: 'image',
        url: tpl.imageUrl,
        timestamp: Date.now()
      }, displays);

      await broadcastToDisplays(user.uid, selectedDisplayId, 'product', {
        name: tpl.title,
        desc: tpl.subtitle,
        price: tpl.price,
        visible: true,
        timestamp: Date.now()
      }, displays);

      if (tpl.announcement) {
        await broadcastToDisplays(user.uid, selectedDisplayId, 'announcement', {
          text: tpl.announcement,
          visible: true,
          timestamp: Date.now()
        }, displays);
      }

      onApplied?.(`Campanha "${tpl.title}" aplicada na TV e salva na sua biblioteca!`);
      onClose();
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(22, 27, 61, 0.55)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div className="df-card" style={{ maxWidth: '920px', width: '100%', maxHeight: '88vh', overflowY: 'auto', margin: 0, position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mute)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{ background: 'var(--tint)', color: 'var(--pri)', padding: '8px', borderRadius: '10px' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--ink)' }}>Galeria de Campanhas Prontas</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--mute)' }}>Escolha um modelo por segmento e publique em 1 clique com oferta em MTN.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {BUSINESS_SEGMENTS.map((seg) => (
            <button
              key={seg}
              type="button"
              onClick={() => setSegmentFilter(seg)}
              className={`df-btn ${segmentFilter === seg ? 'df-btn-pri' : 'df-btn-sec'}`}
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem', minHeight: 'auto' }}
            >
              {seg}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {filteredTemplates.map((tpl) => (
            <div key={tpl.id} style={{ border: '1px solid var(--line)', borderRadius: '12px', overflow: 'hidden', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#0F172A' }}>
                <img src={tpl.imageUrl} alt={tpl.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(15, 23, 42, 0.8)', color: '#FFF', fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '999px' }}>
                  {tpl.segment}
                </span>
                <span style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'var(--pri)', color: '#FFF', fontSize: '0.78rem', fontWeight: '800', padding: '3px 9px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Tag size={12} /> {tpl.price}
                </span>
              </div>
              <div style={{ padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>{tpl.title}</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--mute)', lineHeight: 1.4, flex: 1 }}>{tpl.subtitle}</p>
                <button
                  type="button"
                  disabled={applyingId === tpl.id}
                  onClick={() => handleApplyTemplate(tpl)}
                  className="df-btn df-btn-pri"
                  style={{ width: '100%', marginTop: '0.4rem', fontSize: '0.82rem', padding: '0.45rem' }}
                >
                  <Tv size={14} /> {applyingId === tpl.id ? 'Aplicando...' : 'Aplicar na TV'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
