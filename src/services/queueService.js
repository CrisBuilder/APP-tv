import { ref, push, set, update, remove, onValue, get } from 'firebase/database';
import { db } from '../firebase';

/**
 * Emite uma nova senha na fila ('A' = Comum, 'P' = Prioritária)
 */
export async function emitTicket(userId, prefix = 'A') {
  if (!userId) return null;
  const countersRef = ref(db, `users/${userId}/queue/counters/${prefix}`);
  const snap = await get(countersRef);
  const nextNumber = (snap.exists() ? Number(snap.val()) : 0) + 1;

  await set(countersRef, nextNumber);
  const code = `${prefix}${String(nextNumber).padStart(3, '0')}`;

  const waitingRef = push(ref(db, `users/${userId}/queue/waiting`));
  const ticket = {
    id: waitingRef.key,
    code,
    type: prefix,
    createdAt: Date.now()
  };

  await set(waitingRef, ticket);
  return ticket;
}

/**
 * Escuta em tempo real a fila de espera e os atendimentos do dia
 */
export function subscribeQueue(userId, callback) {
  if (!userId) {
    callback({ waiting: [], completed: [] });
    return () => {};
  }

  const queueRef = ref(db, `users/${userId}/queue`);
  return onValue(queueRef, (snapshot) => {
    const data = snapshot.val() || {};
    const waitingRaw = data.waiting || {};
    const completedRaw = data.completed || {};

    const waiting = Object.entries(waitingRaw)
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => {
        if (a.type === 'P' && b.type !== 'P') return -1;
        if (a.type !== 'P' && b.type === 'P') return 1;
        return (a.createdAt || 0) - (b.createdAt || 0);
      });

    const completed = Object.entries(completedRaw)
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => (b.calledAt || 0) - (a.calledAt || 0));

    callback({ waiting, completed });
  });
}

/**
 * Move a senha para atendimentos concluídos e registra chamada
 */
export async function completeTicketCall(userId, ticket, desk) {
  if (!userId || !ticket?.id) return;
  await remove(ref(db, `users/${userId}/queue/waiting/${ticket.id}`));

  const completedRef = push(ref(db, `users/${userId}/queue/completed`));
  await set(completedRef, {
    code: ticket.code,
    type: ticket.type,
    desk,
    createdAt: ticket.createdAt,
    calledAt: Date.now()
  });
}

/**
 * Cancela uma senha que está aguardando na fila
 */
export async function cancelWaitingTicket(userId, ticketId) {
  if (!userId || !ticketId) return;
  await remove(ref(db, `users/${userId}/queue/waiting/${ticketId}`));
}

/**
 * Devolve uma senha do histórico (ausência) para a fila de espera
 */
export async function returnTicketToQueue(userId, completedItem) {
  if (!userId || !completedItem?.id) return;
  await remove(ref(db, `users/${userId}/queue/completed/${completedItem.id}`));

  const waitingRef = push(ref(db, `users/${userId}/queue/waiting`));
  await set(waitingRef, {
    id: waitingRef.key,
    code: completedItem.code,
    type: completedItem.type,
    createdAt: Date.now()
  });
}

/**
 * Atualiza a lista de salas/balcões/guichês personalizados
 */
export async function saveDesksList(userId, desks) {
  if (!userId) return;
  await update(ref(db, `users/${userId}/queue`), { desks });
}
