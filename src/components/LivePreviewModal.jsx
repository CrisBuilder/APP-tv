import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';
import { X, Tv, ExternalLink } from 'lucide-react';

export default function LivePreviewModal({ isOpen, onClose, user, displays = [], initialDisplayId = 'all' }) {
  const [activeDisplayId, setActiveDisplayId] = useState(initialDisplayId);
  const [state, setState] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setActiveDisplayId(initialDisplayId);
  }, [initialDisplayId]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isOpen || !user?.uid) return;

    const path = activeDisplayId === 'all' || !activeDisplayId
      ? `users/${user.uid}/displayState`
      : `users/${user.uid}/displays/${activeDisplayId}/state`;

    const stateRef = ref(db, path);
    const unsubscribe = onValue(stateRef, (snapshot) => {
      setState(snapshot.val() || {});
    });

    return () => unsubscribe();
  }, [isOpen, user, activeDisplayId]);

  if (!isOpen) return null;

  const currentDisplay = displays.find((d) => d.id === activeDisplayId);
  const tvUrl = activeDisplayId === 'all'
    ? `${window.location.origin}/tv/${user?.uid}`
    : `${window.location.origin}/tv/${user?.uid}/${activeDisplayId}`;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(7, 9, 27, 0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      {/* Barra de Controle Superior do Modal */}
      <div style={{
        maxWidth: '1000px', width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: '#FFFFFF', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Tv size={20} color="#7F93F0" />
            <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Preview da Tela:</span>
          </div>

          <select
            value={activeDisplayId}
            onChange={(e) => setActiveDisplayId(e.target.value)}
            style={{
              background: '#161C42', border: '1px solid #272F5E', color: '#FFFFFF',
              padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600'
            }}
          >
            <option value="all">📡 Transmissão Geral (Todas)</option>
            {displays.map((d) => (
              <option key={d.id} value={d.id}>📺 {d.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <a
            href={tvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="df-btn df-btn-sec"
            style={{ background: '#161C42', color: '#FFFFFF', borderColor: '#272F5E', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          >
            <ExternalLink size={14} /> Abrir TV Real
          </a>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '6px' }}
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Moldura de Smart TV (16:9) */}
      <div style={{
        maxWidth: '1000px', width: '100%',
        aspectRatio: '16 / 9',
        background: '#000000',
        borderRadius: '20px',
        border: '8px solid #1E293B',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(38, 61, 167, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        color: '#FFFFFF'
      }}>
        {/* Fundo da TV */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
          {state?.background?.type === 'image' && (
            <img src={state.background.url} alt="Fundo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}

          {state?.background?.type === 'youtube' && (
            <iframe
              style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
              src={`https://www.youtube.com/embed/${state.background.videoId}?autoplay=1&controls=0&mute=1&loop=1&playlist=${state.background.videoId}`}
              title="YouTube Preview"
            />
          )}

          {(!state?.background || state?.background?.type === 'none') && (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #090D1A 0%, #161C42 100%)', color: '#64748B' }}>
              <Tv size={48} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.9rem' }}>Nenhuma imagem ou vídeo ativo no fundo</p>
            </div>
          )}
        </div>

        {/* Relógio do Canto */}
        <div style={{ position: 'absolute', top: '1rem', right: '1.25rem', background: 'rgba(14, 19, 48, 0.8)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '700', zIndex: 10, border: '1px solid rgba(255,255,255,0.15)' }}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* Overlays (Produto e QR) */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', zIndex: 10, pointerEvents: 'none' }}>
          {state?.product?.visible && (
            <div style={{ alignSelf: 'flex-start', background: 'rgba(14, 19, 48, 0.85)', backdropFilter: 'blur(10px)', padding: '1rem 1.25rem', borderRadius: '16px', borderLeft: '4px solid #7F93F0', maxWidth: '40%' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', lineHeight: 1.2 }}>{state.product.name}</h4>
              {state.product.desc && <p style={{ fontSize: '0.75rem', color: '#CBD5E1', margin: '4px 0' }}>{state.product.desc}</p>}
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#EFAF4F' }}>{state.product.price}</div>
            </div>
          )}

          {!state?.product?.visible && <div />}

          {state?.qrCode?.visible && state?.qrCode?.url && (
            <div style={{ alignSelf: 'flex-end', marginBottom: state?.announcement?.visible ? '3rem' : '0', background: 'rgba(14, 19, 48, 0.85)', padding: '8px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ background: '#FFFFFF', padding: '4px', borderRadius: '6px' }}>
                <QRCodeSVG value={state.qrCode.url} size={65} bgColor="#FFFFFF" fgColor="#000000" />
              </div>
              <span style={{ fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase', color: '#CBD5E1' }}>Acesse</span>
            </div>
          )}
        </div>

        {/* Letreiro na Parte Inferior */}
        {state?.announcement?.visible && state?.announcement?.text && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(14, 19, 48, 0.9)', padding: '0.5rem 0', zIndex: 20, overflow: 'hidden' }}>
            <div className="tv-banner-text" style={{ fontSize: '0.9rem' }}>
              {state.announcement.text} &nbsp;&nbsp; • &nbsp;&nbsp; {state.announcement.text}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
