# DisplayFlow: M-Pesa e integração do Signage.Pro

## Parte 1. Integração M-Pesa Moçambique (Vodacom)

## O que foi lido e o que não foi

- **Lido (documentação pública do portal):** autenticação, modo síncrono/assíncrono, regras do URL de resposta, relatórios e processo "Go Live".
- **Não lido:** as páginas dos endpoints (C2B, Reversão, Estado) ficam atrás de login no portal.
- **Seguido por SDKs comunitários independentes (confirmar no portal):** hosts `api.sandbox.vm.co.mz` e `api.vm.co.mz`, C2B na porta `18352`, caminho `/ipg/v1x/c2bPayment/singleStage/`, campos `input_TransactionReference`, `input_CustomerMSISDN`, `input_Amount`, `input_ThirdPartyReference`, `input_ServiceProviderCode`, resposta `output_ResponseCode` (`INS-0` = sucesso).
- **Consulta de estado** (porta `18353`, `GET`, `output_ResponseTransactionStatus`) e **reversão** (porta `18354`, `PUT`): confirmadas em dois SDKs comunitários. Se o portal indicar outros endereços, defina `MPESA_STATUS_URL`, `MPESA_C2B_URL` ou `MPESA_REVERSAL_URL` sem mexer no código.

## Autenticação (da documentação)

`Authorization: Bearer base64( RSA( API_KEY ) )`, cifrando a API Key (32 caracteres) com a Public Key do portal (RSA 4096, X.509, base64). Implementado em `apps/api/src/modules/mpesa.ts` com preenchimento PKCS#1 v1.5, o mesmo do `Cipher.getInstance("RSA")` do exemplo Java da documentação.

