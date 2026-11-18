# DisplayFlow — Design System v2

Base: UI kit "LMS / Student Portal" fornecido (cores amostradas da imagem). Substitui a paleta marinho/ardósia da v1. Princípios: **claro, calmo, arejado**. Fundo lavanda muito suave, cartões brancos, **um único azul-índigo** para ação e seleção, cores semânticas só para estado.

## 1. Cores

| Token | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| `--pri` | `#263DA7` | `#7F93F0` | Botão principal, link ativo, cartão-destaque, gráficos |
| `--pri-d` | `#1F3290` | `#9AABF5` | Hover/pressed |
| `--tint` | `#E4EAFA` | `#1F2759` | Item de menu ativo, chips de ícone, fundo de seleção |
| `--bg` | `#F8F9FD` | `#0E1330` | Fundo da página |
| `--card` | `#FFFFFF` | `#161C42` | Cartões, tabelas, painéis |
| `--line` | `#E3E7F4` | `#272F5E` | Bordas e divisórias |
| `--ink` | `#161B3D` | `#E9ECFA` | Texto principal |
| `--mute` | `#5E6485` | `#9AA1C4` | Texto secundário |
| `--ok` / `--ok-soft` | `#3CAB89` (texto `#1A7058`) / `#E3F5EF` | `#4CC08A` / `#143B33` | Online, ativa, presente |
| `--warn` / `--warn-soft` | `#EFAF4F` (texto `#9A6200`) / `#FDF3E1` | `#F2B85E` / `#3D3118` | Agendada, atenção |
| `--bad` / `--bad-soft` | `#E65B64` (texto `#C23A45`) / `#FCE8EA` | `#EF7F86` / `#3E1D27` | Offline, erro, remover |

Regra: o índigo aparece em **no máximo um elemento de destaque por ecrã** (botão principal ou cartão-destaque) além do menu ativo. Cores semânticas nunca são decorativas.

**Contraste (WCAG):** índigo sobre branco 9.1:1 · texto principal 16.7:1 · texto secundário 5.8:1 · índigo sobre tint 7.6:1 · verde-texto sobre soft 5.3:1 · vermelho-texto 4.5:1 · âmbar-texto 4.6:1. Todos AA para texto normal (≥ 4.5). Os tons `--ok`, `--warn` e `--bad` "cheios" servem para pontos, anéis e ícones, não para texto pequeno.

## 2. Tipografia

Uma família: **Inter** (400, 500, 600, 700).

| Papel | Tamanho / peso |
| --- | --- |
| Saudação / título de página | 24–28 px / 700 |
| Título de painel | 16 px / 600 |
| Corpo | 15 px / 400 |
| Rótulo, legenda | 13 px / 500, cor `--mute` |
| Número de estatística | 28 px / 700 |
| Código de display | monoespaçada 13 px |

Texto em frase normal (sem maiúsculas em rótulos).

## 3. Forma e profundidade

- Raios: cartões 14 px, botões e campos 10 px, chips 999 px.
- Sombra única e suave: `0 1px 2px rgba(38,61,167,.04), 0 6px 20px rgba(38,61,167,.05)`; borda 1 px `--line`.
- Espaçamento base 4 px; padding de cartão 18–20 px; intervalo entre cartões 14–16 px.

## 4. Componentes

- **Sidebar clara** (branca, 240 px): logo, **menu com item ativo em pílula `--tint` + texto `--pri`**, rodapé com foto, nome, cidade, "Editar perfil" e "Terminar sessão". Em mobile vira barra horizontal.
- **Topbar**: título da secção, pesquisa opcional, notificações, avatar.
- **Cartão-destaque**: o primeiro cartão do dashboard (telas online) em `--pri` com texto branco, como o cartão "CGPA" da referência. Os restantes são brancos.
- **Cartão de estatística**: número grande + legenda; ícone em chip `--tint` 40 px.
- **Chips de estado**: fundo `*-soft` + texto `*-ink` (Online, Offline, Ativa, Pausada, Agendada, Rascunho).
- **Tabelas**: cabeçalho 12 px `--mute`, linhas com divisória `--line`, ações como botões pequenos.
- **Anel de progresso** (referência de Attendance): usado para "telas online %" e uptime.
- **Botões**: primário preenchido `--pri`; secundário borda `--line`; destrutivo texto `--bad`. Largura total em formulários mobile.
- **Estados vazios**: uma frase que diz o que fazer, mais o botão da ação.
- **Mobile**: cartões em coluna, ações principais em barra fixa inferior, navegação por ícones.

## 5. Padrões de página

- **Dashboard**: saudação ("Bem-vindo de volta, {nome}") → 5 cartões (1.º destaque) → Status dos displays | Campanhas ativas → gráfico de reproduções.
- **Editor de campanha**: coluna esquerda (dados, destinos, horários) + direita (playlist com miniaturas, reordenar, duração). Ações fixas no topo: Guardar rascunho · Guardar e publicar.
- **Player**: fundo preto; sem elementos do design system.

## 6. Acessibilidade

Foco visível 2 px `--pri`; alvos de toque ≥ 40 px; movimento reduzido respeitado; estado nunca só por cor (sempre texto no chip).

## 7. Adições (v2.1)

**Overlays da TV** (letreiro, produto, QR, relógio, senha): vidro escuro sobre o conteúdo.

| Elemento | Valor |
| --- | --- |
| Fundo do vidro | `rgba(14,19,48,.6 a .85)` + `backdrop-filter: blur(10 a 20px)` |
| Borda | `1px rgba(255,255,255,.15)`; cartão de produto com barra lateral `#7F93F0` (3.º tom do índigo escuro) |
| Preço | `#EFAF4F` (âmbar do sistema) |
| Cartão de senha | fundo `#161C42`, borda 2 px `#7F93F0`, número 72 a 240 px peso 800 |
| Letreiro | rodapé ocupando a largura, 20 a 44 px peso 600, movimento linear; reduz com `prefers-reduced-motion` |
| QR | fundo branco, margem interna 6 px, legenda em maiúsculas 11 a 18 px |

Tamanhos em `clamp()` e `vw`, para ler a 3 a 10 metros. A regra do índigo (um destaque por ecrã) vale para o painel; na TV o conteúdo é o protagonista.

**Painel**: separadores como chips (Perfil, Organização, Assinatura); painel de pagamento com borda `--pri`; barras de uso (`--pri`, `--warn` a 80%, `--bad` a 100%); aviso `--warn-soft` para teste grátis e atraso.

## 8. Adições (v2.2)

- **Assistente de suporte:** botão flutuante "Ajuda" (índigo, canto inferior direito) abre um painel de 380 px; balões do assistente em `--tint`, do utilizador em `--pri` com texto branco; ação "Abrir pedido de suporte" só quando o assistente não sabe.
- **Analytics:** gráficos em SVG com `--pri` para reproduções e `--bad` para erros; hora do dia em 24 barras; tabelas de mídia, campanha e tela; chip de disponibilidade (`--ok` a partir de 99%, `--warn` a partir de 95%, `--bad` abaixo).
- **Estado de vídeo:** emblema "A processar…" (vidro escuro) e "Falhou" (`--bad`) no canto superior direito da miniatura; a mídia não pronta não aparece na biblioteca do editor.
- **Pagamento:** painel com borda `--pri` e escolha de forma (M-Pesa, cartão, referência); fatura Reembolsada com chip neutro; ação "Reembolsar" só para a equipa e em `--bad`.
- **Alertas:** secção própria em Configurações > Organização (email, webhook, minutos) com ação "Enviar teste de alerta".