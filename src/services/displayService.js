import { ref, set, update, remove, onValue, get } from 'firebase/database';
import { db } from '../firebase';

/**
 * Cria ou atualiza uma tela na conta do usuário
 */
export async function saveDisplay(userId, displayData) {
  if (!userId) return null;
  const displayId = displayData.id || `tv_${Date.now()}`;
  const displayRef = ref(db, `users/${userId}/displays/${displayId}`);
  
  const payload = {
    id: displayId,
    name: displayData.name || 'Nova TV',
    location: displayData.location || 'Geral',
    createdAt: displayData.createdAt || Date.now(),
    updatedAt: Date.now(),
    status: displayData.status || 'online',
    state: displayData.state || {
      background: { type: 'none' },
      announcement: { visible: false, text: '' },
      product: { visible: false, name: '', desc: '', price: '' },
      qrCode: { visible: false, url: '' },
      ticket: { visible: false, number: '', desk: '', timestamp: 0 }
    }
  };

  await set(displayRef, payload);
  return payload;
}

/**
 * Remove uma tela do usuário
 */
export async function deleteDisplay(userId, displayId) {
  if (!userId || !displayId) return;
  const displayRef = ref(db, `users/${userId}/displays/${displayId}`);
  await remove(displayRef);
}

/**
 * Ouve em tempo real as telas cadastradas pelo usuário
 */
export function subscribeUserDisplays(userId, callback) {
  if (!userId) return () => {};
  const displaysRef = ref(db, `users/${userId}/displays`);
  
  return onValue(displaysRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list = Object.keys(data).map((key) => ({
        id: key,
        ...data[key]
      }));
      callback(list);
    } else {
      callback([]);
    }
  });
}

/**
 * Atualiza o conteúdo exibido na(s) tela(s)
 * targets: 'all', ou ID único 'tv_123', ou array de IDs ['tv_1', 'tv_2']
 */
export async function broadcastToDisplays(userId, targets, nodeKey, payload, allDisplays = []) {
  if (!userId) return;

  const targetList = targets === 'all'
    ? allDisplays.map((d) => d.id)
    : Array.isArray(targets) ? targets : [targets];

  const updates = {};

  // Atualiza cada tela individual
  targetList.forEach((id) => {
    updates[`users/${userId}/displays/${id}/state/${nodeKey}`] = payload;
  });

  // Mantém retrocompatibilidade com o nó legado do Signage.Pro
  updates[`users/${userId}/displayState/${nodeKey}`] = payload;

  await update(ref(db), updates);
}

/**
 * Gera um código temporário de 6 caracteres para emparelhamento de nova TV
 */
export async function createPairingSession() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const pairingRef = ref(db, `pairings/${code}`);
  const session = {
    code,
    status: 'PENDING',
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutos
  };

  await set(pairingRef, session);
  return session;
}

/**
 * Reclama um código de 6 caracteres no painel de administração
 */
export async function claimPairingCode(userId, code, displayName, location, existingDisplayId = '') {
  if (!userId || !code) throw new Error('Código ou usuário inválido');
  const cleanCode = code.toUpperCase().trim();
  const pairingRef = ref(db, `pairings/${cleanCode}`);
  
  const snapshot = await get(pairingRef);
  if (!snapshot.exists()) {
    throw new Error('Código de emparelhamento não encontrado.');
  }

  const session = snapshot.val();
  if (session.status !== 'PENDING') {
    throw new Error('Este código já foi utilizado.');
  }

  if (Date.now() > session.expiresAt) {
    throw new Error('O código de emparelhamento expirou.');
  }

  let targetDisplay;
  if (existingDisplayId) {
    const existingSnap = await get(ref(db, `users/${userId}/displays/${existingDisplayId}`));
    if (existingSnap.exists()) {
      targetDisplay = { id: existingDisplayId, ...existingSnap.val() };
      await update(ref(db, `users/${userId}/displays/${existingDisplayId}`), {
        status: 'online',
        lastSeen: Date.now()
      });
    }
  }

  if (!targetDisplay) {
    targetDisplay = await saveDisplay(userId, {
      name: displayName || `TV ${cleanCode}`,
      location: location || 'Emparelhada por código'
    });
  }

  // Atualiza a sessão avisando a TV para se conectar a este display
  await update(pairingRef, {
    status: 'PAIRED',
    userId,
    displayId: targetDisplay.id,
    claimedAt: Date.now()
  });

  return targetDisplay;
}

/**
 * Envia sinal de vida (heartbeat) da TV conectada
 */
export async function sendDisplayHeartbeat(userId, displayId) {
  if (!userId || !displayId) return;
  await update(ref(db, `users/${userId}/displays/${displayId}`), {
    lastSeen: Date.now(),
    status: 'online'
  });
}

/**
 * Atualiza nome e localização de uma TV
 */
export async function updateDisplayMeta(userId, displayId, { name, location }) {
  if (!userId || !displayId) return;
  await update(ref(db, `users/${userId}/displays/${displayId}`), {
    name: name || 'TV',
    location: location || 'Geral',
    updatedAt: Date.now()
  });
}

/**
 * Atualiza ajustes de imagem e relógio da TV
 */
export async function updateDisplaySettings(userId, displayId, settings) {
  if (!userId || !displayId) return;
  await update(ref(db, `users/${userId}/displays/${displayId}/settings`), {
    ...settings,
    updatedAt: Date.now()
  });
}

/**
 * Escuta o status do código na tela da TV até ser emparelhado
 */
export function listenPairingSession(code, onPaired) {
  if (!code) return () => {};
  const pairingRef = ref(db, `pairings/${code}`);
  return onValue(pairingRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.status === 'PAIRED' && data.userId && data.displayId) {
        onPaired(data);
      }
    }
  });
}
