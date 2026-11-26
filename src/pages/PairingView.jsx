import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { createPairingSession, listenPairingSession } from '../services/displayService';
import { MonitorPlay, CheckCircle2, RefreshCw } from 'lucide-react';

export default function PairingView() {
  const [session, setSession] = useState(null);
  const [pairedInfo, setPairedInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const startNewSession = useCallback(async () => {
    setLoading(true);
    try {
      const newSession = await createPairingSession();
      setSession(newSession);
    } catch (err) {
      console.error('Erro ao iniciar emparelhamento:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startNewSession();
  }, [startNewSession]);

  useEffect(() => {
    if (!session?.code) return;
    const unsubscribe = listenPairingSession(session.code, (data) => {
      setPairedInfo(data);
      setTimeout(() => {
        navigate(`/tv/${data.userId}/${data.displayId}`);
      }, 2000);
    });
    return () => unsubscribe();
  }, [session?.code, navigate]);

  const pairQrUrl = session?.code
    ? `${window.location.origin}/admin?pair=${session.code}`
    : window.location.origin;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0E1330 0%, #07091B 100%)',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      userSelect: 'none'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
        <img
          src="/favicon.png"
          alt="DisplayFlow"
          style={{ width: '56px', height: '56px', borderRadius: '50%', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
        />
        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
          Display<span style={{ color: '#7F93F0' }}>Flow</span>
        </h1>
      </div>

      {pairedInfo ? (
        <div style={{
          background: 'rgba(60, 171, 137, 0.15)',
          border: '2px solid #3CAB89',
          borderRadius: '24px',
          padding: '3rem',
          maxWidth: '600px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <CheckCircle2 size={64} color="#3CAB89" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Tela Conectada com Sucesso!
          </h2>
          <p style={{ color: '#E4EAFA', fontSize: '1.2rem' }}>
            Iniciando transmissão de conteúdo em instantes...
          </p>
        </div>
      ) : (
        <div style={{
          background: 'rgba(22, 28, 66, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(20px)',
          borderRadius: '28px',
          padding: '3rem 4rem',
          maxWidth: '680px',
          width: '100%',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
        }}>
          <p style={{ fontSize: '1.15rem', color: '#9AA1C4', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', marginBottom: '1.25rem' }}>
            Conecte esta TV pelo celular
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '16px', display: 'inline-flex' }}>
              <QRCodeSVG value={pairQrUrl} size={150} bgColor="#FFFFFF" fgColor="#0E1330" />
            </div>

            <div style={{
              background: 'rgba(14, 19, 48, 0.9)',
              border: '2px dashed #7F93F0',
              borderRadius: '20px',
              padding: '1.25rem 1.75rem',
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: '900',
              fontFamily: 'monospace',
              letterSpacing: '8px',
              color: '#EFAF4F',
              textShadow: '0 4px 20px rgba(239, 175, 79, 0.35)'
            }}>
              {loading ? '••••••' : session?.code || 'GERANDO'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#CBD5E1', fontSize: '1rem', lineHeight: '1.6', alignItems: 'center' }}>
            <p>1. Leia o QR Code com o celular ou acesse <strong>/admin</strong>.</p>
            <p>2. Clique em <strong>Adicionar Tela</strong> e confirme o código acima.</p>
            <button
              type="button"
              onClick={startNewSession}
              disabled={loading}
              style={{
                marginTop: '0.75rem', background: 'rgba(127, 147, 240, 0.15)', color: '#E4EAFA',
                border: '1px solid rgba(127, 147, 240, 0.4)', borderRadius: '999px',
                padding: '0.45rem 1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem'
              }}
            >
              <RefreshCw size={14} /> Gerar outro código
            </button>
            <p style={{ fontSize: '0.85rem', color: '#7F93F0', marginTop: '0.5rem' }}>
              Este código expira automaticamente em 10 minutos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
