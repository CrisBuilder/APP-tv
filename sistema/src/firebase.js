import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// =============================================================================
// 📺 SIGNAGE.PRO - CONFIGURAÇÕES DO SISTEMA
// =============================================================================
// Este arquivo é o ÚNICO lugar que você precisa editar para conectar o sistema 
// ao seu próprio Firebase e ao serviço de hospedagem de imagens.
// =============================================================================

// =============================================================================
// 📸 1. HOSPEDAGEM DE IMAGENS (ImgBB)
// =============================================================================
// Crie sua chave gratuita de API em: https://api.imgbb.com/
// Cole a sua chave entre as aspas abaixo (ou configure VITE_IMGBB_API_KEY no arquivo .env):
export const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || "";

// =============================================================================
// 🔥 2. CONFIGURAÇÃO DO FIREBASE (COLE SUA CHAVE BRUTA ABAIXO)
// =============================================================================
// Instruções:
// 1. Acesse o console do Firebase: https://console.firebase.google.com/
// 2. Crie um projeto (ou selecione um existente).
// 3. Vá em "Configurações do Projeto" (ícone de engrenagem) > Geral > "Seus aplicativos" > Web (</>).
// 4. Copie o bloco "firebaseConfig" que o Firebase fornecer e COLE EXATAMENTE AQUI:

export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  databaseURL: "" // Opcional (se não preenchido, o sistema detecta automaticamente)
};

// =============================================================================
// ⛔ NÃO É NECESSÁRIO MODIFICAR NADA ABAIXO DESTA LINHA
// =============================================================================

// Verifica se as credenciais do Firebase foram configuradas
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey.trim() !== "" &&
  !firebaseConfig.apiKey.includes("COLE_") &&
  !firebaseConfig.apiKey.includes("SUA_")
);

// Configuração dummy para evitar crash da aplicação durante a inicialização antes de colar as chaves
const activeConfig = isFirebaseConfigured
  ? firebaseConfig
  : {
      apiKey: "AIzaSy_CONFIGURACAO_PENDENTE_VER_FIREBASE_JS",
      authDomain: "pendente.firebaseapp.com",
      projectId: "pendente",
      storageBucket: "pendente.appspot.com",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:000000000000"
    };

// Inicializa a aplicação Firebase
const app = !getApps().length ? initializeApp(activeConfig) : getApp();

// Conecta ao Realtime Database (com suporte automático ao endpoint default caso omitido)
const getDatabaseInstance = () => {
  if (firebaseConfig.databaseURL && firebaseConfig.databaseURL.trim() !== "") {
    return getDatabase(app, firebaseConfig.databaseURL);
  }
  if (firebaseConfig.projectId && isFirebaseConfigured) {
    const defaultUrl = `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com`;
    return getDatabase(app, defaultUrl);
  }
  return getDatabase(app);
};

export const db = getDatabaseInstance();
export const auth = getAuth(app);
