import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUiStore } from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import {
  LayoutDashboard, Store, Users, Package, ShoppingBag, Grid, BarChart2,
  Image as ImageIcon, CreditCard, MessageSquare, Bell, Shield, Settings, LogOut,
  ChevronLeft, ChevronRight, Wallet, DollarSign
} from 'lucide-react';
const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/sellers', label: 'Seller Management', icon: Store },
  { path: '/users', label: 'User Management', icon: Users },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/categories', label: 'Categories', icon: Grid },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/banners', label: 'Banners', icon: ImageIcon },
  { path: '/payments', label: 'Payments', icon: CreditCard },
  { path: '/transactions', label: 'Transactions', icon: DollarSign },
  { path: '/withdrawals', label: 'Withdrawals', icon: Wallet },
  { path: '/support', label: 'Support', icon: MessageSquare },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/moderation', label: 'Moderation', icon: Shield },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
  const { isSidebarCollapsed, toggleSidebar } = useUiStore();
  const { admin, logout } = useAuthStore();

  return (
    <aside
      className={`${
        isSidebarCollapsed ? 'w-[80px]' : 'w-[280px]'
      } bg-white dark:bg-sidebar text-[#2B3674] dark:text-white flex flex-col transition-all duration-300 h-screen sticky top-0 border-r border-gray-100 dark:border-gray-800 shadow-soft dark:shadow-none`}
    >
      <div className="flex items-center justify-center h-[90px] border-b border-gray-100 dark:border-white/10 relative px-4">
        {!isSidebarCollapsed ? (
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="UBS Global" className="h-10 w-auto object-contain drop-shadow-md" />
          </div>
        ) : (
          <img src="/logo.png" alt="UBS Global" className="h-10 w-auto object-contain drop-shadow-md" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary/5 dark:bg-primary/10 text-primary dark:text-white'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#2B3674] dark:hover:text-white'
                } ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'}`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    size={20} 
                    className={`${isSidebarCollapsed ? '' : 'mr-4'} ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-primary'} transition-colors`} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {!isSidebarCollapsed && (
                    <span className={`font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                  )}
                  {isActive && !isSidebarCollapsed && (
                    <div className="ml-auto w-1 h-5 bg-primary rounded-full shadow-[0_0_8px_rgba(67,24,255,0.8)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-white/10">
        <div className={`flex items-center bg-gray-50 dark:bg-white/5 p-3 rounded-xl ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isSidebarCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-[#2B3674] dark:text-white truncate">{admin?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{admin?.email || 'admin@ubsglobal.com'}</p>
            </div>
          )}
          <button 
            onClick={logout} 
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
