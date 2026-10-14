import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';

export default function TV() {
  const { uid } = useParams(); // Pega o ID do cliente da URL
  
  const [state, setState] = useState({
    background: { type: 'none' },
    qrCode: { visible: false, url: '' },
    announcement: { visible: false, text: '' },
    product: { visible: false, name: '', desc: '', price: '' },
    ticket: { visible: false, number: '', desk: '', timestamp: 0 }
  });

  const [time, setTime] = useState(new Date());
  const [showTicket, setShowTicket] = useState(false);

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to specific user's database path
  useEffect(() => {
    if (!uid) return;
    
    const displayRef = ref(db, `users/${uid}/displayState`);
    const unsubscribe = onValue(displayRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setState((prevState) => ({ ...prevState, ...data }));
      }
    });

    return () => unsubscribe();
  }, [uid]);

  // Ticket Pop-up & Audio Logic
  useEffect(() => {
    if (state.ticket?.timestamp && state.ticket?.visible) {
      // Tocar som
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log('Audio blocked by browser:', e));
      
      // Mostrar popup
      setShowTicket(true);
      
      // Ocultar após 15 segundos
      const timer = setTimeout(() => setShowTicket(false), 15000);
      return () => clearTimeout(timer);
    }
  }, [state.ticket?.timestamp]);

  if (!uid) {
    return <div style={{ color: 'white', padding: '2rem' }}>ID da TV não fornecido na URL.</div>;
  }

  return (
    <div className="tv-container">
      
      {/* BACKGROUND LAYER */}
      <div className="tv-background">
        {state.background?.type === 'image' && (
          <img src={state.background.url} alt="Background" className="tv-media" />
        )}
        
        {state.background?.type === 'youtube' && (
          <iframe
            className="tv-iframe"
            src={`https://www.youtube.com/embed/${state.background.videoId}?autoplay=1&controls=0&modestbranding=1&loop=1&playlist=${state.background.videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        )}
      </div>

      {/* CLOCK WIDGET */}
      <div className="tv-clock-widget">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>

      {/* OVERLAYS LAYER */}
      <div className="tv-overlay-layer">
        
        {/* Top/Middle Area - Could be Product */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '100%' }}>
          
          {/* Product Widget */}
          {state.product?.visible && (
            <div className="tv-product-widget">
              <h1 className="tv-product-name">{state.product.name}</h1>
              {state.product.desc && <p className="tv-product-desc">{state.product.desc}</p>}
              <div className="tv-product-price">{state.product.price}</div>
            </div>
          )}

          {/* Spacer if no product */}
          {!state.product?.visible && <div></div>}

          {/* QR Code Widget */}
          {state.qrCode?.visible && state.qrCode.url && (
            <div className="tv-qr-widget" style={{ marginTop: 'auto', marginBottom: state.announcement?.visible ? '4rem' : '0' }}>
              <QRCodeSVG value={state.qrCode.url} size={150} bgColor={"#ffffff"} fgColor={"#000000"} />
              <span>Acesse Aqui</span>
            </div>
          )}
        </div>

      </div>

      {/* TICKET / SENHA OVERLAY (CENTERED) */}
      {showTicket && state.ticket && (
        <div className="tv-ticket-modal">
          <div className="tv-ticket-content">
            <h2 style={{ fontSize: '2rem', color: 'var(--accent-color)', marginBottom: '1rem', textTransform: 'uppercase' }}>
              Senha Chamada
            </h2>
            <div style={{ fontSize: '7rem', fontWeight: '900', lineHeight: '1', marginBottom: '1rem' }}>
              {state.ticket.number}
            </div>
            {state.ticket.desk && (
              <div style={{ fontSize: '3rem', fontWeight: '600', color: '#cbd5e1' }}>
                {state.ticket.desk}
              </div>
            )}
          </div>
        </div>
      )}

      {/* BANNER LAYER (Bottom) */}
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
