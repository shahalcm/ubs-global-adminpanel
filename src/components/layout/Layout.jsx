import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useUiStore } from '../../store/uiStore';

const Layout = () => {
  const { isSidebarCollapsed, toggleSidebar } = useUiStore();
  const location = useLocation();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768 && !isSidebarCollapsed) {
      toggleSidebar();
    }
  }, [location, isSidebarCollapsed, toggleSidebar]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F7FE] dark:bg-dark-bg transition-colors duration-300">
      <Sidebar />
      
      {/* Mobile overlay */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden relative w-full">
        {/* Decorative background blur - hidden on small screens to improve performance */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] pointer-events-none hidden md:block" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 dark:bg-accent/10 rounded-full blur-[100px] pointer-events-none hidden md:block" />
        
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8 z-10 w-full">
          <div className="animate-fade-in max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
