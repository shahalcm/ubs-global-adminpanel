import React from 'react';
import { Menu, Search, Bell, Sun, Moon, Globe } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const { toggleSidebar, isDarkMode, toggleDarkMode } = useUiStore();
  const { admin, logout } = useAuthStore();
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname.split('/')[1];
    return path ? path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ') : 'Dashboard';
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 shadow-sm flex items-center justify-between px-4 sticky top-0 z-10 transition-colors duration-300">
      <div className="flex items-center space-x-4">
        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Menu size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <div className="hidden sm:flex text-sm text-gray-500 dark:text-gray-400">
          Home / <span className="text-gray-900 dark:text-white ml-1 font-medium">{getBreadcrumb()}</span>
        </div>
      </div>

      <div className="flex-1 max-w-xl px-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search anywhere..."
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative">
          <Bell size={20} className="text-gray-600 dark:text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900"></span>
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 hidden sm:block">
          <Globe size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          {isDarkMode ? <Sun size={20} className="text-gray-300" /> : <Moon size={20} className="text-gray-600" />}
        </button>
        
        <div className="border-l border-gray-200 dark:border-gray-700 h-8 mx-2 hidden sm:block"></div>
        
        <div className="flex items-center space-x-2 cursor-pointer">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
            {admin?.name || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
