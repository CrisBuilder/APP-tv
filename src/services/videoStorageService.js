import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Faz upload de um arquivo de vídeo do PC ou celular para o Firebase Storage
 */
export function uploadVideoToStorage(userId, file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!userId || !file) {
      return reject(new Error('Usuário ou arquivo não informado.'));
    }

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `users/${userId}/videos/${Date.now()}_${cleanFileName}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          name: file.name,
          url: downloadUrl,
          storagePath,
          size: file.size,
          type: file.type
        });
      }
    );
  });
}

/**
 * Extrai o ID do YouTube de qualquer formato de link ou shorts
 */
export function extractYoutubeId(link) {
  if (!link) return null;
  const clean = link.trim();
  try {
    if (clean.includes('youtu.be/')) {
      return clean.split('youtu.be/')[1].split(/[?#]/)[0];
    }
    if (clean.includes('youtube.com/watch')) {
      const url = new URL(clean);
      return url.searchParams.get('v');
    }
    if (clean.includes('youtube.com/embed/')) {
      return clean.split('youtube.com/embed/')[1].split(/[?#]/)[0];
    }
    if (clean.includes('youtube.com/shorts/')) {
      return clean.split('youtube.com/shorts/')[1].split(/[?#]/)[0];
    }
    // Se digitou apenas o ID direto de 11 caracteres
    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
      return clean;
    }
    return clean;
  } catch {
    return null;
  }
}
