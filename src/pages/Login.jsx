import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/admin');
    } catch (error) {
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {isRegister ? 'Criar Nova Conta' : 'Login - Signage.Pro'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.2)' }}
            />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.2)' }}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Aguarde...' : (isRegister ? 'Registrar' : 'Entrar')}
          </button>
        </form>
        <p 
          style={{ textAlign: 'center', marginTop: '1.5rem', cursor: 'pointer', color: 'var(--accent-color)', fontSize: '0.9rem' }} 
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? 'Já tenho conta. Fazer Login.' : 'Não tem conta? Registre-se agora.'}
        </p>
      </div>
    </div>
  );
}
