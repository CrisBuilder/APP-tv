import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, isFirebaseConfigured } from './firebase'
import Admin from './pages/Admin'
import TV from './pages/TV'
import Login from './pages/Login'

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
        background: 'linear-gradient(135deg, #090d16 0%, #0f172a 100%)',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '1.5rem'
      }}>
        <div style={{
          maxWidth: '580px',
          width: '100%',
          background: 'rgba(30, 41, 59, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📺</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: '#fff' }}>
            Signage.Pro
          </h1>
          <div style={{
            display: 'inline-block',
            background: 'rgba(234, 179, 8, 0.15)',
            border: '1px solid rgba(234, 179, 8, 0.35)',
            color: '#facc15',
            padding: '0.4rem 1rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: '600',
            marginBottom: '1.5rem'
          }}>
            ⚙️ Configuração do Firebase Pendente
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            O sistema está pronto para uso e limpo para o seu projeto. Conecte seu banco de dados seguindo 3 passos simples:
          </p>

          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            lineHeight: '1.8',
            color: '#cbd5e1'
          }}>
            <div><strong>1.</strong> Abra o arquivo <code style={{ color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '2px 6px', borderRadius: '4px' }}>src/firebase.js</code></div>
            <div><strong>2.</strong> Cole o seu bloco <code style={{ color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '2px 6px', borderRadius: '4px' }}>firebaseConfig</code> bruto gerado no Firebase</div>
            <div><strong>3.</strong> Cole sua chave do <code style={{ color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '2px 6px', borderRadius: '4px' }}>ImgBB</code> em <code style={{ color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '2px 6px', borderRadius: '4px' }}>IMGBB_API_KEY</code></div>
            <div><strong>4.</strong> Salve o arquivo e este painel recarregará automaticamente! 🚀</div>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Consulte o arquivo <strong>COMO-CONFIGURAR.md</strong> ou <strong>README.md</strong> na raiz para o guia ilustrado passo a passo.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>Carregando...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/admin" : "/login"} replace />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/admin" replace />} />
        <Route path="/admin" element={user ? <Admin user={user} /> : <Navigate to="/login" replace />} />
        {/* Agora a TV recebe o ID do usuário para saber qual painel escutar */}
        <Route path="/tv/:uid" element={<TV />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
