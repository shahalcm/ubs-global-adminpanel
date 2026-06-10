import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, Sun, Moon, Globe, Clock, X, CornerDownLeft, MessageSquare, ShieldAlert, UserPlus, ShoppingBag } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { connectAdminSocket } from '../../services/socketService';

const SEARCHABLE_PAGES = [
  { path: '/dashboard', label: 'Dashboard', keywords: ['home', 'main', 'overview', 'stats'] },
  { path: '/sellers', label: 'Seller Management', keywords: ['seller', 'vendor', 'shop', 'store', 'merchants'] },
  { path: '/users', label: 'User Management', keywords: ['user', 'buyer', 'member', 'customers', 'accounts'] },
  { path: '/products', label: 'Products', keywords: ['product', 'item', 'inventory', 'listing', 'goods'] },
  { path: '/jobs-services', label: 'Jobs & Services', keywords: ['job', 'service', 'work', 'gigs', 'hiring'] },
  { path: '/orders', label: 'Orders', keywords: ['order', 'purchase', 'sale', 'checkout', 'transaction'] },
  { path: '/categories', label: 'Categories', keywords: ['category', 'classification', 'group', 'tag'] },
  { path: '/analytics', label: 'Analytics', keywords: ['analytic', 'chart', 'report', 'metric', 'statistic', 'data'] },
  { path: '/banners', label: 'Banners', keywords: ['banner', 'ads', 'hero', 'promotion', 'slider', 'carousel'] },
  { path: '/payments', label: 'Payments', keywords: ['payment', 'method', 'gateway', 'billing', 'invoice'] },
  { path: '/transactions', label: 'Transactions', keywords: ['transaction', 'history', 'payment', 'transfer'] },
  { path: '/withdrawals', label: 'Withdrawals', keywords: ['withdrawal', 'payout', 'cashout', 'transfer'] },
  { path: '/support', label: 'Support & Help', keywords: ['support', 'help', 'ticket', 'chat', 'message', 'contact'] },
  { path: '/notifications', label: 'Notifications', keywords: ['notification', 'alert', 'announcement', 'message'] },
  { path: '/moderation', label: 'Moderation', keywords: ['moderation', 'report', 'flag', 'abuse', 'ban', 'block'] },
  { path: '/contact-requests', label: 'Contact Requests', keywords: ['contact', 'request', 'lead', 'message', 'inquiry'] },
  { path: '/chat-monitor', label: 'Chat Monitor', keywords: ['chat', 'monitor', 'message', 'conversation', 'log'] },
  { path: '/profile', label: 'Profile Settings', keywords: ['profile', 'account', 'me', 'admin', 'password'] },
  { path: '/legal-compliance', label: 'Legal & Compliance', keywords: ['legal', 'compliance', 'terms', 'privacy', 'policy'] },
  { path: '/settings', label: 'Settings', keywords: ['setting', 'configuration', 'preference', 'setup'] },
];

