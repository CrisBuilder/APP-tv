import { Link } from 'react-router-dom';
import { Check, HelpCircle, Smartphone, Tv, Sparkles } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    price: '0 MTN',
    period: '/mês',
    desc: 'Ideal para testar na sua primeira TV sem compromisso.',
    features: ['1 Smart TV conectada', 'Imagens, Carrossel e Letreiro', 'QR Code Dinâmico & Oferta em MTN', 'Cache offline automático'],
    highlight: false
  },
  {
    name: 'Pro Negócio',
    price: '490 MTN',
    period: '/mês',
    desc: 'Perfeito para restaurantes, talhos, clínicas e lojas em crescimento.',
    features: ['Até 5 TVs controladas pelo celular', 'Vídeos MP4 & Playlists YouTube', 'Turnos Manhã / Tarde / Noite', 'Fila de Senhas A/P com gongo', 'Pagamento fácil via M-Pesa'],
    highlight: true
  },
  {
    name: 'Rede & Franquias',
    price: '1.490 MTN',
    period: '/mês',
    desc: 'Para supermercados, farmácias e redes com múltiplas unidades.',
    features: ['TVs ilimitadas', 'Biblioteca compartilhada na conta', 'Monitoramento de sinal em tempo real', 'Suporte prioritário'],
    highlight: false
  }
];

const FAQS = [
  {
    q: 'Preciso comprar algum aparelho caro para usar o DisplayFlow na minha TV?',
    a: 'Não. Basta abrir o navegador da sua Smart TV (ou qualquer TV Box simples) em displayflow-6b14f.web.app/pair e digitar o código de 6 dígitos ou ler o QR Code pelo celular.'
  },
  {
    q: 'O que acontece se a internet da minha loja cair durante o expediente?',
    a: 'O DisplayFlow salva as últimas campanhas e imagens no cache offline da TV. Sua tela continua exibindo normalmente até a conexão voltar.'
  },
  {
    q: 'Como faço para pagar a assinatura em Moçambique?',
    a: 'Você começa grátis no plano Starter e, quando quiser fazer upgrade, paga diretamente em Meticais (MTN) usando M-Pesa (Vodacom 84/85), sem precisar de cartão internacional.'
  },
  {
    q: 'Posso exibir conteúdos diferentes em cada TV da minha loja?',
    a: 'Sim! Você pode enviar uma promoção para todas as TVs de uma vez ou escolher exatamente qual TV (ex: TV do Açougue vs. TV do Caixa) recebe cada vídeo, preço ou letreiro.'
  }
];

export default function LandingPricingFaq({ user }) {
  return (
    <>
      {/* Como funciona em 3 passos (HowTo / AEO) */}
      <section style={{ padding: '3.5rem 1.25rem', background: '#FFFFFF', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', textAlign: 'center', marginBottom: '2rem', color: 'var(--ink)' }}>
            Como colocar sua TV no ar em 3 minutos
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {[
              { icon: Smartphone, step: '1. Crie sua conta grátis', text: 'Acesse pelo celular ou PC e escolha um modelo pronto do seu segmento ou suba sua foto/vídeo.' },
              { icon: Tv, step: '2. Abra /pair na TV', text: 'No navegador da Smart TV, abra o link de pareamento para ver o código de 6 dígitos e o QR Code.' },
              { icon: Sparkles, step: '3. Publique em tempo real', text: 'Confirme o código no painel e controle promoções, turnos, letreiros e senhas de qualquer lugar.' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} style={{ background: 'var(--bg)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--line)' }}>
                  <Icon size={24} color="var(--pri)" style={{ marginBottom: '0.6rem' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.35rem' }}>{item.step}</h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--mute)', lineHeight: 1.5 }}>{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Planos em MTN */}
      <section id="planos" style={{ padding: '4rem 1.25rem', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', color: 'var(--ink)', marginBottom: '0.5rem' }}>
            Planos acessíveis em Meticais (MTN)
          </h2>
          <p style={{ color: 'var(--mute)', fontSize: '0.95rem' }}>Comece grátis hoje e ative mais telas via M-Pesa quando o seu negócio precisar.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '4rem' }}>
          {PLANS.map((plan) => (
            <div key={plan.name} className="df-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', border: plan.highlight ? '2px solid var(--pri)' : '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>{plan.name}</h3>
                {plan.highlight && <span className="df-chip df-chip-pri">Mais Popular</span>}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--ink)' }}>{plan.price}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--mute)' }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--mute)', marginBottom: '1rem' }}>{plan.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem' }}>
                    <Check size={16} color="var(--ok)" /> {f}
                  </li>
                ))}
              </ul>
              <Link to={user ? '/admin' : '/login'} className={`df-btn ${plan.highlight ? 'df-btn-pri' : 'df-btn-sec'}`} style={{ width: '100%', textDecoration: 'none' }}>
                {user ? 'Ir para Meu Painel' : 'Começar Agora'}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ (AEO / Answer Engine Optimization) */}
        <div id="faq" style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', textAlign: 'center', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <HelpCircle size={22} color="var(--pri)" /> Perguntas Frequentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FAQS.map((item) => (
              <details key={item.q} className="df-card" style={{ marginBottom: 0, cursor: 'pointer' }}>
                <summary style={{ fontWeight: '700', fontSize: '0.96rem', color: 'var(--ink)' }}>{item.q}</summary>
                <p style={{ marginTop: '0.65rem', fontSize: '0.88rem', color: 'var(--mute)', lineHeight: 1.6 }}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
