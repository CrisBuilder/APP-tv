import { Tv, MonitorPlay, MessageSquare, Tag, Settings, CreditCard } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const items = [
    { id: 'displays', label: 'Telas', icon: Tv },
    { id: 'media', label: 'Mídia', icon: MonitorPlay },
    { id: 'announce', label: 'Letreiro', icon: MessageSquare },
    { id: 'product', label: 'Produtos', icon: Tag },
    { id: 'billing', label: 'M-Pesa', icon: CreditCard },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="df-bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={`df-bottom-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