**Verificado aqui:** o bearer decifra de volta para a API Key com OpenSSL (PKCS#1 v1.5); com a chave de exemplo da documentação sai um bearer de 512 bytes (684 caracteres base64), o tamanho esperado para RSA 4096. **Não verificado:** nenhuma chamada real ao portal Vodacom, porque não há credenciais.

## Como ligar (quando tiver as credenciais)

1. Portal: crie conta, ative-a (link por email e telemóvel), copie **API Key** e **Public Key** de *Account Profile*.
2. Peça à Vodacom o **Service Provider Code** da sua empresa.
3. Em `apps/api/.env` (nunca no Git, nunca no frontend):

   ```
   BILLING_PROVIDERS=mpesa,manual
   MPESA_ENV=sandbox
   MPESA_API_KEY=...            MPESA_PUBLIC_KEY=...
   MPESA_SERVICE_PROVIDER_CODE=...
   MPESA_USD_MZN_RATE=63.9      # atualize quando necessário
   ```
4. `npm run test:mpesa` no `apps/api` (teste local, sem rede) e depois uma cobrança no **sandbox** a partir de Configurações → Assinatura.
5. Quando as transações de teste tiverem sucesso, use **Go Live** no perfil do portal: a Vodacom revê o relatório e autoriza. Só então `MPESA_ENV=live`.
6. Se quiser o modo **assíncrono**: registe no portal o *Asynchronous Response URL* `https://SEU_DOMINIO:PORTA/api/billing/mpesa/callback`. Regras da documentação: só HTTPS e **porta entre 11000 e 19000** (a porta padrão 443 não serve; exponha o proxy numa porta desse intervalo). Isto torna **todas** as APIs da conta assíncronas.

## Como o pagamento funciona

1. O cliente escolhe o plano e introduz o número M-Pesa (Vodacom 84/85; aceita `+258`, `00258`, espaços).
2. O preço do plano (USD) é convertido para **MZN inteiros** com `MPESA_USD_MZN_RATE`; a fatura guarda o valor em MZN.
3. A API faz C2B e o cliente confirma com o PIN no telemóvel.
4. Decisão sobre o resultado:

| Resposta | Resultado |
| --- | --- |
| `INS-0` | **Paga**, plano ativado |
| Timeout / erro de rede / código em `MPESA_PENDING_CODES` (padrão `INS-9`) | **Pendente** (estado incerto, nunca presumido) |
| Qualquer outro código | **Falhou**, mostra `output_ResponseDesc` |

5. **Reconciliação:** botão "Verificar pagamento", ciclo horário e callback consultam o estado. Só `Completed` ativa; resposta desconhecida mantém pendente; sem confirmação em 24 h a fatura falha.
6. O callback assíncrono **não é confiado**: serve só de aviso e dispara uma consulta de estado.
7. Renovação: 3 dias antes do fim do ciclo cria-se uma fatura pendente; o cliente paga por M-Pesa (um pedido de PIN inesperado seria má experiência, por isso não há débito automático).

## Pontos por confirmar no portal

- Lista completa de códigos `INS-*` (hoje só `INS-0` é tratado como sucesso).
- Limites de tamanho/formato das referências (usamos `DF` + 10 ou 12 caracteres alfanuméricos).
- Formato exato do corpo do callback assíncrono e do campo de estado da consulta.
- Prazo máximo de espera da resposta síncrona (`MPESA_TIMEOUT_MS`, padrão 60 s).
- Reversões (reembolsos): implementadas (PUT, porta 18354, campos `input_TransactionID`, `input_ReversalAmount`, `input_ThirdPartyReference`, `input_ServiceProviderCode`, `input_SecurityCredential`, `input_InitiatorIdentifier`). Confirme o contrato e obtenha `SecurityCredential` e `InitiatorIdentifier` no portal.

---

## Parte 2. Integração do Signage.Pro

**Base usada:** o código do Signage.Pro que está no projeto (`TV.jsx`, `Admin.jsx`, `firebase.js`, `index.css`, README). O repositório `CrisBuilder/APP-tv` está acessível a humanos, mas o GitHub bloqueia leitura automatizada, por isso não o li diretamente e pode haver ficheiros que não vi. **Licença:** o utilizador confirmou ter direito de uso comercial. O código foi **reescrito** na nossa stack (não copiado); aproveitaram-se as funcionalidades e o desenho dos widgets.

## Mapa funcional

| Signage.Pro | DisplayFlow |
| --- | --- |
| Fundo de imagem | Item de playlist `IMAGE` (upload próprio, sem ImgBB) |
| Fundo YouTube em loop | Item de playlist `YOUTUBE` (`POST /media/youtube`, duração definida na playlist) |
| Letreiro (marquee) | Widget `ticker` da campanha |
| QR Code | Widget `qr` (link + legenda), gerado no próprio aparelho |
| Produto em destaque | Widget `product` (nome, descrição, preço) |
| Relógio | Widget `clock`, **no fuso da organização** |
| Chamada de senha com som | Página **Senhas** (`POST /tickets/call`), fila de chamadas, histórico, destino (todas, grupo ou tela), som gerado no aparelho |
| Painel em tempo real (Firebase) | Mesmo efeito com WebSocket próprio |

Os widgets ficam **por campanha**: ao publicar, chegam às telas alvo e respeitam prioridade, período e horário. Várias campanhas de igual prioridade somam as playlists e juntam os widgets.

## O que NÃO foi trazido, e porquê

| No Signage.Pro | Problema | No DisplayFlow |
| --- | --- | --- |
| Regras do Firebase com `.read: true, .write: true` (a "dica ninja") | **Qualquer pessoa** com o endereço do banco pode ler e escrever tudo | API com JWT, dados por organização |
| `/tv/:uid` usa o id do administrador como "segredo" | Quem o descobre controla ou espia a conta | Token por TV, revogável |
| Chave do ImgBB no navegador | Exposta a qualquer utilizador | Upload pelo servidor |
| Áudio de `assets.mixkit.co` | Depende de terceiro e de rede | Som sintetizado localmente |
| Conta única por instalação | Não serve para vários clientes | Multi-organização, planos e cobrança |
| "Vídeos do YouTube sem anúncios" (blog) | Não há garantia: o embed segue as regras do YouTube | Aviso claro na biblioteca |

Não há importação de dados do Firebase.

## Diferenças de comportamento

- No Signage.Pro tudo é "estado ao vivo" de uma tela. Aqui os widgets pertencem a campanhas; para um aviso instantâneo a todas as telas use a página **Senhas** (ou publique uma campanha de prioridade alta).
- A chamada de senha é efémera: telas offline não a recebem; a resposta diz quantas estavam online.
- YouTube precisa de internet na TV e não funciona offline.
- Som: alguns navegadores só tocam áudio depois de um clique na página; o APK Android TV está configurado para tocar sem gesto.