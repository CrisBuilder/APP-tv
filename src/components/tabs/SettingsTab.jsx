import { useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../../firebase';
import { Settings, CheckCircle2, ShieldCheck, Key } from 'lucide-react';

export default function SettingsTab({
  user,
  profile = {},
  imgbbKey = '',
  onUpdateProfile,
  onUpdateImgbbKey
}) {
  const [name, setName] = useState(profile.name || user?.email?.split('@')[0] || '');
  const [city, setCity] = useState(profile.city || 'Maputo, Moçambique');
  const [currentImgbbKey, setCurrentImgbbKey] = useState(imgbbKey);
  const [statusMsg, setStatusMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = {
        'profile/name': name.trim(),
        'profile/city': city.trim(),
        'settings/imgbbKey': currentImgbbKey.trim(),
        'settings/timezone': 'Africa/Maputo'
      };

      await update(ref(db, `users/${user.uid}`), updates);
      onUpdateProfile?.({ name: name.trim(), city: city.trim() });
      onUpdateImgbbKey?.(currentImgbbKey.trim());

      setStatusMsg('Configurações salvas com sucesso!');
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      alert('Erro ao salvar configurações: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="df-card">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--ink)' }}>
          Configurações da Conta & Conexões
        </h2>
        <p style={{ color: 'var(--mute)', fontSize: '0.88rem' }}>
          Personalize as informações da sua empresa e conecte os serviços de armazenamento de imagens.
        </p>
      </div>

      {statusMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--ok-soft)', color: 'var(--ok-text)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-btn)', fontSize: '0.88rem', fontWeight: '600', marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} /> {statusMsg}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="df-grid-2">
          <div className="df-field">
            <label>Nome do Negócio / Administrador</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Restaurante Zambi, Loja Maputo..."
              required
            />
          </div>

          <div className="df-field">
            <label>Cidade / Província</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Maputo, Matola, Beira, Nampula..."
              required
            />
          </div>
        </div>

        <div style={{ margin: '1.25rem 0', padding: '1.25rem', background: 'var(--bg)', borderRadius: 'var(--radius-card)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Key size={18} color="var(--pri)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Hospedagem de Imagens (ImgBB API)</h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--mute)', marginBottom: '0.75rem' }}>
            Para fazer upload de imagens diretamente do seu smartphone ou PC, obtenha uma chave gratuita em <a href="https://api.imgbb.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pri)', fontWeight: '600' }}>api.imgbb.com</a> e cole abaixo.
          </p>
          <div className="df-field" style={{ marginBottom: 0 }}>
            <input
              type="text"
              value={currentImgbbKey}
              onChange={(e) => setCurrentImgbbKey(e.target.value)}
              placeholder="Cole sua API Key do ImgBB..."
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--mute)' }}>
            <ShieldCheck size={16} color="var(--ok)" /> Fuso Horário Padrão: <strong>Africa/Maputo (GMT+2)</strong>
          </div>

          <button type="submit" className="df-btn df-btn-pri" disabled={saving} style={{ minWidth: '160px' }}>
            <Settings size={16} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
