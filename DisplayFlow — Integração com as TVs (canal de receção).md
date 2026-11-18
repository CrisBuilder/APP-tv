# DisplayFlow: integração com as TVs (canal de receção)

## 1. Decisão

**Não é preciso um SDK nativo no MVP.** A solução recomendada é um **player web hospedado (PWA)** que qualquer ecrã com navegador consegue abrir, mais **instaladores finos** por plataforma que só fazem três coisas: abrir o player em ecrã inteiro, arrancar sozinho com o aparelho e reabrir se falhar.

| Camada | O que é | Estado |
| --- | --- | --- |
| **Player web** (`apps/player`) | Reproduz imagens e vídeos, guarda a mídia para modo offline, fala com a API | Feito |
| **Emparelhamento por código** | A TV mostra 6 caracteres; o admin introduz-os no painel. Sem teclado na TV, sem URL longa | Feito |
| **Quiosque Linux / Windows** | Script que instala o navegador em modo quiosque com arranque automático | Feito (não testado em aparelho) |
| **APK Android TV / Fire TV** | WebView em ecrã inteiro, launcher HOME, arranque automático | Modelo de código (nunca compilado) |
| **Apps Tizen / webOS** | Pacote que aponta para o player hospedado | Fase seguinte |
| **SDK JS (`@displayflow/player-sdk`)** | Embutir o player em ecrãs ou quiosques de terceiros | Só quando houver integradores |

**Porquê assim:** o conteúdo e a lógica vivem no servidor. Para mudar o player atualiza-se o site, não se visita cada TV. Um SDK nativo por marca multiplicaria custos de manutenção sem benefício no MVP.

## 2. Dois canais

- **Controlo** (pequeno, constante): HTTPS REST + WebSocket entre TV e API. Transporta emparelhamento, playlist, heartbeat e eventos de reprodução.
- **Mídia** (pesado, esporádico): download HTTPS direto do armazenamento/CDN, feito **antes** de ser preciso e guardado no aparelho. Não é transmissão ao vivo: campanhas são ficheiros em playlist. Transmissão ao vivo (HLS) seria uma fase 4.

## 3. Equipamento: o que ligar à TV

Critério em vez de marcas: **Android 9+ (API 28+), 2 GB de RAM ou mais, decodificação H.264 1080p em hardware, Ethernet ou Wi-Fi 5 GHz, religa sozinho quando volta a energia.**

| Cenário | Solução | Notas |
| --- | --- | --- |
| TV qualquer, sem inteligência | **Box Android TV** ou mini PC por HDMI + APK ou navegador | Mais barato e previsível. Recomendado como referência para pilotos |
| Smart TV de consumo | Navegador da TV em página fixa | Em geral **sem garantia** de quiosque nem arranque automático. Se falhar, use um box |
| TV profissional (signage) Samsung/LG | App web / URL launcher do próprio sinalizador | Confirmar no manual do modelo antes de prometer ao cliente |
| Chromecast com Google TV, Fire TV Stick | APK Android | Aceitável em piloto. Validar auto-arranque no modelo |
| Raspberry Pi / mini PC Linux | `install-linux.sh` | Simples, barato, estável |
| PC Windows | `install-windows.ps1` (Edge em quiosque) | Configure login automático |

## 4. Emparelhamento (fluxo)

```mermaid
sequenceDiagram
  participant TV as TV (player)
  participant API as API DisplayFlow
  participant Admin as Admin (painel)
  participant Store as Armazenamento / CDN
  TV->>API: POST /player/pair/start
  API-->>TV: pairingCode + secret (válidos 10 min)
  Note over TV: mostra o código; o secret fica só na memória
  loop a cada 3 s
    TV->>API: GET /player/pair/status (x-pairing-secret)
    API-->>TV: PENDING
  end
  Admin->>API: POST /displays/pair (código, nome, local)
  API->>API: cria o Display e guarda sha256(secret)
  TV->>API: GET /player/pair/status
  API-->>TV: PAIRED + código do display
  Note over TV: guarda o token (= secret) em localStorage
  TV->>API: WebSocket /player (auth.token)
  TV->>API: GET /player/me/playlist
  API-->>TV: playlist com URLs de mídia
  TV->>Store: descarrega e guarda a mídia (Service Worker)
  Admin->>API: POST /campaigns/:id/publish
  API-->>TV: evento playlist:updated
  TV->>API: GET /player/me/playlist
  loop a cada 30 s
    TV->>API: POST /player/me/heartbeat
  end
```

**Revogar:** `POST /displays/:id/unpair` apaga o hash no servidor. A TV recebe `display:reload`, o pedido seguinte devolve 401, o player apaga o token e volta ao ecrã de emparelhamento.

## 5. Protocolo

| Rota / evento | Quem | Função |
| --- | --- | --- |
| `POST /api/player/pair/start` | TV | Pede código de emparelhamento |
| `GET /api/player/pair/status` | TV | Pergunta se já foi emparelhada (cabeçalho `x-pairing-secret`) |
| `GET /api/player/me/playlist` | TV | Playlist atual (`x-device-token`) |
| `POST /api/player/me/heartbeat` | TV | Presença, versão, plataforma, resolução |
| `POST /api/player/me/events` | TV | START / END / ERROR por item |
| WebSocket `/player` com `auth.token` | TV | Recebe `playlist:updated` e `display:reload` |
| `POST /api/displays/pair` | Painel | Reclama o código e cria o display |
| `POST /api/displays/:id/unpair` · `/refresh` | Painel | Revogar · recarregar |

