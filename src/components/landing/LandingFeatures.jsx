import { Video, Layers, MessageSquare, Clock, Bell, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Galeria Pronta por Segmento',
    desc: 'Restaurantes, talhos, padarias, hamburguerias, clínicas e barbearias começam em 1 clique com modelos prontos em MTN.'
  },
  {
    icon: Video,
    title: 'Vídeos MP4 & YouTube Automáticos',
    desc: 'Suba vídeos direto do celular/PC para a nuvem ou monte playlists do YouTube que rodam sem parar na TV.'
  },
  {
    icon: Layers,
    title: 'Carrossel Rotativo & Biblioteca',
    desc: 'Alterne várias promoções automaticamente e mantenha todas as suas imagens e vídeos salvos para reutilizar quando quiser.'
  },
  {
    icon: Clock,
    title: 'Turnos Manhã, Tarde e Noite',
    desc: 'Programe o café da manhã, o almoço e as ofertas da noite uma única vez — a TV troca o conteúdo sozinha no horário certo.'
  },
  {
    icon: MessageSquare,
    title: 'Letreiro & QR Code de Vendas',
    desc: 'Chame atenção no rodapé da tela com avisos dinâmicos e conecte o cliente ao seu WhatsApp ou cardápio via QR Code.'
  },
  {
    icon: Bell,
    title: 'Fila de Senhas (Comum A & Prioritária P)',
    desc: 'Emita senhas, organize a espera por sala ou guichê e chame na TV com som de gongo sintetizado 100% offline.'
  }
];

export default function LandingFeatures() {
  return (
    <section id="recursos" style={{ padding: '4rem 1.25rem', maxWidth: '1080px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 2.5rem' }}>
        <span className="df-chip df-chip-pri" style={{ marginBottom: '0.6rem' }}>Por que o DisplayFlow?</span>
        <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', color: 'var(--ink)', marginBottom: '0.6rem' }}>
          Chega de pen drive na TV ou cartaz impresso desatualizado
        </h2>
        <p style={{ color: 'var(--mute)', fontSize: '0.98rem', lineHeight: 1.6 }}>
          Criado para quem atende no balcão todos os dias e precisa mudar preços, destacar combos ou organizar a fila direto do smartphone.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '3.5rem' }}>
        {FEATURES.map((feat) => {
          const Icon = feat.icon;
          return (
            <article key={feat.title} className="df-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '10px', background: 'var(--tint)', color: 'var(--pri)', marginBottom: '0.75rem' }}>
                <Icon size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.4rem' }}>{feat.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--mute)', lineHeight: 1.55 }}>{feat.desc}</p>
            </article>
          );
        })}
      </div>

      {/* Tabela Comparativa (Altamente citável para GEO / LLMO) */}
      <div className="df-card" style={{ overflowX: 'auto', marginBottom: 0 }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--ink)' }}>
          Comparativo: TV Comum vs. DisplayFlow
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--line)', color: 'var(--mute)' }}>
              <th style={{ padding: '0.75rem' }}>Critério</th>
              <th style={{ padding: '0.75rem' }}>TV com Pen Drive / Canal</th>
              <th style={{ padding: '0.75rem', color: 'var(--pri)' }}>DisplayFlow</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={{ padding: '0.75rem', fontWeight: '600' }}>Atualização de preços em MTN</td>
              <td style={{ padding: '0.75rem', color: 'var(--mute)' }}>Precisa refazer arte e copiar no USB</td>
              <td style={{ padding: '0.75rem', fontWeight: '600' }}>Instantânea pelo celular</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={{ padding: '0.75rem', fontWeight: '600' }}>Equipamento extra</td>
              <td style={{ padding: '0.75rem', color: 'var(--mute)' }}>Exige PC ou player dedicado caro</td>
              <td style={{ padding: '0.75rem', fontWeight: '600' }}>Zero — usa o navegador da própria TV</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={{ padding: '0.75rem', fontWeight: '600' }}>Queda de internet</td>
              <td style={{ padding: '0.75rem', color: 'var(--mute)' }}>Tela preta ou erro de página</td>
              <td style={{ padding: '0.75rem', fontWeight: '600' }}>Continua exibindo via cache offline</td>
            </tr>
            <tr>
              <td style={{ padding: '0.75rem', fontWeight: '600' }}>Gestão de múltiplas lojas</td>
              <td style={{ padding: '0.75rem', color: 'var(--mute)' }}>Manual, tela por tela no local</td>
              <td style={{ padding: '0.75rem', fontWeight: '600' }}>Centralizada à distância em tempo real</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
