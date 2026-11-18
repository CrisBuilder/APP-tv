import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPairingSession, listenPairingSession } from '../services/displayService';
import { MonitorPlay, CheckCircle2 } from 'lucide-react';

export default function PairingView() {
  const [session, setSession] = useState(null);
  const [pairedInfo, setPairedInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe = () => {};

    async function initSession() {
      try {
        const newSession = await createPairingSession();
        setSession(newSession);
        setLoading(false);

        // Ouve a ativação pelo admin no painel
        unsubscribe = listenPairingSession(newSession.code, (data) => {
          setPairedInfo(data);
          // Redireciona para a tela do display após 2 segundos de sucesso
          setTimeout(() => {
            navigate(`/tv/${data.userId}/${data.displayId}`);
          }, 2000);
        });
      } catch (err) {
        console.error('Erro ao iniciar emparelhamento:', err);
        setLoading(false);
      }
    }

    initSession();
    return () => unsubscribe();
  }, [navigate]);

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{
          background: 'rgba(127, 147, 240, 0.2)',
          color: '#7F93F0',
          padding: '12px',
          borderRadius: '16px',
          border: '1px solid rgba(127, 147, 240, 0.4)'
        }}>
          <MonitorPlay size={36} />
        </div>
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
          <p style={{ fontSize: '1.15rem', color: '#9AA1C4', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', marginBottom: '1rem' }}>
            Código de Emparelhamento
          </p>

          <div style={{
            background: 'rgba(14, 19, 48, 0.9)',
            border: '2px dashed #7F93F0',
            borderRadius: '20px',
            padding: '1.5rem',
            fontSize: 'clamp(3rem, 7vw, 5.5rem)',
            fontWeight: '900',
            fontFamily: 'monospace',
            letterSpacing: '10px',
            color: '#EFAF4F',
            textShadow: '0 4px 20px rgba(239, 175, 79, 0.35)',
            marginBottom: '1.5rem'
          }}>
            {loading ? '••••••' : session?.code || 'GERANDO'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#CBD5E1', fontSize: '1.05rem', lineHeight: '1.6' }}>
            <p>1. Acesse o painel <strong>DisplayFlow</strong> no seu smartphone ou computador.</p>
            <p>2. Clique em <strong>Adicionar Tela</strong> e insira o código de 6 caracteres acima.</p>
            <p style={{ fontSize: '0.85rem', color: '#7F93F0', marginTop: '0.5rem' }}>
              Este código expira automaticamente em 10 minutos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
