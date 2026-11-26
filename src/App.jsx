import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import Admin from './pages/Admin';
import TV from './pages/TV';
import Login from './pages/Login';
import PairingView from './pages/PairingView';
import Landing from './pages/Landing';
import { MonitorPlay } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (!isFirebaseConfigured) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0E1330 0%, #161C42 100%)',
        color: '#FFFFFF',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '1.5rem'
      }}>
        <div className="df-card" style={{
          maxWidth: '560px',
          width: '100%',
          padding: '2.5rem',
          textAlign: 'center',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(22, 28, 66, 0.85)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)'
        }}>
          <div style={{
            display: 'inline-flex',
            padding: '16px',
            background: 'rgba(127, 147, 240, 0.15)',
            color: '#7F93F0',
            borderRadius: '20px',
            marginBottom: '1rem'
          }}>
            <MonitorPlay size={44} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', color: '#FFFFFF' }}>
            Display<span style={{ color: '#7F93F0' }}>Flow</span>
          </h1>
          <div style={{
            display: 'inline-block',
            background: 'var(--warn-soft)',
            border: '1px solid var(--warn)',
            color: 'var(--warn-text)',
            padding: '0.35rem 1rem',
            borderRadius: '999px',
            fontSize: '0.82rem',
            fontWeight: '700',
            marginBottom: '1.25rem'
          }}>
            ⚙️ Conexão do Firebase Pendente
          </div>
          <p style={{ color: '#CBD5E1', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            O DisplayFlow está pronto para uso e limpo. Conecte seu Realtime Database inserindo suas credenciais em:
          </p>

          <div style={{
            background: 'rgba(14, 19, 48, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '1.5rem',
            fontSize: '0.88rem',
            lineHeight: '1.8',
            color: '#E4EAFA'
          }}>
            <div><strong>1.</strong> Abra o arquivo <code style={{ color: '#7F93F0' }}>src/firebase.js</code></div>
            <div><strong>2.</strong> Cole o bloco <code style={{ color: '#7F93F0' }}>firebaseConfig</code> do console do Firebase</div>
            <div><strong>3.</strong> Opcional: Cole sua chave do <code style={{ color: '#7F93F0' }}>ImgBB</code> em <code style={{ color: '#7F93F0' }}>IMGBB_API_KEY</code></div>
            <div><strong>4.</strong> Salve e a aplicação recarregará automaticamente! 🚀</div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--pri)', fontWeight: '600' }}>
        Carregando DisplayFlow...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing user={user} />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/admin" replace />} />
        <Route path="/admin" element={user ? <Admin user={user} /> : <Navigate to="/login" replace />} />
        
        {/* Rota da TV: Canal Geral / Principal */}
        <Route path="/tv/:uid" element={<TV />} />

        {/* Rota da TV: Display Específico */}
        <Route path="/tv/:uid/:displayId" element={<TV />} />

        {/* Rota de Emparelhamento por Código da TV */}
        <Route path="/pair" element={<PairingView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