`playlist.version` muda a cada publicação, edição ou pausa. A TV só reinicia o ciclo quando a versão muda. O modo legado `/display/MAP-XXXXXX` continua disponível para testes. **Em produção defina `LEGACY_CODE_PLAYER=off`.**

## 6. Resiliência

- **Sem internet:** o player guarda a última playlist (`localStorage`) e a mídia (Service Worker). Reabre e continua a reproduzir sem rede.
- **Sinalização:** com o WebSocket ligado o polling cai para 5 minutos; sem ele volta a 30 s.
- **Item com erro:** reporta `ERROR` e passa ao seguinte, sem travar o ciclo.
- **Queda do navegador:** o script Linux reabre em ciclo; o APK recarrega o URL após 5 s sem rede.
- **Offline no painel:** sem heartbeat há mais de 90 s a tela aparece como Offline.

## 7. Segurança

- O token do dispositivo é aleatório (32 bytes); o servidor guarda só o **hash**. Revogável por tela.
- O código de emparelhamento expira em 10 minutos, tem uso único e a reclamação é atómica.
- Todas as rotas do painel filtram por organização.
- Rate limit nas rotas públicas do player (120 pedidos/min por IP; `/pair/start` 10/min). **Falta:** expiração/rotação do token e URLs de mídia assinadas (hoje `/files/` é público por URL imprevisível).
- HTTPS é obrigatório em produção (sem ele o Service Worker não regista).

## 8. Instalação por plataforma

**Qualquer navegador (teste rápido):** abrir o URL do player. Aparece o código; emparelhar no painel.

**Raspberry Pi / Linux:** `sudo bash apps/player/install/install-linux.sh https://play.seudominio.com`, reiniciar.

**Windows:** `.\install-windows.ps1 -Url https://play.seudominio.com`; ativar login automático e desligar suspensão.

**Android TV / box:** gerar o APK conforme `apps/player-android/README.md`, instalar por USB ou `adb install`, abrir uma vez e confirmar o launcher predefinido.

**Em todos:** desligar CEC/HDMI-sleep da TV se existir, ativar "ligar ao receber energia" e testar um corte de luz.

## 9. Especificação de mídia

| Tipo | Recomendado |
| --- | --- |
| Imagem | JPG/WEBP/PNG, 1920×1080, até 2 MB |
| Vídeo | MP4, H.264, AAC, 1080p30, até 8 Mbps, `faststart` |
| Duração/tamanho de vídeo | até 60 s e cerca de 50 MB (o cache offline serve vídeos de memória) |

```bash
ffmpeg -i entrada.mov -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p -r 30 \
  -vf scale=-2:1080 -b:v 6M -maxrate 8M -bufsize 12M -c:a aac -b:a 128k -movflags +faststart saida.mp4
```

Evite H.265/VP9 em aparelhos antigos. A API converte os vídeos enviados para este perfil (ffmpeg, fila, poster) e mostra "A processar" até ficarem prontos; só mídia pronta entra em campanhas.

## 10. Consumo de dados (ordem de grandeza)

Estimativa, a medir em campo: heartbeat de 30 s ≈ 1 KB cada ≈ 3 MB/dia ≈ **cerca de 85 MB/mês**, mais polling de segurança e eventos de reprodução: **na ordem de 100 a 200 MB/mês por tela só em sinalização**, mais a mídia (descarregada uma vez por alteração). Relevante se as TVs estiverem em redes móveis (4G): considere aumentar o intervalo do heartbeat e agrupar eventos.

## 11. Operação da frota

- Painel: estado, última conexão, plataforma, resolução, versão do player.
- Ações remotas: refresh, desemparelhar.
- Atualizar o player = publicar o site novamente (as TVs recarregam no próximo `display:reload` ou reinício).
- Alertas por email e webhook quando uma tela fica offline, com registo das quebras de sinal (disponibilidade em Analytics). Falta: captura de ecrã remota e atualização do APK.

## 12. Plano de testes em TV real

1. Emparelhar do zero, sem teclado na TV.
2. Publicar imagem, depois vídeo, depois uma playlist mista com transição.
3. Cortar a internet 10 minutos: a reprodução continua? Religar: sincroniza?
4. Cortar a energia: a TV reabre sozinha no player e sem intervenção?
5. Desemparelhar no painel: a TV volta ao código?
6. Vídeo de 50 MB em offline; 24 horas seguidas sem vazamento de memória.
7. Mudar de campanha com a TV a meio de um vídeo.

## 13. Riscos e limites conhecidos

| Risco | Mitigação |
| --- | --- |
| Smart TVs de consumo sem quiosque | Oferecer box Android como padrão comercial |
| Autoplay de vídeo só com som desligado | O player usa `muted`. Som exigiria app nativo ou definição da TV |
| Cache de vídeo em memória | Limitar tamanho; migrar para armazenamento por ficheiros no APK |
| Android 10+ bloqueia arranque em segundo plano | App como launcher HOME + MDM |
| Relógio da TV desajustado afeta horários | Horários avaliados no servidor, no fuso da organização |

## 14. Estado de implementação

Feito: emparelhamento, token por dispositivo, revogação, heartbeat, eventos, Service Worker, widgets, YouTube, senhas, scripts Linux/Windows, modelo APK. **Testado:** o código real do player em Chromium (8 cenários: emparelhamento, widgets, escape de HTML, YouTube, relatórios, senhas, revogação, offline). **Não testado:** nenhuma TV real, e o APK nunca foi compilado. Ver `VALIDACAO.md`.