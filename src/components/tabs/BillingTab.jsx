import { useState, useEffect } from 'react';
import { PLANS, validateMpesaNumber, initiateMpesaPayment, confirmMpesaSubscription, getUserSubscription } from '../../services/mpesaService';
import { CreditCard, Check, Smartphone, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export default function BillingTab({ user }) {
  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [ussdModal, setUssdModal] = useState(null);
  const [pin, setPin] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user?.uid) {
      getUserSubscription(user.uid).then(setSubscription);
    }
  }, [user]);

  const handleStartCheckout = (plan) => {
    setSelectedPlan(plan);
    setPhoneNumber('');
  };

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    if (!validateMpesaNumber(phoneNumber)) {
      alert('Informe um número válido da Vodacom Moçambique (iniciando por 84 ou 85).');
      return;
    }

    setLoading(true);
    try {
      const response = await initiateMpesaPayment({
        userId: user.uid,
        planId: selectedPlan.id,
        phoneNumber,
        isSandbox: true
      });

      // Abre o popup simulado de USSD Push
      setUssdModal(response);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPin = async (e) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      alert('Digite seu PIN do M-Pesa de 4 dígitos.');
      return;
    }

    setLoading(true);
    try {
      const updatedSub = await confirmMpesaSubscription(user.uid, {
        planId: selectedPlan.id,
        reference: ussdModal.reference,
        msisdn: ussdModal.msisdn,
        amountMtn: ussdModal.amountMtn
      });

      setSubscription(updatedSub);
      setUssdModal(null);
      setSelectedPlan(null);
      setPin('');
      setSuccessMsg(`Pagamento de ${updatedSub.amountMtn} MTN aprovado! Seu plano ${updatedSub.planName} foi ativado com sucesso.`);
    } catch (err) {
      alert('Erro na confirmação: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--ink)' }}>
          Planos de Assinatura & Pagamento M-Pesa
        </h2>
        <p style={{ color: 'var(--mute)', fontSize: '0.88rem' }}>
          Valores em moeda oficial Metical (MTN) com débito instantâneo via M-Pesa Vodacom Moçambique.
        </p>
      </div>

      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--ok-soft)', color: 'var(--ok-text)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-card)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1.5rem' }}>
          <CheckCircle2 size={20} /> {successMsg}
        </div>
      )}

      {/* Card do Plano Ativo */}
      {subscription && (
        <div className="df-card df-card-hero" style={{ marginBottom: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="df-chip" style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF', marginBottom: '0.5rem' }}>
                Assinatura Atual
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Plano {subscription.planName}</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Status: <strong>{subscription.status === 'ACTIVE' ? 'Ativo & Operacional' : 'Período de Testes'}</strong>
                {subscription.amountMtn > 0 && ` • ${subscription.amountMtn} MTN / mês`}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="df-chip df-chip-ok" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                ✓ M-Pesa Habilitado
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grade de Planos */}
      <div className="df-grid-3">
        {PLANS.map((plan) => {
          const isCurrent = subscription?.planId === plan.id;
          return (
            <div
              key={plan.id}
              className="df-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                border: plan.popular ? '2px solid var(--pri)' : '1px solid var(--line)',
                position: 'relative'
              }}
            >
              {plan.popular && (
                <div style={{ position: 'absolute', top: '-12px', right: '16px', background: 'var(--pri)', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: '800', padding: '2px 10px', borderRadius: 'var(--radius-pill)' }}>
                  Mais Recomendado
                </div>
              )}

              <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--ink)' }}>{plan.name}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--mute)', margin: '0.5rem 0 1rem 0' }}>{plan.description}</p>

              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--pri)' }}>
                  {plan.priceMtn.toLocaleString('pt-MZ')} MTN
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--mute)' }}> / mês</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--ink)', marginBottom: '1.5rem', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} color="var(--ok)" /> Até <strong>{plan.displaysLimit} Telas</strong> conectadas
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} color="var(--ok)" /> Armazenamento de <strong>{plan.storage}</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} color="var(--ok)" /> Letreiro, Produtos e QR Codes
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} color="var(--ok)" /> Chamador de Senhas com Áudio
                </li>
              </ul>

              <button
                type="button"
                onClick={() => handleStartCheckout(plan)}
                className={`df-btn ${isCurrent ? 'df-btn-sec' : 'df-btn-pri'}`}
                style={{ width: '100%' }}
              >
                {isCurrent ? 'Plano Ativo' : 'Escolher este Plano'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal de Pagamento M-Pesa */}
      {selectedPlan && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(22, 27, 61, 0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="df-card" style={{ maxWidth: '440px', width: '100%', position: 'relative', margin: 0, boxShadow: 'var(--shadow-pop)' }}>
            <button onClick={() => setSelectedPlan(null)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mute)' }}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.25rem' }}>Pagar com M-Pesa</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--mute)', marginBottom: '1rem' }}>
              Plano: <strong>{selectedPlan.name}</strong> • Valor: <strong>{selectedPlan.priceMtn} MTN</strong>
            </p>

            <form onSubmit={handleInitiatePayment}>
              <div className="df-field">
                <label>Número M-Pesa (Vodacom 84 ou 85)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '700', color: 'var(--mute)', fontSize: '0.9rem' }}>+258</span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="84 123 4567"
                    maxLength={12}
                    required
                    style={{ fontSize: '1.05rem', fontWeight: '600' }}
                  />
                </div>
              </div>

              <button type="submit" className="df-btn df-btn-pri" disabled={loading} style={{ width: '100%', marginTop: '0.75rem' }}>
                <Smartphone size={18} /> {loading ? 'Enviando solicitação...' : 'Receber Pedido de PIN no Celular'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Simulação Interativa do Push USSD no Telemóvel */}
      {ussdModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
          <div style={{ maxWidth: '360px', width: '100%', background: '#111827', color: '#FFFFFF', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', border: '1px solid #374151', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '10px', background: '#DC2626', borderRadius: '50%', marginBottom: '0.75rem' }}>
              <Smartphone size={24} color="#FFFFFF" />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem' }}>Vodacom M-Pesa</h4>
            <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginBottom: '1.25rem' }}>Ref: {ussdModal.reference}</p>

            <div style={{ background: '#1F2937', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', lineHeight: '1.5', textAlign: 'left', marginBottom: '1.25rem' }}>
              Confirmar pagamento de <strong>{ussdModal.amountMtn} MTN</strong> para <strong>DisplayFlow</strong>?
              <br /><span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Digite seu PIN do M-Pesa para autorizar:</span>
            </div>

            <form onSubmit={handleConfirmPin}>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                style={{ width: '100%', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', padding: '0.65rem', borderRadius: '10px', border: '1px solid #4B5563', background: '#374151', color: '#FFFFFF', marginBottom: '1rem' }}
                autoFocus
                required
              />

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={() => setUssdModal(null)} className="df-btn df-btn-sec" style={{ flex: 1, color: '#9CA3AF', borderColor: '#4B5563', background: 'transparent' }}>
                  Cancelar
                </button>
                <button type="submit" className="df-btn" style={{ flex: 1, background: '#DC2626', color: '#FFFFFF', fontWeight: '700' }} disabled={loading}>
                  {loading ? 'Validando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
