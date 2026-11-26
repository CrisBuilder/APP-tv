import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { MonitorPlay, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/admin');
    } catch (error) {
      let msg = 'Ocorreu um erro ao processar seu acesso.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        msg = 'Email ou senha incorretos.';
      } else if (error.code === 'auth/email-already-in-use') {
        msg = 'Este email já está cadastrado no DisplayFlow.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'A senha deve conter pelo menos 6 caracteres.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Formato de email inválido.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'linear-gradient(180deg, #F8F9FD 0%, #EAEFFC 100%)'
    }}>
      <div className="df-card" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-pop)',
        borderRadius: '20px'
      }}>
        {/* Header da Marca DisplayFlow */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/logo-displayflow.png"
            alt="DisplayFlow — Gestão Estratégica de Telas & Digital Signage"
            style={{ width: '100%', maxWidth: '280px', height: 'auto', margin: '0 auto 0.5rem auto', display: 'block' }}
          />
        </div>

        {errorMsg && (
          <div style={{
            background: 'var(--bad-soft)',
            border: '1px solid rgba(230, 91, 100, 0.25)',
            color: 'var(--bad-text)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-btn)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            fontWeight: '500'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="df-field">
            <label htmlFor="login-email">Email corporativo ou pessoal</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@empresa.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="df-field">
            <label htmlFor="login-password">Senha de acesso</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </div>

          <button
            type="submit"
            className="df-btn df-btn-pri"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem', fontSize: '0.95rem' }}
          >
            {loading ? 'Validando...' : (isRegister ? 'Criar Minha Conta Grátis' : 'Entrar no DisplayFlow')}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', textAlign: 'center', borderTop: '1px solid var(--line)', paddingTop: '1.25rem' }}>
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--pri)',
              fontWeight: '600',
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            {isRegister
              ? 'Já possui uma conta? Faça login aqui'
              : 'Novo no DisplayFlow? Crie sua conta de demonstração'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '1.5rem', color: 'var(--mute)', fontSize: '0.78rem' }}>
          <ShieldCheck size={14} color="var(--ok)" />
          Conexão Segura & Controle em Tempo Real
        </div>
      </div>
    </div>
  );
}
