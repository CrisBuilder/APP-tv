import { Link } from 'react-router-dom';
import { MonitorPlay } from 'lucide-react';
import LandingHero from '../components/landing/LandingHero';
import LandingFeatures from '../components/landing/LandingFeatures';
import LandingPricingFaq from '../components/landing/LandingPricingFaq';

export default function Landing({ user }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar Pública */}
      <header style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <Link to="/" className="df-brand" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--tint)', color: 'var(--pri)', padding: '7px', borderRadius: '10px', display: 'flex' }}>
              <MonitorPlay size={20} />
            </div>
            <span>DisplayFlow</span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.88rem', fontWeight: '600' }}>
            <a href="#recursos" style={{ color: 'var(--mute)', textDecoration: 'none' }}>Recursos</a>
            <a href="#planos" style={{ color: 'var(--mute)', textDecoration: 'none' }}>Planos</a>
            <a href="#faq" style={{ color: 'var(--mute)', textDecoration: 'none' }}>Dúvidas</a>
            <Link to={user ? '/admin' : '/login'} className="df-btn df-btn-pri" style={{ padding: '0.45rem 1rem', fontSize: '0.84rem', textDecoration: 'none' }}>
              {user ? 'Meu Painel' : 'Entrar / Criar Conta'}
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <LandingHero user={user} />
        <LandingFeatures />
        <LandingPricingFaq user={user} />
      </main>

      <footer style={{ background: '#0E1330', color: '#CBD5E1', padding: '2rem 1.25rem', textAlign: 'center', fontSize: '0.84rem' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
          <strong style={{ color: '#FFFFFF', fontSize: '1rem' }}>DisplayFlow — Sinalização Digital Inteligente</strong>
          <p style={{ color: '#94A3B8' }}>Controle remoto de TVs, ofertas em MTN, vídeos e atendimento por senhas em Moçambique.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <Link to="/login" style={{ color: '#7F93F0', textDecoration: 'none' }}>Acessar Painel</Link>
            <Link to="/pair" style={{ color: '#7F93F0', textDecoration: 'none' }}>Conectar TV (/pair)</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
