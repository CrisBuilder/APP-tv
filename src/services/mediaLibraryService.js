import { ref, push, set, update, remove, onValue } from 'firebase/database';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

/**
 * Salva um arquivo de mídia (imagem, vídeo ou YouTube) na biblioteca persistente do usuário
 */
export async function saveMediaToLibrary(userId, item) {
  if (!userId || !item?.url) return null;

  const listRef = ref(db, `users/${userId}/mediaLibrary`);
  const newItemRef = push(listRef);
  const payload = {
    name: item.name || 'Mídia sem título',
    url: item.url,
    type: item.type || 'image', // 'image' | 'video' | 'youtube'
    storagePath: item.storagePath || null,
    videoId: item.videoId || null,
    size: item.size || null,
    createdAt: Date.now()
  };

  await set(newItemRef, payload);
  return { id: newItemRef.key, ...payload };
}

/**
 * Escuta em tempo real a biblioteca de mídias salva no Firebase
 */
export function subscribeMediaLibrary(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const listRef = ref(db, `users/${userId}/mediaLibrary`);
  return onValue(listRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }

    const items = Object.entries(data)
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    callback(items);
  });
}

/**
 * Atualiza nome ou URL de uma mídia salva na biblioteca
 */
export async function updateMediaItem(userId, mediaId, updates) {
  if (!userId || !mediaId) return;
  const itemRef = ref(db, `users/${userId}/mediaLibrary/${mediaId}`);
  await update(itemRef, {
    ...updates,
    updatedAt: Date.now()
  });
}

/**
 * Remove uma mídia da biblioteca (e do Storage, se aplicável)
 */
export async function deleteMediaItem(userId, mediaId, storagePath = null) {
  if (!userId || !mediaId) return;
  const itemRef = ref(db, `users/${userId}/mediaLibrary/${mediaId}`);
  await remove(itemRef);

  if (storagePath) {
    try {
      const fileRef = storageRef(storage, storagePath);
      await deleteObject(fileRef);
    } catch {
      // Ignora erro caso o arquivo já não exista no Storage
    }
  }
}
