import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShoppingBag, 
  UserPlus, 
  CreditCard,
  Settings,
  MoreVertical,
  Check,
  CheckCircle
} from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    type: 'security',
    title: 'Unusual login attempt detected',
    message: 'Multiple failed login attempts from IP 192.168.1.45 to the Admin portal.',
    time: '10 minutes ago',
    read: false,
    icon: ShieldAlert,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    action: 'Review Logs'
  },
  {
    id: 2,
    type: 'seller',
    title: 'New seller application: TechVision Inc.',
    message: 'A new enterprise seller has completed their onboarding profile and is pending manual approval.',
    time: '2 hours ago',
    read: false,
    icon: UserPlus,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    action: 'Review Profile'
  },
  {
    id: 3,
    type: 'order',
    title: 'High-value order flagged for review',
    message: 'Order #ORD-8829-XL exceeds the automated approval threshold ($15,000).',
    time: '4 hours ago',
    read: false,
    icon: ShoppingBag,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    action: 'View Order'
  },
  {
    id: 4,
    type: 'payment',
    title: 'Weekly payout batch processed successfully',
    message: 'Payouts for 142 sellers have been initiated via Stripe Connect.',
    time: 'Yesterday at 18:30',
    read: true,
    icon: CreditCard,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  {
    id: 5,
    type: 'system',
    title: 'Database backup completed',
    message: 'Automated weekly snapshot created successfully (Size: 4.2 TB).',
    time: 'Yesterday at 02:00',
    read: true,
    icon: CheckCircle2,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100'
  },
  {
    id: 6,
    type: 'system',
    title: 'API Rate limit approaching',
    message: 'The Mobile_App_iOS key is at 85% of its daily quota limit.',
    time: 'Oct 24, 14:05',
    read: true,
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    action: 'Increase Quota'
  }
];

const Notifications = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [notifications, setNotifications] = useState(mockNotifications);

  const filters = ['All', 'Unread', 'System', 'Security', 'Orders'];

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'Unread') return !notif.read;
    if (activeFilter === 'System') return notif.type === 'system';
    if (activeFilter === 'Security') return notif.type === 'security';
    if (activeFilter === 'Orders') return notif.type === 'order';
    return true;
  });

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            Notification Center
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage alerts, system updates, and user activities</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={markAllAsRead}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <CheckCircle size={16} />
            Mark all as read
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Filter Bar */}
        <div className="flex items-center gap-6 px-6 py-4 border-b border-slate-100 overflow-x-auto hide-scrollbar">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`text-sm font-medium whitespace-nowrap transition-colors pb-4 -mb-4 border-b-2 ${
                activeFilter === filter 
                  ? 'text-[#0A0F2C] border-[#0A0F2C]' 
                  : 'text-slate-500 border-transparent hover:text-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-slate-100">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div 
                  key={notification.id} 
                  className={`p-6 transition-colors hover:bg-slate-50 ${!notification.read ? 'bg-indigo-50/30' : ''}`}
                >
                  <div className="flex gap-4 sm:gap-6">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notification.bgColor} ${notification.color}`}>
                      <Icon size={22} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mb-1">
                        <h3 className={`text-base font-semibold truncate ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3 leading-relaxed max-w-3xl">
                        {notification.message}
                      </p>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        {notification.action && (
                          <button className="text-sm font-bold text-[#007A7C] hover:text-[#005a5d] transition-colors">
                            {notification.action}
                          </button>
                        )}
                        {!notification.read && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Unread Dot & Menu */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {!notification.read ? (
                        <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                      ) : (
                        <div className="w-2.5 h-2.5"></div>
                      )}
                      <button className="p-1 text-slate-400 hover:text-slate-600 rounded mt-auto">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <Bell size={28} />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-1">All caught up!</h3>
              <p className="text-slate-500 text-sm">You have no {activeFilter.toLowerCase()} notifications at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
