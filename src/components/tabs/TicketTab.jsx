import { useState, useEffect } from 'react';
import { Bell, Volume2, CheckCircle2, Copy, RotateCcw, Trash2, Users, Clock } from 'lucide-react';
import { broadcastToDisplays } from '../../services/displayService';
import { playChimeSound } from '../../services/audioService';
import {
  emitTicket,
  subscribeQueue,
  completeTicketCall,
  cancelWaitingTicket,
  returnTicketToQueue
} from '../../services/queueService';
import DisplayTargetSelector from '../DisplayTargetSelector';

const DEFAULT_DESKS = ['Sala 01', 'Sala 02', 'Balcão 01', 'Guichê 01', 'Recepção'];

export default function TicketTab({ user, displays, selectedDisplayId }) {
  const [targets, setTargets] = useState(selectedDisplayId);
  const [desk, setDesk] = useState(DEFAULT_DESKS[0]);
  const [customDesk, setCustomDesk] = useState('');
  const [queue, setQueue] = useState({ waiting: [], completed: [] });
  const [lastEmitted, setLastEmitted] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeQueue(user.uid, setQueue);
  }, [user?.uid]);

  const showFeedback = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleEmit = async (prefix) => {
    const ticket = await emitTicket(user.uid, prefix);
    if (ticket) {
      setLastEmitted(ticket);
      showFeedback(`Senha ${ticket.code} emitida. Entregue o número à pessoa.`);
    }
  };

  const handleCopyLast = () => {
    if (!lastEmitted?.code) return;
    navigator.clipboard.writeText(lastEmitted.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const nextTicket = queue.waiting[0] || null;
  const activeDesk = desk === '__custom__' ? (customDesk.trim() || 'Atendimento') : desk;

  const handleCallNext = async () => {
    if (!nextTicket) return;
    playChimeSound();
    await broadcastToDisplays(user.uid, targets, 'ticket', {
      number: nextTicket.code,
      desk: activeDesk,
      timestamp: Date.now(),
      visible: true
    }, displays);
    await completeTicketCall(user.uid, nextTicket, activeDesk);
    showFeedback(`Senha ${nextTicket.code} chamada para ${activeDesk}!`);
  };

  const priorityCount = queue.waiting.filter((t) => t.type === 'P').length;
  const maxWaitMin = queue.waiting.length > 0
    ? Math.max(1, Math.round((Date.now() - Math.min(...queue.waiting.map((t) => t.createdAt || Date.now()))) / 60000))
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="df-card" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--pri)', textTransform: 'uppercase' }}>
              Senhas e Atendimento
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--ink)' }}>
              Emita senhas e chame por local
            </h3>
            <p style={{ color: 'var(--mute)', fontSize: '0.88rem' }}>
              Entregue um número à pessoa, escolha a sala ou balcão e chame na TV com som de gongo.
            </p>
          </div>

          <button type="button" onClick={() => playChimeSound()} className="df-btn df-btn-sec">
            <Volume2 size={16} /> Testar Áudio
          </button>
        </div>

        <DisplayTargetSelector
          displays={displays}
          globalTarget={selectedDisplayId}
          selectedTargets={Array.isArray(targets) ? targets : [targets]}
          onChangeTargets={setTargets}
        />

        {statusMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--ok-soft)', color: 'var(--ok-text)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-btn)', fontSize: '0.88rem', fontWeight: '600', marginBottom: '1rem' }}>
            <CheckCircle2 size={18} /> {statusMsg}
          </div>
        )}

        {/* Passos 1 e 2 */}
        <div className="df-grid-2">
          {/* Passo 1: Emitir Senha */}
          <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--pri)', textTransform: 'uppercase' }}>Passo 1 • Emita e entregue</span>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '0.25rem 0 0.75rem 0' }}>Entregue uma senha</h4>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
              <button type="button" onClick={() => handleEmit('A')} className="df-btn df-btn-pri" style={{ flex: 1 }}>
                Emitir comum - A
              </button>
              <button type="button" onClick={() => handleEmit('P')} className="df-btn df-btn-sec" style={{ flex: 1 }}>
                Emitir prioritária - P
              </button>
            </div>

            {lastEmitted && (
              <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--mute)', textTransform: 'uppercase', fontWeight: '700' }}>Última senha emitida</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--ink)' }}>{lastEmitted.code}</div>
                </div>
                <button type="button" onClick={handleCopyLast} className="df-btn df-btn-sec" style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem' }}>
                  <Copy size={14} /> {copiedCode ? 'Copiada!' : 'Copiar'}
                </button>
              </div>
            )}
          </div>

          {/* Passo 2: Chamar Senha */}
          <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--pri)', textTransform: 'uppercase' }}>Passo 2 • Chame e atenda</span>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>Chame e conduza o atendimento</h4>

            <div className="df-field" style={{ marginBottom: 0 }}>
              <label>Em qual sala, balcão ou guichê?</label>
              <select value={desk} onChange={(e) => setDesk(e.target.value)}>
                {DEFAULT_DESKS.map((d) => <option key={d} value={d}>{d}</option>)}
                <option value="__custom__">Outro local personalizado...</option>
              </select>
            </div>

            {desk === '__custom__' && (
              <input
                type="text"
                value={customDesk}
                onChange={(e) => setCustomDesk(e.target.value)}
                placeholder="Digite o nome da sala ou mesa..."
                style={{ padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid var(--line)' }}
              />
            )}

            <div style={{ background: nextTicket ? 'var(--ok-soft)' : '#FFFFFF', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '0.82rem' }}>
              {nextTicket
                ? <>Próxima senha: <strong>{nextTicket.code}</strong> ({nextTicket.type === 'P' ? 'Prioritária' : 'Comum'})</>
                : 'Nenhuma senha aguardando na fila.'}
            </div>

            <button
              type="button"
              onClick={handleCallNext}
              disabled={!nextTicket}
              className="df-btn df-btn-pri"
              style={{ width: '100%', marginTop: 'auto' }}
            >
              <Bell size={16} /> {nextTicket ? `Chamar ${nextTicket.code}` : 'Aguardando senha'}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Métricas da Fila */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        <div className="df-card" style={{ marginBottom: 0 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>Senhas aguardando</span>
          <div style={{ fontSize: '1.6rem', fontWeight: '800' }}>{queue.waiting.length}</div>
        </div>
        <div className="df-card" style={{ marginBottom: 0 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>Prioritárias aguardando</span>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--pri)' }}>{priorityCount}</div>
        </div>
        <div className="df-card" style={{ marginBottom: 0 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>Atendimentos concluídos</span>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--ok-text)' }}>{queue.completed.length}</div>
        </div>
        <div className="df-card" style={{ marginBottom: 0 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>Maior espera agora</span>
          <div style={{ fontSize: '1.6rem', fontWeight: '800' }}>{maxWaitMin > 0 ? `< ${maxWaitMin} min` : '—'}</div>
        </div>
      </div>

      {/* Fila de Espera & Atendimentos de Hoje */}
      <div className="df-grid-2">
        <div className="df-card" style={{ marginBottom: 0 }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
            <Users size={16} color="var(--pri)" /> Fila de espera ({queue.waiting.length})
          </h4>
          {queue.waiting.length === 0 ? (
            <p style={{ fontSize: '0.84rem', color: 'var(--mute)' }}>Nenhuma senha aguardando no momento.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
              {queue.waiting.map((item, idx) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', marginRight: '8px' }}>{item.code}</strong>
                    <span className={`df-chip ${item.type === 'P' ? 'df-chip-warn' : 'df-chip-pri'}`}>
                      {item.type === 'P' ? 'Prioritária' : 'Comum'}
                    </span>
                    {idx === 0 && <span style={{ fontSize: '0.72rem', color: 'var(--ok-text)', fontWeight: '700', marginLeft: '6px' }}>PRÓXIMA</span>}
                  </div>
                  <button type="button" onClick={() => cancelWaitingTicket(user.uid, item.id)} style={{ background: 'none', border: 'none', color: 'var(--bad)', cursor: 'pointer' }} title="Cancelar senha">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="df-card" style={{ marginBottom: 0 }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
            <Clock size={16} color="var(--pri)" /> Atendimentos recentes ({queue.completed.length})
          </h4>
          {queue.completed.length === 0 ? (
            <p style={{ fontSize: '0.84rem', color: 'var(--mute)' }}>Nenhum atendimento chamado ainda hoje.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
              {queue.completed.slice(0, 15).map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>{item.code}</strong> — {item.desk}
                  </div>
                  <button
                    type="button"
                    onClick={() => returnTicketToQueue(user.uid, item)}
                    className="df-btn df-btn-sec"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', minHeight: 'auto' }}
                    title="Devolver ausência à fila"
                  >
                    <RotateCcw size={12} /> Devolver
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
