import { useState } from 'react';
import { Tag, CheckCircle2, Trash2 } from 'lucide-react';
import { broadcastToDisplays } from '../../services/displayService';
import DisplayTargetSelector from '../DisplayTargetSelector';

export default function ProductTab({
  user,
  displays,
  selectedDisplayId,
  initialProduct = {}
}) {
  const [targets, setTargets] = useState(selectedDisplayId);
  const [name, setName] = useState(initialProduct.name || '');
  const [desc, setDesc] = useState(initialProduct.desc || '');
  const [price, setPrice] = useState(initialProduct.price || '');
  const [statusMsg, setStatusMsg] = useState('');

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe ao menos o nome do produto ou serviço.');
      return;
    }

    // Formata o preço se o usuário digitou só número
    let formattedPrice = price.trim();
    if (formattedPrice && !formattedPrice.toUpperCase().includes('MTN') && !formattedPrice.toUpperCase().includes('MZN')) {
      formattedPrice = `${formattedPrice} MTN`;
    }

    await broadcastToDisplays(user.uid, targets, 'product', {
      name: name.trim(),
      desc: desc.trim(),
      price: formattedPrice,
      visible: true,
      timestamp: Date.now()
    }, displays);

    setStatusMsg('Destaque de produto atualizado na TV!');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleClear = async () => {
    await broadcastToDisplays(user.uid, targets, 'product', {
      name: '',
      desc: '',
      price: '',
      visible: false
    }, displays);
    setName('');
    setDesc('');
    setPrice('');
    setStatusMsg('Card de produto removido da TV.');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  return (
    <div className="df-card">
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--ink)' }}>
          Destaque de Produto & Preço (Menu Digital)
        </h3>
        <p style={{ color: 'var(--mute)', fontSize: '0.88rem' }}>
          Card visual em vidro escuro cinematográfico para apresentar pratos do dia, lançamentos ou promoções relâmpago.
        </p>
      </div>

      <DisplayTargetSelector
        displays={displays}
        globalTarget={selectedDisplayId}
        selectedTargets={Array.isArray(targets) ? targets : [targets]}
        onChangeTargets={setTargets}
      />

      {statusMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--ok-soft)', color: 'var(--ok-text)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-btn)', fontSize: '0.88rem', fontWeight: '600', marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} /> {statusMsg}
        </div>
      )}

      <form onSubmit={handlePublish}>
        <div className="df-grid-2">
          <div className="df-field">
            <label>Nome do Produto ou Prato</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Combo Burger Especial + Fritas"
              required
            />
          </div>

          <div className="df-field">
            <label>Preço em Metical (MTN)</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex: 450 MTN"
            />
          </div>
        </div>

        <div className="df-field">
          <label>Descrição Curta / Ingredientes / Benefícios</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
            placeholder="Ex: Pão brioche artesanal, hambúrguer 180g, queijo cheddar duplo e molho especial da casa."
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <button type="submit" className="df-btn df-btn-pri" style={{ minWidth: '160px' }}>
            <Tag size={16} /> Exibir Produto na TV
          </button>

          <button type="button" onClick={handleClear} className="df-btn df-btn-sec">
            <Trash2 size={16} color="var(--bad)" /> Ocultar da TV
          </button>
        </div>
      </form>
    </div>
  );
}
