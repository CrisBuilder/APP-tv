import { LayoutDashboard, MonitorPlay, MessageSquare, QrCode, Tag, Bell, Settings, CreditCard, Tv, CalendarClock, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Sidebar({ activeTab, setActiveTab, user, profile, displaysCount }) {
  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'displays', label: 'Minhas Telas', icon: Tv, badge: displaysCount },
    { id: 'media', label: 'Mídia de Fundo', icon: MonitorPlay },
    { id: 'schedule', label: 'Horários & Turnos', icon: CalendarClock },
    { id: 'announce', label: 'Letreiro Rotativo', icon: MessageSquare },
    { id: 'product', label: 'Produto & Oferta', icon: Tag },
    { id: 'qr', label: 'QR Code Dinâmico', icon: QrCode },
    { id: 'ticket', label: 'Atendimento & Senhas', icon: Bell },
    { id: 'billing', label: 'Assinatura & M-Pesa', icon: CreditCard },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleLogout = () => {
    if (window.confirm('Deseja realmente encerrar a sessão?')) {
      signOut(auth);
    }
  };

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Usuário';
  const displayCity = profile?.city || 'Moçambique';

  return (
    <aside className="df-sidebar">
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="df-brand">
          <div style={{
            background: 'var(--tint)',
            color: 'var(--pri)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MonitorPlay size={22} />
          </div>
          <span>DisplayFlow</span>
        </div>
        <span className="df-brand-badge">Pro</span>
      </div>

      {/* Navegação Principal */}
      <nav style={{ flex: 1, overflowY: 'auto' }}>
        <ul className="df-nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li
                key={item.id}
                className={`df-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span style={{
                    fontSize: '0.72rem',
                    background: isActive ? 'var(--pri)' : 'var(--line)',
                    color: isActive ? '#FFFFFF' : 'var(--ink)',
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 700
                  }}>
                    {item.badge}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Card do Usuário e Logout */}
      <div style={{
        borderTop: '1px solid var(--line)',
        paddingTop: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--tint)',
            color: 'var(--pri)',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem'
          }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--mute)' }}>
              {displayCity}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="df-btn df-btn-sec"
          style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
        >
          <LogOut size={16} color="var(--bad)" />
          <span>Terminar Sessão</span>
        </button>
      </div>
    </aside>
  );
}
