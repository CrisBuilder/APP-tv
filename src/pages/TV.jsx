import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';
import { playChimeSound } from '../services/audioService';
import { sendDisplayHeartbeat } from '../services/displayService';

export default function TV() {
  const { uid, displayId } = useParams();
  const cacheKey = `df_tv_cache_${uid}_${displayId || 'default'}`;

  const [state, setState] = useState(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : {
        background: { type: 'none' },
        qrCode: { visible: false, url: '' },
        announcement: { visible: false, text: '' },
        product: { visible: false, name: '', desc: '', price: '' },
        ticket: { visible: false, number: '', desk: '', timestamp: 0 },
        schedule: { enabled: false, shifts: [] }
      };
    } catch {
      return { background: { type: 'none' } };
    }
  });

  const [time, setTime] = useState(new Date());
  const [showTicket, setShowTicket] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const [displaySettings, setDisplaySettings] = useState({ objectFit: 'cover', showClock: true, clockPosition: 'top-right' });
  const videoRef = useRef(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!uid) return;

    const targetPath = displayId
      ? `users/${uid}/displays/${displayId}/state`
      : `users/${uid}/displayState`;

    const stateRef = ref(db, targetPath);
    const unsubscribe = onValue(stateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setState((prev) => {
          const merged = { ...prev, ...data };
          try {
            localStorage.setItem(cacheKey, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    });

    return () => unsubscribe();
  }, [uid, displayId, cacheKey]);

  // Heartbeat periódico & Ajustes da TV (Imagem e Relógio)
  useEffect(() => {
    if (!uid || !displayId) return;

    sendDisplayHeartbeat(uid, displayId).catch(() => {});
    const hbInterval = setInterval(() => {
      sendDisplayHeartbeat(uid, displayId).catch(() => {});
    }, 25000);

    const settingsRef = ref(db, `users/${uid}/displays/${displayId}/settings`);
    const unsubSettings = onValue(settingsRef, (snap) => {
      if (snap.exists()) {
        setDisplaySettings((prev) => ({ ...prev, ...snap.val() }));
      }
    });

    return () => {
      clearInterval(hbInterval);
      unsubSettings();
    };
  }, [uid, displayId]);

  useEffect(() => {
    if (state.ticket?.timestamp && state.ticket?.visible) {
      playChimeSound();
      setShowTicket(true);
      const timer = setTimeout(() => setShowTicket(false), 12000);
      return () => clearTimeout(timer);
    }
  }, [state.ticket?.timestamp, state.ticket?.visible]);

  // Avaliação de Turnos vs Fundo Padrão
  const activeBackground = useMemo(() => {
    if (state.schedule?.enabled && Array.isArray(state.schedule.shifts) && state.schedule.shifts.length > 0) {
      const currentHours = String(time.getHours()).padStart(2, '0');
      const currentMinutes = String(time.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      const activeShift = state.schedule.shifts.find((s) => {
        if (!s.start || !s.end || !s.mediaUrl) return false;
        if (s.start <= s.end) return currentTimeStr >= s.start && currentTimeStr < s.end;
        return currentTimeStr >= s.start || currentTimeStr < s.end;
      });

      if (activeShift) {
        return { type: 'image', url: activeShift.mediaUrl, shiftName: activeShift.name };
      }
    }
    return state.background || { type: 'none' };
  }, [state.schedule, state.background, time]);

  // Rotação do Carrossel de Imagens
  useEffect(() => {
    if (activeBackground?.type === 'carousel' && Array.isArray(activeBackground.slides) && activeBackground.slides.length > 1) {
      const durationMs = (activeBackground.durationSec || 10) * 1000;
      const interval = setInterval(() => {
        setCarouselIndex((prev) => (prev + 1) % activeBackground.slides.length);
      }, durationMs);
      return () => clearInterval(interval);
    }
  }, [activeBackground]);

  // Avanço automático na Playlist de Vídeos Diretos
  const handleDirectVideoEnded = () => {
    if (activeBackground?.type === 'video_playlist' && Array.isArray(activeBackground.items) && activeBackground.items.length > 1) {
      setVideoIndex((prev) => (prev + 1) % activeBackground.items.length);
    }
  };

  // Resetar índices ao receber uma nova transmissão
  useEffect(() => {
    setCarouselIndex(0);
    setVideoIndex(0);
  }, [activeBackground?.timestamp, activeBackground?.type]);

  // Garantir reprodução automática em navegadores de Smart TV
  useEffect(() => {
    if ((activeBackground?.type === 'video' || activeBackground?.type === 'video_playlist') && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback silencioso caso o navegador exija interação; muted já está ativo
        });
      }
    }
  }, [activeBackground, videoIndex]);

  // URL para Playlist do YouTube
  const youtubePlaylistUrl = useMemo(() => {
    if (activeBackground?.type === 'youtube_playlist' && Array.isArray(activeBackground.videoIds) && activeBackground.videoIds.length > 0) {
      const firstId = activeBackground.videoIds[0];
      const playlistParam = activeBackground.videoIds.join(',');
      return `https://www.youtube.com/embed/${firstId}?autoplay=1&controls=0&mute=1&playsinline=1&rel=0&loop=1&playlist=${playlistParam}`;
    }
    return null;
  }, [activeBackground]);

  if (!uid) {
    return <div style={{ color: '#fff', padding: '2rem', textAlign: 'center', background: '#000', height: '100vh' }}>ID da TV ausente.</div>;
  }

  return (
    <div className="tv-container">
      {/* Camada de Mídia: Imagem, Carrossel, Vídeo Direto ou YouTube */}
      <div className="tv-background" style={{ '--tv-object-fit': displaySettings.objectFit || 'cover' }}>
        {activeBackground?.type === 'carousel' && activeBackground.slides?.length > 0 && (
          <img
            key={activeBackground.slides[carouselIndex % activeBackground.slides.length]?.url}
            src={activeBackground.slides[carouselIndex % activeBackground.slides.length]?.url}
            alt="Carrossel DisplayFlow"
            className="tv-media"
            style={{ animation: 'fadeIn 0.7s ease' }}
          />
        )}

        {activeBackground?.type === 'image' && activeBackground.url && (
          <img src={activeBackground.url} alt="Fundo DisplayFlow" className="tv-media" />
        )}

        {activeBackground?.type === 'video' && activeBackground.url && (
          <video
            ref={videoRef}
            key={activeBackground.url}
            src={activeBackground.url}
            className="tv-media"
            autoPlay
            muted
            loop
            playsInline
          />
        )}

        {activeBackground?.type === 'video_playlist' && activeBackground.items?.length > 0 && (
          <video
            ref={videoRef}
            key={activeBackground.items[videoIndex % activeBackground.items.length]?.url}
            src={activeBackground.items[videoIndex % activeBackground.items.length]?.url}
            className="tv-media"
            autoPlay
            muted
            loop={activeBackground.items.length === 1}
            playsInline
            onEnded={handleDirectVideoEnded}
            onError={handleDirectVideoEnded}
          />
        )}

        {activeBackground?.type === 'youtube' && (
          <iframe
            key={activeBackground.videoId}
            className="tv-iframe"
            src={`https://www.youtube.com/embed/${activeBackground.videoId}?autoplay=1&controls=0&mute=1&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${activeBackground.videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="DisplayFlow YouTube"
          />
        )}

        {activeBackground?.type === 'youtube_playlist' && youtubePlaylistUrl && (
          <iframe
            className="tv-iframe"
            src={youtubePlaylistUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="DisplayFlow YouTube Playlist"
          />
        )}
      </div>

      {/* Relógio & Indicador Offline */}
      {displaySettings.showClock !== false && (
        <div
          className="tv-clock-widget"
          style={displaySettings.clockPosition === 'top-left' ? { left: '1.5rem', right: 'auto' } : undefined}
        >
          {!isOnline && (
            <span style={{ fontSize: '0.65rem', background: '#E65B64', padding: '2px 8px', borderRadius: '10px', marginRight: '8px', verticalAlign: 'middle' }}>
              MODO OFFLINE
            </span>
          )}
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

      {/* Overlays Cinematográficos */}
      <div className="tv-overlay-layer">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '100%' }}>
          {state.product?.visible && (
            <div className="tv-product-widget">
              <h1 className="tv-product-name">{state.product.name}</h1>
              {state.product.desc && <p className="tv-product-desc">{state.product.desc}</p>}
              <div className="tv-product-price">{state.product.price}</div>
            </div>
          )}

          {!state.product?.visible && <div />}

          {state.qrCode?.visible && state.qrCode.url && (
            <div className="tv-qr-widget" style={{ marginTop: 'auto', marginBottom: state.announcement?.visible ? '4.5rem' : '0' }}>
              <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '12px' }}>
                <QRCodeSVG value={state.qrCode.url} size={130} bgColor="#FFFFFF" fgColor="#000000" />
              </div>
              <span>Aponte a Câmera</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Senha */}
      {showTicket && state.ticket && (
        <div className="tv-ticket-modal">
          <div className="tv-ticket-content">
            <h2 style={{ fontSize: '2.2rem', color: '#7F93F0', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Senha Chamada
            </h2>
            <div style={{ fontSize: 'clamp(5rem, 12vw, 9rem)', fontWeight: '900', lineHeight: '1', color: '#FFFFFF', marginBottom: '0.75rem' }}>
              {state.ticket.number}
            </div>
            {state.ticket.desk && (
              <div style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '600', color: '#EFAF4F' }}>
                {state.ticket.desk}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Letreiro */}
      {state.announcement?.visible && state.announcement.text && (
        <div className="tv-banner-container" style={{ display: 'flex', alignItems: 'center' }}>
          {state.announcement.badge && (
            <span style={{
              background: '#263DA7', color: '#FFFFFF', fontWeight: '800',
              fontSize: '0.85rem', padding: '0.35rem 0.9rem', borderRadius: '6px',
              marginLeft: '1rem', flexShrink: 0, zIndex: 2, letterSpacing: '0.5px'
            }}>
              {state.announcement.badge}
            </span>
          )}
          <div
            className="tv-banner-text"
            style={{
              fontSize: state.announcement.size === 'large'
                ? 'clamp(1.5rem, 3vw, 2.3rem)'
                : state.announcement.size === 'small'
                  ? 'clamp(0.95rem, 1.6vw, 1.3rem)'
                  : undefined
            }}
          >
            {state.announcement.text} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {state.announcement.text}
          </div>
        </div>
      )}
    </div>
  );
}
