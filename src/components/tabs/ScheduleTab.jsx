import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Plus, Trash2, Power, Sun, Sunset, Moon } from 'lucide-react';
import { broadcastToDisplays } from '../../services/displayService';
import { subscribeMediaLibrary } from '../../services/mediaLibraryService';
import DisplayTargetSelector from '../DisplayTargetSelector';

const PERIODS = [
  { id: 'morning', code: '01', label: 'Manhã', range: '06h às 12h', start: '06:00', end: '12:00', icon: Sun },
  { id: 'afternoon', code: '02', label: 'Tarde', range: '12h às 18h', start: '12:00', end: '18:00', icon: Sunset },
  { id: 'night', code: '03', label: 'Noite', range: '18h às 06h', start: '18:00', end: '06:00', icon: Moon }
];

export default function ScheduleTab({
  user,
  displays,
  selectedDisplayId,
  initialSchedule = {}
}) {
  const [targets, setTargets] = useState(selectedDisplayId);
  const [enabled, setEnabled] = useState(initialSchedule.enabled || false);
  const [shifts, setShifts] = useState(initialSchedule.shifts || []);
  const [libraryItems, setLibraryItems] = useState([]);
  const [addingPeriod, setAddingPeriod] = useState(null);
  const [customUrl, setCustomUrl] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeMediaLibrary(user.uid, (items) => {
      setLibraryItems(items.filter((i) => i.type === 'image'));
    });
  }, [user?.uid]);

  const classifyPeriod = (shift) => {
    if (shift.period) return shift.period;
    const startH = parseInt((shift.start || '06:00').split(':')[0], 10);
    if (startH >= 6 && startH < 12) return 'morning';
    if (startH >= 12 && startH < 18) return 'afternoon';
    return 'night';
  };

  const handleAddMediaToPeriod = (periodObj, mediaItem) => {
    const newShift = {
      id: `shift_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      period: periodObj.id,
      name: mediaItem.name || `Banner ${periodObj.label}`,
      start: periodObj.start,
      end: periodObj.end,
      mediaUrl: mediaItem.url,
      mediaType: 'image'
    };
    setShifts((prev) => [...prev, newShift]);
    setAddingPeriod(null);
    setCustomUrl('');
  };

  const handleRemoveShift = (shiftId) => {
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
  };

  const handleUpdateTime = (shiftId, field, value) => {
    setShifts((prev) => prev.map((s) => (s.id === shiftId ? { ...s, [field]: value } : s)));
  };

  const handleSaveSchedule = async () => {
    const payload = {
      enabled,
      shifts,
      updatedAt: Date.now()
    };
    await broadcastToDisplays(user.uid, targets, 'schedule', payload, displays);
    setStatusMsg('Programação por faixas salva e enviada para as TVs!');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  return (
    <div className="df-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--pri)', textTransform: 'uppercase' }}>
            Horários de Exibição
          </span>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--ink)' }}>
            O banner certo em cada horário
          </h3>
          <p style={{ color: 'var(--mute)', fontSize: '0.88rem' }}>
            Organize as campanhas por período do dia (Manhã, Tarde e Noite). As TVs trocam automaticamente.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`df-btn ${enabled ? 'df-btn-pri' : 'df-btn-sec'}`}
          >
            <Power size={16} />
            {enabled ? 'Programação Ativa' : 'Programação Desativada'}
          </button>

          <button type="button" onClick={handleSaveSchedule} className="df-btn df-btn-pri">
            <Clock size={16} /> Salvar Horários
          </button>
        </div>
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

      {/* 3 Colunas: Manhã, Tarde, Noite */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {PERIODS.map((period) => {
          const Icon = period.icon;
          const periodShifts = shifts.filter((s) => classifyPeriod(s) === period.id);

          return (
            <div key={period.id} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '14px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--pri)' }}>{period.code}</span>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Icon size={14} color="var(--pri)" /> {period.label}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--mute)' }}>
                      {period.range} • {periodShifts.length} {periodShifts.length === 1 ? 'banner' : 'banners'}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAddingPeriod(addingPeriod === period.id ? null : period.id)}
                className="df-btn df-btn-sec"
                style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem' }}
              >
                <Plus size={14} /> Adicionar à {period.label.toLowerCase()}
              </button>

              {addingPeriod === period.id && (
                <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--pri)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)' }}>Escolher da Biblioteca:</span>
                  {libraryItems.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '140px', overflowY: 'auto' }}>
                      {libraryItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleAddMediaToPeriod(period, item)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '4px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--bg)', cursor: 'pointer', textAlign: 'left', fontSize: '0.78rem' }}
                        >
                          <img src={item.url} alt="" style={{ width: '36px', height: '22px', objectFit: 'cover', borderRadius: '4px' }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.74rem', color: 'var(--mute)' }}>Nenhuma imagem na biblioteca ainda.</span>
                  )}

                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="Ou cole URL da imagem..."
                      style={{ flex: 1, fontSize: '0.76rem', padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--line)' }}
                    />
                    <button
                      type="button"
                      onClick={() => customUrl.trim() && handleAddMediaToPeriod(period, { name: `Banner ${period.label}`, url: customUrl.trim() })}
                      className="df-btn df-btn-pri"
                      style={{ padding: '4px 8px', fontSize: '0.74rem', minHeight: 'auto' }}
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de turnos do período */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {periodShifts.map((shift) => (
                  <div key={shift.id} style={{ background: '#FFFFFF', borderRadius: '10px', padding: '0.6rem', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {shift.mediaUrl && (
                        <img src={shift.mediaUrl} alt="" style={{ width: '48px', height: '30px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {shift.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--mute)', marginTop: '2px' }}>
                          <input
                            type="time"
                            value={shift.start}
                            onChange={(e) => handleUpdateTime(shift.id, 'start', e.target.value)}
                            style={{ border: '1px solid var(--line)', borderRadius: '4px', padding: '1px 3px', fontSize: '0.72rem' }}
                          />
                          <span>às</span>
                          <input
                            type="time"
                            value={shift.end}
                            onChange={(e) => handleUpdateTime(shift.id, 'end', e.target.value)}
                            style={{ border: '1px solid var(--line)', borderRadius: '4px', padding: '1px 3px', fontSize: '0.72rem' }}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveShift(shift.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--bad)', cursor: 'pointer', padding: '4px' }}
                        title="Retirar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
