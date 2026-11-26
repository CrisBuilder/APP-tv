import { Link } from 'react-router-dom';
import { MonitorPlay, ArrowRight, Smartphone, WifiOff, CheckCircle2, Tv } from 'lucide-react';

export default function LandingHero({ user }) {
  return (
    <section style={{ padding: '4rem 1.25rem 3.5rem', background: 'linear-gradient(180deg, #EEF2FF 0%, var(--bg) 100%)', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
        <div>
          <span className="df-chip df-chip-pri" style={{ marginBottom: '1rem', fontSize: '0.78rem' }}>
            🇲🇿 Feito para negócios reais em Moçambique
          </span>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800', lineHeight: 1.12, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            Transforme a TV da sua loja em um <span style={{ color: 'var(--pri)' }}>vendedor silencioso</span> controlado pelo celular.
          </h1>

          {/* TL;DR otimizado para AEO / AI Overviews / GEO */}
          <p style={{ fontSize: '1.05rem', color: 'var(--mute)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
            <strong>Em resumo:</strong> o DisplayFlow transforma qualquer Smart TV em um painel de ofertas em <strong>MTN</strong>, cardápio digital, letreiro rotativo e chamador de senhas — sem comprar aparelhos caros, funcionando mesmo se a internet oscilar e com pagamento simples via <strong>M-Pesa</strong>.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <Link to={user ? '/admin' : '/login'} className="df-btn df-btn-pri" style={{ padding: '0.85rem 1.5rem', fontSize: '0.95rem', textDecoration: 'none' }}>
              {user ? 'Acessar Meu Painel' : 'Começar Grátis Agora'} <ArrowRight size={18} />
            </Link>
            <Link to="/pair" className="df-btn df-btn-sec" style={{ padding: '0.85rem 1.35rem', fontSize: '0.95rem', textDecoration: 'none' }}>
              <Tv size={18} /> Conectar uma TV
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.84rem', color: 'var(--ink)', fontWeight: '600' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="var(--ok)" /> Sem hardware caro
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Smartphone size={16} color="var(--pri)" /> Atualize em segundos pelo celular
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <WifiOff size={16} color="var(--warn)" /> Cache offline inteligente
            </span>
          </div>
        </div>

        {/* Mockup Visual da TV (SXO - Demonstração imediata de valor) */}
        <div style={{ background: '#0E1330', borderRadius: '20px', padding: '14px', boxShadow: '0 24px 60px rgba(22, 27, 61, 0.18)', border: '6px solid #1E293B' }}>
          <div style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: '12px', overflow: 'hidden', background: '#090D1A' }}>
            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80"
              alt="Exemplo de oferta em TV com DisplayFlow"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.78 }}
            />
            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(14, 19, 48, 0.85)', color: '#FFF', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>
              12:45
            </div>
            <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(14, 19, 48, 0.88)', color: '#FFF', padding: '0.75rem 1rem', borderRadius: '12px', borderLeft: '4px solid #7F93F0', maxWidth: '62%' }}>
              <div style={{ fontSize: '0.68rem', color: '#7F93F0', fontWeight: '700', textTransform: 'uppercase' }}>Oferta do Dia</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', margin: '2px 0' }}>Picanha Especial</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#EFAF4F' }}>890 MTN / kg</div>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(14, 19, 48, 0.92)', color: '#FFF', padding: '6px 12px', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#263DA7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800' }}>PROMOÇÃO</span>
              <span>Peça no balcão ou aponte a câmera para o cardápio digital!</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', color: '#94A3B8', fontSize: '0.74rem', padding: '0 4px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <MonitorPlay size={14} color="#7F93F0" /> TV Recepção • Sinal Ativo
            </span>
            <span>Sincronizado em tempo real</span>
          </div>
        </div>
      </div>
    </section>
  );
}
