import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  HiOutlineBars3, HiOutlineBell, HiOutlineMagnifyingGlass,
  HiOutlineSun, HiOutlineMoon, HiOutlineUser, HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle, HiOutlineShieldCheck
} from 'react-icons/hi2';

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden text-dark-300 hover:text-white transition-colors">
            <HiOutlineBars3 className="w-6 h-6" />
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:block">
            <div className="relative">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, bugs, reports..."
                className="w-64 lg:w-80 bg-dark-800/50 border border-dark-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-dark-500 bg-dark-700/50 px-1.5 py-0.5 rounded">⌘K</kbd>
            </div>
          </form>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-800/50 transition-all"
          >
            {theme === 'dark' ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-800/50 transition-all relative"
            >
              <HiOutlineBell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 glass-card overflow-hidden"
                >
                  <div className="p-4 border-b border-dark-700/50">
                    <h3 className="font-semibold text-white text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {[
                      { title: 'Analysis Complete', message: 'Project scan finished with 12 issues', time: '2m ago', type: 'success' },
                      { title: 'Critical Bug Found', message: 'XSS vulnerability detected', time: '1h ago', type: 'error' },
                      { title: 'Report Ready', message: 'Your PDF report is ready to download', time: '3h ago', type: 'info' },
                    ].map((notif, i) => (
                      <div key={i} className="p-3 hover:bg-dark-700/30 transition-colors cursor-pointer border-b border-dark-700/30">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notif.type === 'success' ? 'bg-emerald-400' :
                            notif.type === 'error' ? 'bg-red-400' : 'bg-primary-400'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-dark-100">{notif.title}</p>
                            <p className="text-xs text-dark-400 mt-0.5">{notif.message}</p>
                            <p className="text-xs text-dark-500 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-dark-700/50 text-center">
                    <button className="text-xs text-primary-400 hover:text-primary-300 font-medium">View all notifications</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile menu */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-dark-800/50 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-sm text-dark-200 font-medium max-w-[120px] truncate">
                {user?.name || 'User'}
              </span>
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 glass-card overflow-hidden"
                >
                  <div className="p-3 border-b border-dark-700/50">
                    <p className="font-semibold text-white text-sm">{user?.name}</p>
                    <p className="text-xs text-dark-400 mt-0.5">{user?.email}</p>
                    <span className="inline-block mt-1.5 badge bg-primary-500/20 text-primary-400 border border-primary-500/30">
                      {user?.role || 'developer'}
                    </span>
                  </div>
                  <div className="py-1">
                    {[
                      { icon: HiOutlineUser, label: 'Profile', path: '/profile' },
                      { icon: HiOutlineCog6Tooth, label: 'Settings', path: '/settings' },
                      ...(user?.role === 'admin' ? [{ icon: HiOutlineShieldCheck, label: 'Admin Panel', path: '/admin' }] : []),
                    ].map((item) => (
                      <button
                        key={item.path}
                        onClick={() => { navigate(item.path); setShowProfile(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700/30 transition-colors"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                    <hr className="my-1 border-dark-700/50" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-dark-700/30 transition-colors"
                    >
                      <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
