import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';
import { playChimeSound } from '../services/audioService';

export default function TV() {
  const { uid, displayId } = useParams();

  const [state, setState] = useState({
    background: { type: 'none' },
    qrCode: { visible: false, url: '' },
    announcement: { visible: false, text: '' },
    product: { visible: false, name: '', desc: '', price: '' },
    ticket: { visible: false, number: '', desk: '', timestamp: 0 }
  });

  const [time, setTime] = useState(new Date());
  const [showTicket, setShowTicket] = useState(false);

  // Relógio de precisão
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Escuta em tempo real do Firebase (Suporta rota de display específico ou global)
  useEffect(() => {
    if (!uid) return;

    // Se temos displayId específico, escutamos esse display; senão, o nó geral
    const targetPath = displayId
      ? `users/${uid}/displays/${displayId}/state`
      : `users/${uid}/displayState`;

    const stateRef = ref(db, targetPath);
    const unsubscribe = onValue(stateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setState((prev) => ({ ...prev, ...data }));
      }
    });

    return () => unsubscribe();
  }, [uid, displayId]);

  // Chamada de Senha com Áudio Nativo Sintetizado (Offline)
  useEffect(() => {
    if (state.ticket?.timestamp && state.ticket?.visible) {
      playChimeSound();
      setShowTicket(true);
      const timer = setTimeout(() => setShowTicket(false), 12000);
      return () => clearTimeout(timer);
    }
  }, [state.ticket?.timestamp, state.ticket?.visible]);

  if (!uid) {
    return (
      <div style={{ color: '#FFFFFF', padding: '2rem', textAlign: 'center', background: '#000000', height: '100vh' }}>
        Identificação da TV não informada na URL.
      </div>
    );
  }

  return (
    <div className="tv-container">
      {/* Camada de Mídia de Fundo */}
      <div className="tv-background">
        {state.background?.type === 'image' && (
          <img src={state.background.url} alt="Fundo DisplayFlow" className="tv-media" />
        )}

        {state.background?.type === 'youtube' && (
          <iframe
            className="tv-iframe"
            src={`https://www.youtube.com/embed/${state.background.videoId}?autoplay=1&controls=0&modestbranding=1&loop=1&playlist=${state.background.videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="DisplayFlow YouTube Background"
          />
        )}
      </div>

      {/* Relógio de Canto */}
      <div className="tv-clock-widget">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>

      {/* Camada de Overlays Cinematográficos */}
      <div className="tv-overlay-layer">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '100%' }}>
          {/* Card de Produto / Oferta */}
          {state.product?.visible && (
            <div className="tv-product-widget">
              <h1 className="tv-product-name">{state.product.name}</h1>
              {state.product.desc && <p className="tv-product-desc">{state.product.desc}</p>}
              <div className="tv-product-price">{state.product.price}</div>
            </div>
          )}

          {!state.product?.visible && <div />}

          {/* Widget de QR Code */}
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

      {/* Modal de Senha Chamada com Estilo DisplayFlow */}
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

      {/* Letreiro Rotativo Noticiário */}
      {state.announcement?.visible && state.announcement.text && (
        <div className="tv-banner-container">
          <div className="tv-banner-text">
            {state.announcement.text} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {state.announcement.text}
          </div>
        </div>
      )}
    </div>
  );
}
