import { useState } from 'react';
import { claimPairingCode, saveDisplay } from '../services/displayService';
import { Tv, KeyRound, Plus, X, Smartphone } from 'lucide-react';

export default function PairingModal({ isOpen, onClose, user, onDisplayCreated }) {
  const [tab, setTab] = useState('code'); // 'code' | 'manual'
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePairWithCode = async (e) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      setErrorMsg('Digite o código de 6 caracteres exibido na TV.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const display = await claimPairingCode(user.uid, code, name, location);
      alert(`Tela "${display.name}" emparelhada com sucesso!`);
      onDisplayCreated?.(display);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Falha ao emparelhar com o código.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManual = async (e) => {
    e.preventDefault();
    if (!name) {
      setErrorMsg('Informe um nome para a tela.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const display = await saveDisplay(user.uid, {
        name,
        location: location || 'Principal'
      });
      alert(`Tela "${display.name}" adicionada com sucesso!`);
      onDisplayCreated?.(display);
      onClose();
    } catch (err) {
      setErrorMsg('Erro ao cadastrar tela: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(22, 27, 61, 0.45)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div className="df-card" style={{ maxWidth: '480px', width: '100%', position: 'relative', margin: 0, boxShadow: 'var(--shadow-pop)' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mute)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'var(--tint)', color: 'var(--pri)', padding: '8px', borderRadius: '10px' }}>
            <Tv size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--ink)' }}>Adicionar Nova Tela</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--mute)' }}>Conecte uma Smart TV, Box Android ou monitor</p>
          </div>
        </div>

        {/* Abas do Modal */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--line)', paddingBottom: '0.5rem' }}>
          <button
            type="button"
            className={`df-chip ${tab === 'code' ? 'df-chip-pri' : ''}`}
            onClick={() => { setTab('code'); setErrorMsg(''); }}
            style={{ border: 'none', cursor: 'pointer', padding: '6px 14px' }}
          >
            <KeyRound size={14} /> Digitar Código da TV (6 Dígitos)
          </button>
          <button
            type="button"
            className={`df-chip ${tab === 'manual' ? 'df-chip-pri' : ''}`}
            onClick={() => { setTab('manual'); setErrorMsg(''); }}
            style={{ border: 'none', cursor: 'pointer', padding: '6px 14px' }}
          >
            <Plus size={14} /> Criar por Nome
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'var(--bad-soft)', color: 'var(--bad-text)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-btn)', fontSize: '0.82rem', marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        {tab === 'code' ? (
          <form onSubmit={handlePairWithCode}>
            <div className="df-field">
              <label>Código de 6 Caracteres na TV</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: 8K2M9X"
                maxLength={6}
                style={{ fontSize: '1.2rem', letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--mute)' }}>
                Abra <code>/pair</code> na TV para visualizar o código gerado.
              </span>
            </div>

            <div className="df-field">
              <label>Identificação da TV (Opcional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: TV Recepção, Vitrine..."
              />
            </div>

            <div className="df-field">
              <label>Localização / Cidade (Opcional)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Loja Central, Maputo"
              />
            </div>

            <button type="submit" className="df-btn df-btn-pri" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? 'Emparelhando...' : 'Confirmar & Conectar TV'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreateManual}>
            <div className="df-field">
              <label>Nome da Tela</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Painel LED Entrada"
                required
              />
            </div>

            <div className="df-field">
              <label>Local / Ambiente</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Restaurante 1º Andar"
              />
            </div>

            <button type="submit" className="df-btn df-btn-pri" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? 'Criando...' : 'Salvar Nova Tela'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