const Navbar = () => {
  const { toggleSidebar, isDarkMode, toggleDarkMode } = useUiStore();
  const { admin } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Search and history states
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchRef = useRef(null);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const notificationRef = useRef(null);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('ubs_admin_search_history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse search history', e);
      }
    }
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Live socket notifications and initial seeds
  useEffect(() => {
    const initial = [
      {
        id: '1',
        type: 'security',
        title: 'Unusual login attempt detected',
        message: 'Multiple failed login attempts from IP 192.168.1.45.',
        time: '10 mins ago',
        read: false,
        path: '/notifications'
      },
      {
        id: '2',
        type: 'seller',
        title: 'New seller application',
        message: 'TechVision Inc. is pending approval.',
        time: '2 hours ago',
        read: false,
        path: '/sellers'
      },
      {
        id: '3',
        type: 'order',
        title: 'High-value order flagged',
        message: 'Order #ORD-8829-XL exceeds $15,000.',
        time: '4 hours ago',
        read: false,
        path: '/orders'
      }
    ];
    setNotifications(initial);

    // Register socket listeners
    const socket = connectAdminSocket();
    if (socket) {
      const handleNewContact = (data) => {
        setNotifications(prev => [
          {
            id: `contact-${Date.now()}`,
            type: 'contact',
            title: 'New Contact Request',
            message: `${data?.name || 'Someone'} sent a message: "${data?.subject || ''}"`,
            time: 'Just now',
            read: false,
            path: '/contact-requests'
          },
          ...prev
        ]);
      };

      const handleNewOrder = (data) => {
        setNotifications(prev => [
          {
            id: `order-${Date.now()}`,
            type: 'order',
            title: 'New Order Placed',
            message: `Order #${data?._id || data?.orderId || 'new'} has been placed.`,
            time: 'Just now',
            read: false,
            path: '/orders'
          },
          ...prev
        ]);
      };

      const handleNewSeller = (data) => {
        setNotifications(prev => [
          {
            id: `seller-${Date.now()}`,
            type: 'seller',
            title: 'New Seller Registration',
            message: `${data?.companyName || 'A new seller'} registered.`,
            time: 'Just now',
            read: false,
            path: '/sellers'
          },
          ...prev
        ]);
      };

      socket.on('newContactRequest', handleNewContact);
      socket.on('newOrder', handleNewOrder);
      socket.on('newSellerRequest', handleNewSeller);

      return () => {
        socket.off('newContactRequest', handleNewContact);
        socket.off('newOrder', handleNewOrder);
        socket.off('newSellerRequest', handleNewSeller);
      };
    }
  }, []);

  const getBreadcrumb = () => {
    const path = location.pathname.split('/')[1];
    return path ? path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ') : 'Dashboard';
  };

  // Filter searchable pages based on query
  const filteredSuggestions = SEARCHABLE_PAGES.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    return (
      item.label.toLowerCase().includes(query) ||
      item.keywords.some(kw => kw.toLowerCase().includes(query))
    );
  });

  // Calculate combined visible items for unified keyboard navigation
  const getVisibleItems = () => {
    if (searchQuery.trim() === '') {
      const popular = SEARCHABLE_PAGES.slice(0, 6);
      return [
        ...searchHistory.map(item => ({ ...item, type: 'history' })),
        ...popular.filter(p => !searchHistory.some(h => h.path === p.path)).map(item => ({ ...item, type: 'suggested' }))
      ];
    } else {
      return filteredSuggestions.map(item => ({ ...item, type: 'search' }));
    }
  };

  const visibleItems = getVisibleItems();

  // Reset active index when query or visibility changes
  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery, showDropdown]);

  const handleSelect = (item) => {
    navigate(item.path);
    
    // Add to history (limit to 5 items)
    const newHistoryItem = { path: item.path, label: item.label };
    const updatedHistory = [
      newHistoryItem,
      ...searchHistory.filter(h => h.path !== item.path)
    ].slice(0, 5);
    
    setSearchHistory(updatedHistory);
    localStorage.setItem('ubs_admin_search_history', JSON.stringify(updatedHistory));
    
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleDeleteHistory = (e, pathToDelete) => {
    e.stopPropagation();
    const updatedHistory = searchHistory.filter(h => h.path !== pathToDelete);
    setSearchHistory(updatedHistory);
    localStorage.setItem('ubs_admin_search_history', JSON.stringify(updatedHistory));
  };

  const handleClearAllHistory = (e) => {
    e.stopPropagation();
    setSearchHistory([]);
    localStorage.removeItem('ubs_admin_search_history');
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % visibleItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + visibleItems.length) % visibleItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (visibleItems[activeIndex]) {
        handleSelect(visibleItems[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
      e.target.blur();
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markAllNotificationsAsRead = (e) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    navigate(notif.path || '/notifications');
    setShowNotificationsDropdown(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'security':
        return <ShieldAlert size={16} className="text-red-500" />;
      case 'seller':
        return <UserPlus size={16} className="text-indigo-500" />;
      case 'order':
        return <ShoppingBag size={16} className="text-amber-500" />;
      case 'contact':
        return <MessageSquare size={16} className="text-blue-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getNotificationIconBg = (type) => {
    switch (type) {
      case 'security':
        return 'bg-red-50 dark:bg-red-950/20';
      case 'seller':
        return 'bg-indigo-50 dark:bg-indigo-950/20';
      case 'order':
        return 'bg-amber-50 dark:bg-amber-950/20';
      case 'contact':
        return 'bg-blue-50 dark:bg-blue-950/20';
      default:
        return 'bg-gray-50 dark:bg-gray-900';
    }
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
        <div ref={searchRef} className="relative hidden md:block mr-3">
          <div className="flex items-center bg-[#F4F7FE] dark:bg-white/5 rounded-full px-4 py-2 border border-transparent focus-within:border-primary transition-colors">
            <Search className="text-gray-400 mr-2" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-sm w-48 text-[#2B3674] dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Floating Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 min-w-[320px] bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-up transition-all duration-200">
              {searchQuery.trim() === '' ? (
                <>
                  {/* Recent Searches */}
                  {searchHistory.length > 0 && (
                    <div className="py-1">
                      <div className="px-4 py-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Recent Searches</span>
                        <button 
                          onClick={handleClearAllHistory}
                          className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 font-medium cursor-pointer transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                      {searchHistory.map((item, idx) => {
                        const isHighlighted = idx === activeIndex;
                        return (
                          <div
                            key={item.path}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                              isHighlighted ? 'bg-primary/5 dark:bg-white/5 text-primary dark:text-accent font-medium' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 text-sm">
                              <Clock size={14} className="text-gray-400 shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {isHighlighted && <CornerDownLeft size={12} className="text-gray-400 shrink-0" />}
                              <button
                                onClick={(e) => handleDeleteHistory(e, item.path)}
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Suggested Quick Links */}
                  <div className="py-1 border-t border-gray-50 dark:border-gray-800/50">
                    <div className="px-4 py-2">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Quick Links</span>
                    </div>
                    {visibleItems
                      .filter(item => item.type === 'suggested')
                      .map((item, idx) => {
                        const globalIdx = searchHistory.length + idx;
                        const isHighlighted = globalIdx === activeIndex;
                        return (
                          <div
                            key={item.path}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setActiveIndex(globalIdx)}
                            className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                              isHighlighted ? 'bg-primary/5 dark:bg-white/5 text-primary dark:text-accent font-medium' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 text-sm">
                              <Search size={14} className="text-gray-400 shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </div>
                            {isHighlighted && <CornerDownLeft size={12} className="text-gray-400 shrink-0" />}
                          </div>
                        );
                      })}
                  </div>
                </>
              ) : (
                <div className="py-1">
                  <div className="px-4 py-2">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Search Results</span>
                  </div>
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((item, idx) => {
                      const isHighlighted = idx === activeIndex;
                      return (
                        <div
                          key={item.path}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                            isHighlighted ? 'bg-primary/5 dark:bg-white/5 text-primary dark:text-accent font-medium' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 text-sm">
                            <Search size={14} className="text-gray-400 shrink-0" />
                            <div className="flex flex-col">
                              <span>{item.label}</span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">{item.path}</span>
                            </div>
                          </div>
                          {isHighlighted && <CornerDownLeft size={12} className="text-gray-400 shrink-0" />}
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-6 text-center text-xs text-gray-400 dark:text-gray-500">
                      No matching sections found.
                    </div>
                  )}
                </div>
              )}
              {/* Keyboard helper footer */}
              <div className="bg-gray-50 dark:bg-white/2 px-4 py-2 text-[9px] text-gray-400 dark:text-gray-500 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <div ref={notificationRef} className="relative">
            <button 
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-300 transition-colors relative cursor-pointer"
            >
              <Bell size={18} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full flex items-center justify-center shadow-sm">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotificationsDropdown && (
              <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-up transition-all duration-200">
                <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/50">
                  <span className="text-xs font-bold text-[#2B3674] dark:text-white">Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <button 
                      onClick={markAllNotificationsAsRead}
                      className="text-[10px] font-bold text-primary dark:text-accent hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/50">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`px-4 py-3 flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-white/2 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-primary/2 dark:bg-white/2' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-full shrink-0 ${getNotificationIconBg(notif.type)}`}>
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold text-[#2B3674] dark:text-white truncate ${!notif.read ? 'font-extrabold' : ''}`}>
                              {notif.title}
                            </span>
                            <span className="text-[9px] text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-2"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-xs text-gray-400 dark:text-gray-500">
                      No notifications at this time.
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-white/2 px-4 py-2 text-center border-t border-gray-100 dark:border-gray-800">
                  <button 
                    onClick={() => {
                      navigate('/notifications');
                      setShowNotificationsDropdown(false);
                    }}
                    className="text-[10px] font-bold text-primary dark:text-accent hover:underline cursor-pointer"
                  >
                    See all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

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
