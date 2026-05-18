import React from 'react';
import { Menu, Search, Bell, Sun, Moon, Globe } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const { toggleSidebar, isDarkMode, toggleDarkMode } = useUiStore();
  const { admin } = useAuthStore();
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname.split('/')[1];
    return path ? path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ') : 'Dashboard';
  };

  return (
    <header className="h-[76px] m-4 rounded-[20px] glass-header flex items-center justify-between px-6 z-20 shadow-sm sticky top-4">
      <div className="flex items-center space-x-4">
        <button onClick={toggleSidebar} className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-[#2B3674] dark:text-white">
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Pages / {getBreadcrumb()}</span>
          <span className="text-lg font-bold text-[#2B3674] dark:text-white leading-tight">{getBreadcrumb()}</span>
        </div>
      </div>

      <div className="flex items-center bg-white dark:bg-dark-bg rounded-full px-3 py-2 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="hidden md:flex items-center bg-[#F4F7FE] dark:bg-white/5 rounded-full px-4 py-2 mr-3 border border-transparent focus-within:border-primary transition-colors">
          <Search className="text-gray-400 mr-2" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-48 text-[#2B3674] dark:text-white placeholder-gray-400"
          />
        </div>

        <div className="flex items-center space-x-1">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-300 transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-300 transition-colors hidden sm:block">
            <Globe size={18} />
          </button>
          <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-300 transition-colors">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div className="ml-2 flex items-center space-x-2 pl-2 border-l border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-linear-to-br from-primary to-accent rounded-full flex items-center justify-center text-white shadow-md font-bold text-sm">
              {admin?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
