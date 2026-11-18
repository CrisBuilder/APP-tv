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

/**
 * Valida se é um número válido da Vodacom Moçambique (84 ou 85)
 */
export function validateMpesaNumber(number) {
  if (!number) return false;
  // Remove caracteres especiais
  const cleaned = number.replace(/\D/g, '');
  // Aceita formatos: 84XXXXXXX, 85XXXXXXX, 25884XXXXXXX, 25885XXXXXXX
  const vodacomRegex = /^(?:258)?(84|85)\d{7}$/;
  return vodacomRegex.test(cleaned);
}

/**
 * Formata o número para o padrão internacional MSISDN
 */
export function formatMsisdn(number) {
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.startsWith('258')) return cleaned;
  return `258${cleaned}`;
}

/**
 * Gera código de referência única DisplayFlow
 */
export function generateTransactionReference() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `DF-${rand}`;
}

/**
 * Processa a cobrança C2B M-Pesa
 * Suporta modo Sandbox/Demonstração interativa e modo Real
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
    // Retorna os dados para a simulação do push USSD no telemóvel do cliente
    return {
      status: 'PENDING_USER_PIN',
      reference,
      msisdn,
      amountMtn: plan.priceMtn,
      planName: plan.name,
      createdAt: Date.now()
    };
  }

  // --- Modo Real (Quando as credenciais forem ativadas no backend/env) ---
  // A integração C2B na Vodacom Moçambique é feita enviando POST para a porta 18352
  // com Authorization: Bearer RSA(ApiKey)
  throw new Error('Ambiente de produção aguardando credenciais oficiais da Vodacom no portal developer.mpesa.vm.co.mz');
}

/**
 * Conclui a transação e atualiza a assinatura no banco de dados
 */
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
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 dias
  };

  await update(subRef, payload);

  // Registra fatura no histórico
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

/**
 * Consulta a assinatura atual do usuário
 */
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
