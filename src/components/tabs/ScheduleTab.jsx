import { useState } from 'react';
import { Clock, CheckCircle2, Plus, Trash2, Power } from 'lucide-react';
import { broadcastToDisplays } from '../../services/displayService';
import DisplayTargetSelector from '../DisplayTargetSelector';

const DEFAULT_SHIFTS = [
  { id: 'shift_1', name: 'Café da Manhã & Manhã', start: '07:00', end: '11:00', mediaUrl: '', mediaType: 'image' },
  { id: 'shift_2', name: 'Almoço & Menu do Dia', start: '11:00', end: '15:00', mediaUrl: '', mediaType: 'image' },
  { id: 'shift_3', name: 'Tarde & Ofertas Especiais', start: '15:00', end: '19:00', mediaUrl: '', mediaType: 'image' },
  { id: 'shift_4', name: 'Jantar & Noite', start: '19:00', end: '23:00', mediaUrl: '', mediaType: 'image' }
];

export default function ScheduleTab({
  user,
  displays,
  selectedDisplayId,
  initialSchedule = {}
}) {
  const [targets, setTargets] = useState(selectedDisplayId);
  const [enabled, setEnabled] = useState(initialSchedule.enabled || false);
  const [shifts, setShifts] = useState(initialSchedule.shifts || DEFAULT_SHIFTS);
  const [statusMsg, setStatusMsg] = useState('');

  const handleUpdateShift = (index, field, value) => {
    const updated = [...shifts];
    updated[index][field] = value;
    setShifts(updated);
  };

  const handleAddShift = () => {
    const newShift = {
      id: `shift_${Date.now()}`,
      name: 'Novo Turno',
      start: '08:00',
      end: '12:00',
      mediaUrl: '',
      mediaType: 'image'
    };
    setShifts([...shifts, newShift]);
  };

  const handleRemoveShift = (index) => {
    if (shifts.length <= 1) {
      alert('Você precisa manter ao menos um turno cadastrado.');
      return;
    }
    setShifts(shifts.filter((_, i) => i !== index));
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();

    const payload = {
      enabled,
      shifts,
      updatedAt: Date.now()
    };

    await broadcastToDisplays(user.uid, targets, 'schedule', payload, displays);

    setStatusMsg('Programação de horários salva e ativada nas TVs!');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  return (
    <div className="df-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--ink)' }}>
            Agendamento por Horários & Turnos
          </h3>
          <p style={{ color: 'var(--mute)', fontSize: '0.88rem' }}>
            A TV troca o conteúdo automaticamente de acordo com o horário do dia (ex: café, almoço e jantar).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`df-btn ${enabled ? 'df-btn-pri' : 'df-btn-sec'}`}
          style={{ padding: '0.5rem 1rem' }}
        >
          <Power size={16} />
          {enabled ? '✓ Agendamento Ativo' : 'Agendamento Desativado'}
        </button>
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

      <form onSubmit={handleSaveSchedule}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {shifts.map((shift, idx) => (
            <div
              key={shift.id || idx}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-btn)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={shift.name}
                  onChange={(e) => handleUpdateShift(idx, 'name', e.target.value)}
                  placeholder="Nome do Turno"
                  style={{ fontWeight: '700', fontSize: '0.95rem', border: 'none', background: 'transparent', outline: 'none', color: 'var(--ink)' }}
                  required
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                    <Clock size={14} color="var(--pri)" />
                    <input
                      type="time"
                      value={shift.start}
                      onChange={(e) => handleUpdateShift(idx, 'start', e.target.value)}
                      style={{ padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--line)' }}
                      required
                    />
                    <span>até</span>
                    <input
                      type="time"
                      value={shift.end}
                      onChange={(e) => handleUpdateShift(idx, 'end', e.target.value)}
                      style={{ padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--line)' }}
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveShift(idx)}
                    className="df-btn df-btn-bad"
                    style={{ padding: '0.35rem 0.55rem', minHeight: 'auto' }}
                    title="Excluir turno"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="df-field" style={{ marginBottom: 0 }}>
                <input
                  type="url"
                  value={shift.mediaUrl}
                  onChange={(e) => handleUpdateShift(idx, 'mediaUrl', e.target.value)}
                  placeholder="URL da Imagem deste horário (Ex: https://i.ibb.co/... ou link direto)"
                  required
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button type="button" onClick={handleAddShift} className="df-btn df-btn-sec">
            <Plus size={16} /> Adicionar Mais um Turno
          </button>

          <button type="submit" className="df-btn df-btn-pri" style={{ minWidth: '180px' }}>
            Salvar Programação de Telas
          </button>
        </div>
      </form>
    </div>
  );
}
