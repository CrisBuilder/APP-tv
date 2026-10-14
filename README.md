# 📺 Signage.Pro - Sistema de Mural Digital e TV Corporativa

> 📘 **Guia Completo Passo a Passo:** Se você acabou de baixar este sistema e quer um passo a passo detalhado com telas e instruções para iniciantes, confira o arquivo [COMO-CONFIGURAR.md](./COMO-CONFIGURAR.md).

Bem-vindo ao código-fonte do **Signage.Pro**! Este é um sistema profissional de *Digital Signage* (Mural Digital) construído com **React** e **Firebase**. Com ele, você pode controlar remotamente qualquer tela ou Smart TV, enviando imagens, vídeos do YouTube, QR Codes, Letreiros e Destaques de Produtos em tempo real.

## 🚀 Como instalar e rodar o projeto

Siga os passos abaixo para configurar o seu próprio sistema:

### 1. Pré-requisitos
* Ter o [Node.js](https://nodejs.org/) instalado no seu computador.
* Ter uma conta no [Firebase](https://firebase.google.com/) (gratuito).
* Ter uma conta no [ImgBB](https://api.imgbb.com/) (gratuito, para upload de imagens).

### 2. Instalação
1. Baixe ou clone este repositório.
2. Abra a pasta do projeto no seu terminal (ou VS Code).
3. Rode o comando abaixo para instalar todas as dependências:
   ```bash
   npm install
   ```

### 3. Configuração das Chaves (O Passo Mais Importante)
Você não precisa vasculhar o código para configurar o sistema. Tudo está centralizado no arquivo **`src/firebase.js`**.

1. Abra o arquivo **`src/firebase.js`**.
2. **Chave de Hospedagem de Imagens (ImgBB):** Crie uma conta gratuita em [api.imgbb.com](https://api.imgbb.com/), copie sua chave e cole no campo `IMGBB_API_KEY`.
3. **Configuração do Firebase:**
   - Acesse o console do [Firebase](https://console.firebase.google.com/) e crie um projeto gratuito.
   - No menu lateral esquerdo, vá em **Criação > Realtime Database** e clique em "Criar banco de dados" (inicie em **Modo de Teste**).
   - No menu lateral esquerdo, vá em **Criação > Authentication**, clique em "Primeiros passos" e ative o provedor **Email/Senha**.
   - Vá nas **Configurações do Projeto** (ícone de engrenagem) > **Geral** > role até **Seus aplicativos** e clique no ícone Web (`</>`).
   - Copie o bloco de código `firebaseConfig` bruto gerado pelo Firebase e **cole exatamente no lugar indicado em `src/firebase.js`**.

O início do arquivo `src/firebase.js` ficará assim:
```javascript
export const IMGBB_API_KEY = "sua_chave_do_imgbb";

export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 4. Rodando o Sistema
Com as chaves configuradas, inicie o servidor:
```bash
npm run dev
```

* **Acesse o Painel de Controle:** Abra `http://localhost:5173/admin`
* **Acesse a TV:** Abra `http://localhost:5173/tv` (Coloque em tela cheia na sua TV).

Tudo que você alterar no Painel de Controle será refletido instantaneamente na TV!

---
## ✨ Funcionalidades Incluídas
* **Fundo Dinâmico:** Upload de Imagens ou links do YouTube (rodando em loop infinito).
* **Letreiro (Marquee):** Adicione avisos e promoções rodapé da tela.
* **QR Code:** Gere QR Codes instantâneos na tela para o seu cliente ler.
* **Produto em Destaque:** Exiba nome, descrição e preço flutuando na tela.
* **Relógio Digital:** Mostre a hora atualizada na TV.
* **Design Premium:** Interface administrativa moderna com *Glassmorphism* e totalmente responsiva para celular.

Aproveite o código! 🚀
