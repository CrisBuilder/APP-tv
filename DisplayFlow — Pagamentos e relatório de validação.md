# DisplayFlow: pagamentos e relatório de validação

## Parte 1. Pagamentos: estado de cada fornecedor

| Fornecedor | Cobrar | Confirmar | Reembolsar | Estado |
| --- | --- | --- | --- | --- |
| **M-Pesa** (Vodacom) | C2B | Consulta de estado + callback não confiado | Reversão (PUT) | Implementado e testado contra servidor simulado. **Falta sandbox e Go Live (precisa de credenciais)** |
| **Cartão** (Stripe Checkout) | Página hospedada | Webhook com assinatura verificada | `POST /v1/refunds` | Implementado e testado com a API simulada. **Falta conta Stripe e teste real** |
| **Manual** (referência) | Referência | Equipa confirma | Fora do sistema | Pronto |
| **e-Mola** (Movitel) | Não implementado | Não implementado | Não implementado | **Bloqueado: especificação privada** (ver abaixo) |
| **Mock** | Instantâneo | n/a | Simulado | Só desenvolvimento (recusado em produção) |

## Reembolsos

Só a equipa (papel `SUPER_ADMIN`, definido na base de dados) executa: `POST /billing/invoices/:id/refund`. O cliente pede por suporte (o chatbot encaminha). Regras (testadas):

- só faturas **pagas**;
- chama o fornecedor (M-Pesa reversão, Stripe refund); se falhar, a fatura **não** muda de estado;
- se a fatura financiava o ciclo atual, a assinatura passa a **Cancelada**; senão mantém-se.

M-Pesa: a reversão usa o ID da transação guardado na cobrança, `MPESA_SECURITY_CREDENTIAL` e `MPESA_INITIATOR_IDENTIFIER` (emitidos no portal). Contrato (PUT, porta 18354, seis campos `input_*`) confirmado em dois SDKs comunitários; **confirme na página "APIs" do portal**.

## Cartão (Stripe)

1. Crie a conta e copie a chave secreta (`STRIPE_SECRET_KEY`).
2. Registe o endpoint `https://SEU_DOMINIO/api/billing/stripe/webhook` com os eventos `checkout.session.completed`, `checkout.session.async_payment_succeeded` e `checkout.session.async_payment_failed`; copie o segredo para `STRIPE_WEBHOOK_SECRET`.
3. `BILLING_PROVIDERS=stripe,mpesa,manual`, `APP_URL=https://painel.seudominio.com`.

Segurança (testada): assinatura HMAC com tolerância de 5 minutos (anti-replay), comparação em tempo constante, só faturas Stripe pendentes são afetadas, idempotência por fatura. O cartão nunca passa pelos nossos servidores. **Atenção:** confirme que a sua empresa pode abrir conta Stripe no seu país. Se não puder, use um agregador que o permita e crie um adaptador (a interface `Adapter` em `billing.ts` tem 4 funções).

## e-Mola (Movitel): por que não está implementado

A integração não é pública: é um serviço SOAP (*USSD PUSH API SPECIFICATION*) entregue pela Movitel a parceiros, com credenciais próprias. Sem a especificação não é possível escrever o pedido corretamente, e inventá-lo faria cobranças falharem ou, pior, parecerem concluídas.

**O que pedir à Movitel:** a especificação atual da API, ambiente de testes, credenciais, o formato do callback, a lista de códigos de erro e se existe reversão. **Onde ligar:** em `apps/api/src/modules/billing.ts` o adaptador `emola` já existe como marcador (devolve "indisponível"). Preencher `quote`, `charge` e, se houver, `verify` e `refund`, e acrescentar `emola` a `BILLING_PROVIDERS`. Reutilize o padrão do M-Pesa: só o código de sucesso do fornecedor marca pago; resposta incerta fica pendente e é resolvida por consulta.

---

## Parte 2. Relatório de validação

Última execução neste ambiente: **67 testes automáticos, 0 falhas** (51 da API, 1 do painel, 15 de ponta a ponta em Chromium).

## O que foi verificado, e como

| Área | Método | Resultado |
| --- | --- | --- |
| Horários e prioridade (fusos, janelas que atravessam a meia-noite) | `node:test` | passa |
| M-Pesa: bearer RSA (decifrado com OpenSSL), C2B, estado, reversão, timeout, números | servidor HTTP simulado | passa |
| Stripe: assinatura (válida, adulterada, replay, vários v1), eventos, Checkout, reembolso, erros | `fetch` simulado | passa |
| Regras de cobrança: limites de plano, câmbio MZN, veredito M-Pesa, reembolso, ciclo de vida | testes puros | passa |
| Chatbot: perguntas típicas, escalada, IA (cabeçalhos, modelo, contexto), falha da IA | testes | passa |
| Analytics: fuso na fronteira do dia, horas, disponibilidade, CSV com proteção de fórmulas | testes | passa |
| Alertas: um aviso por incidente, recuperação, anti-SSRF (IP e DNS), Resend | testes | passa |
| **Conversão de vídeo**: 4K com áudio vira H.264 1080p, faststart, poster; ficheiro corrompido | **ffmpeg real** | passa |
| **Player** (código real): emparelhamento, widgets, escape de HTML, YouTube, START/END, senhas em fila, revogação 401, offline, lista vazia | **Chromium real**, API simulada | passa |
| **Protótipo**: cadastro, Configurações, assinatura M-Pesa simulada, widgets, senhas entre duas abas | **Chromium real** | passa |
| Schema Prisma (20 modelos, 12 enums): relações, inversos, enums, índices | `scripts/check-schema.py` | consistente |
| Sintaxe de todo o TS/TSX (54 ficheiros) | `typescript` | 0 erros |
| Tipos do nosso código (API e painel) | `tsc` com declarações simuladas das bibliotecas | 0 erros reais |

Erros reais apanhados e corrigidos por estes testes: o chatbot confundia "pagar com M-Pesa" com "planos"; o `tsconfig` da API geraria `dist/src/` e quebraria o `node dist/main`; e a revogação por 401 do player.

## O que NÃO foi verificado (não é possível neste ambiente)

- **Pacotes reais:** sem rede, não instalei Nest, Prisma, Next nem Vite. Não corri `nest build`, `prisma validate` ou `migrate`, `next build`, `vite build`, nem arranquei o servidor. A checagem de tipos não valida contra os tipos reais dessas bibliotecas. O CI (`.github/workflows/ci.yml`) faz tudo isto no primeiro push.
- **Base de dados:** nenhuma consulta Prisma correu contra Postgres. Rotas, cron e transações estão revistos, não executados.
- **Fornecedores reais:** nenhuma chamada à Vodacom, Stripe, Resend nem à API da Anthropic.
- **TVs reais:** nenhum teste em Android TV, Tizen, webOS, Fire TV ou Raspberry Pi. O APK nunca foi compilado.
- **Docker:** a imagem não foi construída.
- **Repositório CrisBuilder/APP-tv:** o GitHub bloqueia leitura automatizada; usei a cópia do Signage.Pro que está no projeto.

## Como correr

```bash
npm install
npm test                  # API + painel
npm run check:schema
NODE_GLOBAL=$(npm root -g) npm run test:e2e   # precisa de playwright, esbuild e tsx globais
```