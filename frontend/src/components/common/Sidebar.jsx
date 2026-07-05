import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineBugAnt, HiOutlineHome, HiOutlineFolder, HiOutlineChartBar,
  HiOutlineDocumentText, HiOutlineCog6Tooth, HiOutlineShieldCheck,
  HiOutlineBolt, HiOutlineEye, HiOutlineMagnifyingGlass, HiOutlineUsers,
  HiOutlineChevronLeft, HiOutlineXMark, HiOutlinePlus
} from 'react-icons/hi2';

const menuItems = [
  { path: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
  { path: '/projects', icon: HiOutlineFolder, label: 'Projects' },
  { path: '/reports', icon: HiOutlineDocumentText, label: 'Reports' },
  { path: '/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
  { path: '/settings', icon: HiOutlineCog6Tooth, label: 'Settings' },
];

const Sidebar = ({ isOpen, isCollapsed, onClose, onToggleCollapse }) => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-dark-900 border-r border-dark-700/50 lg:hidden"
          >
            <SidebarContent onClose={onClose} isCollapsed={false} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-dark-900 border-r border-dark-700/50 transition-all duration-300 z-30
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        <SidebarContent
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </aside>
    </>
  );
};

const SidebarContent = ({ onClose, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-dark-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <HiOutlineBugAnt className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-white"
            >
              BugFinder
            </motion.span>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-dark-400 hover:text-white lg:hidden">
            <HiOutlineXMark className="w-6 h-6" />
          </button>
        )}
        {onToggleCollapse && (
          <button onClick={onToggleCollapse} className="hidden lg:block text-dark-400 hover:text-white transition-colors">
            <HiOutlineChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* New Project Button */}
      <div className="px-3 pt-4 pb-2">
        <NavLink
          to="/projects/new"
          className={`flex items-center gap-2 gradient-btn w-full justify-center text-sm ${isCollapsed ? 'px-2' : ''}`}
        >
          <HiOutlinePlus className="w-5 h-5" />
          {!isCollapsed && <span>New Project</span>}
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm group relative
                ${active
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-dark-300 hover:text-dark-50 hover:bg-dark-800/50'
                }`}
              title={isCollapsed ? item.label : undefined}
            >
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary-500 rounded-r"
                />
              )}
              <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-primary-400' : 'text-dark-400 group-hover:text-dark-200'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-dark-700/50">
          <div className="glass-card p-3 text-center">
            <p className="text-xs text-dark-400 mb-1">BugFinder v1.0</p>
            <p className="text-xs text-dark-500">AI-Powered Analysis</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
