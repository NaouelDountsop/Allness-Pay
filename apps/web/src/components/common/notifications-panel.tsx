import { useState } from 'react';
import {
  CheckCircle2,
  UserPlus,
  AlertCircle,
  Wallet,
  Settings,
  Check,
} from 'lucide-react';

type NotificationType = 'success' | 'info' | 'warning' | 'purple' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const notificationsData: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Transaction réussie',
    description: 'Transfert de 50 000 XAF vers John Doe',
    time: 'Il y a 2 min',
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'Nouveau compte créé',
    description: "Un nouvel utilisateur s'est inscrit",
    time: 'Il y a 15 min',
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Vérification KYC en attente',
    description: '3 utilisateurs ont des pièces en attente',
    time: 'Il y a 1 h',
    read: false,
  },
  {
    id: '4',
    type: 'purple',
    title: 'Retrait effectué',
    description: 'Retrait de 25 000 XAF vers compte bancaire',
    time: 'Il y a 2 h',
    read: false,
  },
  {
    id: '5',
    type: 'system',
    title: 'Mise à jour système',
    description: 'La maintenance est prévue ce soir à 23h00',
    time: 'Il y a 5 h',
    read: false,
  },
];

const iconMap = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
  info: <UserPlus className="w-5 h-5 text-blue-600" />,
  warning: <AlertCircle className="w-5 h-5 text-amber-600" />,
  purple: <Wallet className="w-5 h-5 text-violet-600" />,
  system: <Settings className="w-5 h-5 text-slate-600" />,
};

const bgMap = {
  success: 'bg-emerald-50',
  info: 'bg-blue-50',
  warning: 'bg-amber-50',
  purple: 'bg-violet-50',
  system: 'bg-slate-100',
};

const dotMap = {
  success: 'bg-emerald-500',
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  purple: 'bg-violet-500',
  system: 'bg-slate-400',
};

const tabs = [
  { id: 'all', label: 'Toutes', count: 5 },
  { id: 'unread', label: 'Non lues', count: 5 },
  { id: 'transactions', label: 'Transactions' },
  { id: 'alerts', label: 'Alertes' },
  { id: 'system', label: 'Système' },
];

export default function NotificationsPanel() {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState(notificationsData);

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="text-lg font-semibold text-slate-800">Notifications</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            Tout marquer comme lu
            <Check className="w-4 h-4" />
          </button>
          <button className="text-slate-400 hover:text-slate-600">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 border-b border-slate-100 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors
              ${
                activeTab === tab.id
                  ? 'text-emerald-600'
                  : 'text-slate-500 hover:text-slate-700'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 text-xs">({tab.count})</span>
            )}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="divide-y divide-slate-50">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {/* Icon */}
            <div
              className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                ${bgMap[notif.type]}
              `}
            >
              {iconMap[notif.type]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                {notif.title}
              </p>
              <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                {notif.description}
              </p>
            </div>

            {/* Time + Dot */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className="text-xs text-slate-400">{notif.time}</span>
              {!notif.read && (
                <span
                  className={`w-2 h-2 rounded-full ${dotMap[notif.type]}`}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100">
        <button className="w-full text-center text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1">
          Voir toutes les notifications
          <span>→</span>
        </button>
      </div>
    </div>
  );
}