import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  ShoppingBag,
  Grid,
  BarChart2,
  Image as ImageIcon,
  CreditCard,
  MessageSquare,
  Bell,
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
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
        isSidebarCollapsed ? 'w-[70px]' : 'w-[260px]'
      } bg-sidebar text-white flex flex-col transition-all duration-300 h-screen sticky top-0`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        {!isSidebarCollapsed && (
          <div className="flex items-center space-x-2 font-bold text-xl">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              UB
            </div>
            <span>UBS Global</span>
          </div>
        )}
        {isSidebarCollapsed && (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
            UB
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-gray-800 transition-colors absolute -right-3 top-5 bg-sidebar border border-gray-700"
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-accent text-white border-l-4 border-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`
              }
            >
              <item.icon size={20} className={isSidebarCollapsed ? '' : 'mr-3'} />
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
              {/* Fallback avatar */}
              A
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{admin?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400">Super Admin</p>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button onClick={logout} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
