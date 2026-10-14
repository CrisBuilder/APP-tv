# 📖 Manual Passo a Passo de Configuração - Signage.Pro

Este guia foi criado para que **qualquer pessoa**, mesmo sem conhecimento prévio em programação, consiga configurar e colocar o sistema no ar em **menos de 5 minutos**.

O sistema utiliza apenas **2 serviços 100% gratuitos**:
1. **Firebase (Google):** Banco de dados em tempo real e sistema de login.
2. **ImgBB:** Hospedagem gratuita para as fotos e banners exibidos na TV.

> 💡 **Importante:** Você só precisará mexer em **um único arquivo** no projeto inteiro: `src/firebase.js`.

---

## 📑 Índice
1. [Passo 1: Criando a Conta e Projeto no Firebase](#passo-1-criando-a-conta-e-projeto-no-firebase)
2. [Passo 2: Ativando o Banco de Dados (Realtime Database)](#passo-2-ativando-o-banco-de-dados-realtime-database)
3. [Passo 3: Ativando a Autenticação (Login e Senha)](#passo-3-ativando-a-autenticação-login-e-senha)
4. [Passo 4: Copiando a Chave do Firebase](#passo-4-copiando-a-chave-do-firebase)
5. [Passo 5: Pegando a Chave Gratuita do ImgBB (Fotos)](#passo-5-pegando-a-chave-gratuita-do-imgbb-fotos)
6. [Passo 6: Colando as Chaves no Arquivo `src/firebase.js`](#passo-6-colando-as-chaves-no-arquivo-srcfirebasejs)
7. [Passo 7: Ligando o Sistema e Usando na TV](#passo-7-ligando-o-sistema-e-usando-na-tv)
8. [Perguntas Frequentes & Solução de Problemas](#perguntas-frequentes--solução-de-problemas)

---

## Passo 1: Criando a Conta e Projeto no Firebase

1. Acesse o site do Firebase: [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Faça login com sua conta do Google (Gmail).
3. Na tela inicial, clique em **"Adicionar projeto"** (ou "Criar um projeto").
4. Digite um nome para o seu projeto (exemplo: `minha-tv-corporativa` ou o nome da sua empresa).
5. Clique em **Continuar**.
6. Na etapa do Google Analytics, você pode **desmarcar** (não é obrigatório) e clicar em **Criar projeto**.
7. Aguarde alguns segundos até o projeto ser criado e clique em **Continuar**.

---

## Passo 2: Ativando o Banco de Dados (Realtime Database)

O Realtime Database é o motor que sincroniza o painel com a TV instantaneamente:

1. No menu lateral esquerdo do Firebase, clique em **Criação** (ou Build) > **Realtime Database**.
2. Clique no botão azul **"Criar banco de dados"**.
3. Deixe o local padrão (Estados Unidos / `us-central1`) e clique em **Avançar**.
4. Na tela de "Regras de segurança", selecione a opção **"Iniciar no modo de teste"** (isso permite que o painel envie as informações para a TV).
5. Clique em **Ativar** (ou Habilitar).

> 🔒 **Dica de Produção (Regras do Banco):**
> Se no futuro você quiser manter as regras sempre liberadas sem expirar após 30 dias, clique na aba **Regras** dentro do Realtime Database e cole o seguinte código:
> ```json
> {
>   "rules": {
>     ".read": true,
>     ".write": true
>   }
> }
> ```
> Depois clique em **Publicar**.

---

## Passo 3: Ativando a Autenticação (Login e Senha)

Isso permite que você crie sua conta de administrador para proteger seu painel:

1. No menu lateral esquerdo, clique em **Criação** (ou Build) > **Authentication**.
2. Clique no botão **"Primeiros passos"**.
3. Na lista de "Provedores nativos", clique em **E-mail/senha**.
4. Marque a primeira chave como **Ativado** (Email/senha).
5. Clique em **Salvar**.

---

## Passo 4: Copiando a Chave do Firebase

Agora vamos pegar as credenciais que conectam o sistema ao seu banco:

1. No canto superior esquerdo (ao lado de "Visão geral do projeto"), clique no **ícone de engrenagem ⚙️** e selecione **Configurações do projeto**.
2. Na aba **Geral**, desça a página até a seção **"Seus aplicativos"**.
3. Clique no ícone de aplicativo Web (**`</>`**).
4. No campo "Apelido do app", digite qualquer nome (ex: `Painel TV`) e **não precisa** marcar a caixa do Firebase Hosting.
5. Clique no botão **Registrar aplicativo**.
6. O Firebase mostrará um bloco de código contendo o objeto `firebaseConfig`. Copie esse bloco:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

## Passo 5: Pegando a Chave Gratuita do ImgBB (Fotos)

O ImgBB é onde suas fotos de fundo e produtos ficarão salvas com link direto de alta velocidade:

1. Acesse: [https://api.imgbb.com/](https://api.imgbb.com/)
2. Se ainda não tiver conta, crie uma gratuitamente ou faça login.
3. Clique no botão azul **"Obter chave de API"** (ou "Get API key").
4. Uma janela abrirá com uma chave alfanumérica de 32 caracteres (exemplo: `d8f49b1a23c4e567f890123456abcdef`).
5. Copie essa chave.

---

## Passo 6: Colando as Chaves no Arquivo `src/firebase.js`

1. Abra a pasta do projeto no seu editor de código (por exemplo, VS Code).
2. Abra o arquivo localizado em: **`src/firebase.js`**.
3. O topo do arquivo foi feito exatamente para você colar suas chaves:

```javascript
// =============================================================================
// 📸 1. HOSPEDAGEM DE IMAGENS (ImgBB)
// =============================================================================
export const IMGBB_API_KEY = "COLE_SUA_CHAVE_DO_IMGBB_AQUI";

// =============================================================================
// 🔥 2. CONFIGURAÇÃO DO FIREBASE (COLE SUA CHAVE BRUTA ABAIXO)
// =============================================================================
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

4. Pressione **Ctrl + S** (ou `Cmd + S` no Mac) para salvar o arquivo.

Pronto! A configuração técnica do sistema está 100% concluída.

---

## Passo 7: Ligando o Sistema e Usando na TV

### 1. Iniciar no seu computador:
Abra o terminal (ou Prompt de Comando) na pasta do projeto e execute:
```bash
npm install
npm run dev
```

### 2. Acessar o Painel de Controle:
* Abra o seu navegador em: `http://localhost:5173/admin`
* Como é seu primeiro acesso, clique em **"Não tem conta? Registre-se agora."**
* Digite seu e-mail e uma senha para criar sua conta de administrador.

### 3. Abrir a Tela na Smart TV:
* No topo do seu Painel de Controle, você verá um botão **"Copiar Link da TV"**.
* O link terá o formato: `http://localhost:5173/tv/SEU_ID_DE_USUARIO`.
* Abra esse link no navegador da sua Smart TV, TV Box, Raspberry Pi ou em um monitor secundário.
* Pressione **F11** no teclado do computador/TV para colocar em **Tela Cheia**.

Tudo o que você alterar no Painel Administrativo (vídeos do YouTube, fotos de fundo, letreiros, QR Code, destaques de produtos ou chamada de senha) atualizará **instantaneamente na TV** sem precisar recarregar a página!

---

## ❓ Perguntas Frequentes & Solução de Problemas

### 1. "Ao tentar fazer upload de imagem, aparece erro de chave do ImgBB."
* **Solução:** Verifique se você colou a chave entre as aspas em `export const IMGBB_API_KEY = "sua_chave"` no arquivo `src/firebase.js`. Você também pode colar a chave diretamente na caixa de texto na barra lateral do Painel Administrativo.

### 2. "Os dados não salvam ou o login dá erro de conexão."
* **Solução:** 
  1. Verifique se o **Realtime Database** foi ativado no Firebase Console.
  2. Verifique se o provedor **E-mail/senha** foi ativado em **Authentication**.
  3. Verifique se copiou todos os campos do `firebaseConfig` corretamente.

### 3. "A TV não exibe o conteúdo que eu mudo no painel."
* **Solução:** Certifique-se de que a URL aberta na TV contém o seu ID de usuário no final (ex: `/tv/aBc123XyZ`). O botão "Copiar Link da TV" no painel já copia a URL completa correta.

---

🎉 **Parabéns! Seu sistema Signage.Pro está pronto e operando!**
