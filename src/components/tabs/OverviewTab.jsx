import { useState, useEffect } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../../firebase';
import { Tv, Plus, Sparkles, CheckCircle2, Circle, AlertTriangle, ExternalLink, MonitorPlay } from 'lucide-react';
import { BUSINESS_SEGMENTS } from '../../data/campaignTemplates';
import { subscribeMediaLibrary } from '../../services/mediaLibraryService';
import { broadcastToDisplays } from '../../services/displayService';
import CampaignGalleryModal from './CampaignGalleryModal';

export default function OverviewTab({
  user,
  displays = [],
  selectedDisplayId,
  currentState = {},
  profile = {},
  onUpdateProfile,
  onNavigateTab,
  onOpenPairModal
}) {
  const [libraryItems, setLibraryItems] = useState([]);
  const [segment, setSegment] = useState(profile?.segment || 'Todos os negócios');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [urgentAlert, setUrgentAlert] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (profile?.segment) setSegment(profile.segment);
  }, [profile?.segment]);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeMediaLibrary(user.uid, setLibraryItems);
  }, [user?.uid]);

  const now = Date.now();
  const activeDisplaysCount = displays.filter((d) => d.lastSeen && now - d.lastSeen < 60000).length;
  const hasMedia = libraryItems.length > 0 || (currentState?.background?.type && currentState.background.type !== 'none');
  const hasTv = displays.length > 0;
  const hasHeartbeat = activeDisplaysCount > 0;
  const completedSteps = [hasMedia, hasTv, hasHeartbeat].filter(Boolean).length;

  const handleSegmentChange = async (newSeg) => {
    setSegment(newSeg);
    if (!user?.uid) return;
    await update(ref(db, `users/${user.uid}/profile`), { segment: newSeg });
    onUpdateProfile?.({ ...profile, segment: newSeg });
  };

  const handleSendUrgentAlert = async (e) => {
    e.preventDefault();
    if (!urgentAlert.trim()) return;
    await broadcastToDisplays(user.uid, 'all', 'announcement', {
      text: urgentAlert.trim(),
      badge: 'AVISO URGENTE',
      size: 'large',
      visible: true,
      timestamp: Date.now()
    }, displays);
    setUrgentAlert('');
    setFeedback('Aviso urgente enviado para todas as TVs!');
    setTimeout(() => setFeedback(''), 4000);
  };

  const tvPlayerUrl = selectedDisplayId && selectedDisplayId !== 'all'
    ? `${window.location.origin}/tv/${user?.uid}/${selectedDisplayId}`
    : `${window.location.origin}/tv/${user?.uid}`;

  const bg = currentState?.background;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--pri)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Visão Geral da Loja
          </span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--ink)' }}>
            Veja o que está nas suas TVs
          </h2>
          <p style={{ color: 'var(--mute)', fontSize: '0.88rem' }}>
            Confira a programação, métricas da operação e reprodução confirmada pelas telas conectadas.
          </p>
        </div>

        <button type="button" onClick={() => onNavigateTab('media')} className="df-btn df-btn-pri">
          <Plus size={18} /> Adicionar banner ou vídeo
        </button>
      </div>

      {feedback && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--ok-soft)', color: 'var(--ok-text)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-btn)', fontSize: '0.88rem', fontWeight: '600' }}>
          <CheckCircle2 size={18} /> {feedback}
        </div>
      )}

      {/* Checklist de Primeiros Passos */}
      <div className="df-card" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--mute)', textTransform: 'uppercase' }}>
              Seu caminho até a primeira exibição
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--ink)' }}>
              Coloque sua TV para funcionar
            </h3>
          </div>
          <span className="df-chip df-chip-pri">{completedSteps} de 3 etapas</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem', fontWeight: '700', fontSize: '0.9rem' }}>
              {hasMedia ? <CheckCircle2 size={16} color="var(--ok)" /> : <Circle size={16} color="var(--mute)" />}
              1. Escolha o que mostrar
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--mute)', marginBottom: '0.6rem' }}>
              Personalize um modelo ou envie sua imagem e vídeo.
            </p>
            <button type="button" onClick={() => onNavigateTab('media')} className="df-btn df-btn-sec" style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem', minHeight: 'auto' }}>
              Escolher um banner
            </button>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem', fontWeight: '700', fontSize: '0.9rem' }}>
              {hasTv ? <CheckCircle2 size={16} color="var(--ok)" /> : <Circle size={16} color="var(--mute)" />}
              2. Conecte uma TV
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--mute)', marginBottom: '0.6rem' }}>
              Abra /pair na TV e digite aqui o código ou leia o QR Code.
            </p>
            <button type="button" onClick={onOpenPairModal} className="df-btn df-btn-sec" style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem', minHeight: 'auto' }}>
              Conectar por código
            </button>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem', fontWeight: '700', fontSize: '0.9rem' }}>
              {hasHeartbeat ? <CheckCircle2 size={16} color="var(--ok)" /> : <Circle size={16} color="var(--mute)" />}
              3. Confirme a reprodução
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--mute)', marginBottom: '0.6rem' }}>
              O monitor confirma automaticamente quando a TV está online.
            </p>
            <button type="button" onClick={() => onNavigateTab('displays')} className="df-btn df-btn-sec" style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem', minHeight: 'auto' }}>
              Ver minhas TVs
            </button>
          </div>
        </div>
      </div>

      {/* Segmento do Negócio + Galeria */}
      <div className="df-card" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--mute)', textTransform: 'uppercase' }}>Feito para o seu negócio</span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--ink)' }}>Qual é o seu segmento?</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--mute)' }}>Encontre campanhas prontas que combinam com a sua operação.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <select
            value={segment}
            onChange={(e) => handleSegmentChange(e.target.value)}
            style={{ padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid var(--line)', fontWeight: '600', fontSize: '0.85rem', background: '#FFFFFF' }}
          >
            {BUSINESS_SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <button type="button" onClick={() => setIsGalleryOpen(true)} className="df-btn df-btn-pri">
            <Sparkles size={16} /> Explorar campanhas
          </button>
        </div>
      </div>

      {/* Monitor da Programação + Operação + Aviso Urgente */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div className="df-card" style={{ marginBottom: 0, gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MonitorPlay size={16} color="var(--pri)" /> Monitor da programação
            </span>
            <span className={`df-chip ${hasHeartbeat ? 'df-chip-ok' : 'df-chip-warn'}`}>
              {hasHeartbeat ? `${activeDisplaysCount} TV online` : 'Aguardando TV'}
            </span>
          </div>

          <div style={{ aspectRatio: '16 / 9', borderRadius: '12px', overflow: 'hidden', background: '#0F172A', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            {bg?.type === 'image' && bg.url && <img src={bg.url} alt="Monitor TV" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            {bg?.type === 'carousel' && bg.slides?.[0]?.url && <img src={bg.slides[0].url} alt="Monitor Carrossel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            {bg?.type === 'video' && bg.url && <video src={bg.url} muted autoPlay loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            {(!bg || bg.type === 'none') && (
              <div style={{ color: '#94A3B8', textAlign: 'center', padding: '1rem', fontSize: '0.82rem' }}>
                <Tv size={32} style={{ opacity: 0.4, marginBottom: '0.3rem' }} />
                <div>Sua próxima campanha aparece aqui.</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <a href={tvPlayerUrl} target="_blank" rel="noopener noreferrer" className="df-btn df-btn-sec" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
              <ExternalLink size={14} /> Abrir player
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="df-card" style={{ marginBottom: 0 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--mute)', textTransform: 'uppercase' }}>Um olhar na sua operação</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.75rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--mute)' }}>Mídias na biblioteca</span>
                <strong>{libraryItems.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--mute)' }}>Turnos agendados</span>
                <strong>{currentState?.schedule?.enabled ? (currentState.schedule.shifts?.length || 0) : 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--mute)' }}>TVs conectadas agora</span>
                <strong>{activeDisplaysCount} / {displays.length}</strong>
              </div>
            </div>
          </div>

          <div className="df-card" style={{ marginBottom: 0 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--warn)', textTransform: 'uppercase' }}>Precisa da atenção de todos?</span>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '0.25rem 0' }}>Um aviso. Todas as telas.</h4>
            <form onSubmit={handleSendUrgentAlert} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
              <input
                type="text"
                value={urgentAlert}
                onChange={(e) => setUrgentAlert(e.target.value)}
                placeholder="Digite um aviso urgente..."
                style={{ flex: 1, padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '0.82rem' }}
              />
              <button type="submit" className="df-btn df-btn-sec" style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}>
                <AlertTriangle size={14} color="var(--warn)" /> Transmitir
              </button>
            </form>
          </div>
        </div>
      </div>

      <CampaignGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        user={user}
        displays={displays}
        selectedDisplayId={selectedDisplayId}
        initialSegment={segment}
        onApplied={(msg) => {
          setFeedback(msg);
          setTimeout(() => setFeedback(''), 4000);
        }}
      />
    </div>
  );
}
