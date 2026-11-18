import { ref, update, get } from 'firebase/database';
import { db } from '../firebase';

export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    priceMtn: 960,
    displaysLimit: 3,
    storage: '5 GB',
    description: 'Ideal para lojas de pequeno porte, clínicas ou cafés com até 3 telas.'
  },
  {
    id: 'business',
    name: 'Business Pro',
    priceMtn: 3130,
    displaysLimit: 15,
    storage: '50 GB',
    popular: true,
    description: 'Perfeito para redes de varejo, restaurantes e academias com agendamento avançado.'
  },
  {
    id: 'network',
    name: 'Network Enterprise',
    priceMtn: 9520,
    displaysLimit: 60,
    storage: '250 GB',
    description: 'Para redes de franquias, shoppings e operadoras de mídia digital.'
  }
];

export function validateMpesaNumber(number) {
  if (!number) return false;
  const cleaned = number.replace(/\D/g, '');
  const vodacomRegex = /^(?:258)?(84|85)\d{7}$/;
  return vodacomRegex.test(cleaned);
}

export function formatMsisdn(number) {
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.startsWith('258')) return cleaned;
  return `258${cleaned}`;
}

export function generateTransactionReference() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `DF-${rand}`;
}

/**
 * Inicia pagamento C2B
 * Se isSandbox for true: executa no frontend com USSD interativo
 * Se isSandbox for false: chama o backend DisplayFlow M-Pesa Gateway
 */
export async function initiateMpesaPayment({ userId, planId, phoneNumber, isSandbox = true }) {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error('Plano selecionado inválido.');

  if (!validateMpesaNumber(phoneNumber)) {
    throw new Error('Por favor, informe um número Vodacom válido iniciado por 84 ou 85.');
  }

  const msisdn = formatMsisdn(phoneNumber);
  const reference = generateTransactionReference();

  if (isSandbox) {
    return {
      status: 'PENDING_USER_PIN',
      reference,
      msisdn,
      amountMtn: plan.priceMtn,
      planName: plan.name,
      createdAt: Date.now()
    };
  }

  // Chamada ao Backend Real quando as credenciais estiverem ativas
  const backendUrl = import.meta.env.VITE_MPESA_BACKEND_URL || 'http://localhost:3001';
  const response = await fetch(`${backendUrl}/api/mpesa/c2b`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      msisdn,
      amount: plan.priceMtn,
      reference,
      thirdPartyReference: reference
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao processar C2B na Vodacom');
  }

  return {
    status: 'REAL_SENT',
    data,
    reference,
    msisdn,
    amountMtn: plan.priceMtn,
    planName: plan.name
  };
}

export async function confirmMpesaSubscription(userId, { planId, reference, msisdn, amountMtn }) {
  const plan = PLANS.find((p) => p.id === planId) || PLANS[0];
  const subRef = ref(db, `users/${userId}/subscription`);

  const payload = {
    planId: plan.id,
    planName: plan.name,
    status: 'ACTIVE',
    provider: 'MPESA_VODACOM',
    amountMtn,
    msisdn,
    reference,
    updatedAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
  };

  await update(subRef, payload);

  const invoiceRef = ref(db, `users/${userId}/invoices/${reference}`);
  await update(invoiceRef, {
    reference,
    planName: plan.name,
    amountMtn,
    currency: 'MTN',
    status: 'PAID',
    provider: 'M-Pesa (Vodacom)',
    paidAt: Date.now()
  });

  return payload;
}

export async function getUserSubscription(userId) {
  if (!userId) return null;
  const subRef = ref(db, `users/${userId}/subscription`);
  const snapshot = await get(subRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return {
    planId: 'starter',
    planName: 'Starter (Demonstração)',
    status: 'TRIAL',
    amountMtn: 0
  };
}
