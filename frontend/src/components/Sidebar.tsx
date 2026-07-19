import { useEffect } from 'react';
import { BarChart3, Brain, FileText, Map, Network, Search, Settings, LayoutDashboard, X, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { NavigationItem } from '../types/navigation';
import { Badge } from './Badge';
import { useAuth } from '../store/AuthContext';

const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Investigator', path: '/ai', icon: Brain },
  { label: 'Case Explorer', path: '/cases', icon: Search },
  { label: 'Criminal Network', path: '/network', icon: Network },
  { label: 'Crime Map', path: '/map', icon: Map },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Reports', path: '/reports', icon: FileText },
  { label: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isTabletCollapsed?: boolean;
}

export function Sidebar({ isOpen, onClose, isTabletCollapsed = false }: SidebarProps) {
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[1040] bg-navy/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Content */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[1050] flex flex-col border-r border-white/10 bg-navy/95 py-5 text-slate-200 shadow-2xl transition-all duration-300 ease-in-out md:static md:flex md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isTabletCollapsed ? 'md:w-[88px] md:px-2' : 'w-[280px] px-4'} lg:w-[280px] lg:px-4`}
      >
        <div className={`flex items-center pb-6 ${isTabletCollapsed ? 'md:justify-center lg:justify-between lg:px-2' : 'justify-between px-2'}`}>
          <div className={`space-y-1 ${isTabletCollapsed ? 'hidden lg:block' : 'block'}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan/80">AI-CIOS</p>
            <h1 className="text-lg font-bold text-white">Crime Intelligence OS</h1>
            <p className="text-sm text-slate-400">Karnataka State Police</p>
          </div>
          {isTabletCollapsed && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/20 text-cyan font-bold lg:hidden">
              AI
            </div>
          )}
          <button 
            onClick={onClose}
            aria-label="Close menu"
            className={`rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white md:hidden ${isTabletCollapsed ? 'hidden lg:block' : 'block'}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

      <nav className="flex-1 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) {
                  onClose();
                }
              }}
              className={({ isActive }) =>
                [
                  'flex items-center transition-all duration-200',
                  isTabletCollapsed ? 'md:justify-center lg:justify-start rounded-xl md:p-3 lg:gap-3 lg:rounded-2xl lg:px-4 lg:py-3' : 'gap-3 rounded-2xl px-4 py-3',
                  isActive
                    ? 'bg-police text-white shadow-lg shadow-police/20'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
              title={isTabletCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={`text-sm font-medium ${isTabletCollapsed ? 'md:hidden lg:inline' : ''}`}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className={`mt-6 rounded-2xl border border-white/10 bg-white/5 ${isTabletCollapsed ? 'md:p-2 lg:p-4 flex flex-col items-center lg:items-stretch lg:flex-none gap-4' : 'p-4'}`}>
        {/* We use CSS classes to handle the toggle between collapsed vs expanded content on desktop vs tablet instead of JS logic so resizing works */}
        
        <div className={`w-full ${isTabletCollapsed ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">{user?.name || 'Officer'}</p>
              <p className="mt-1 text-xs text-slate-400">
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Officer'} · {user?.district || 'Bengaluru Unit'}
              </p>
            </div>
            <Badge variant="info">Online</Badge>
          </div>
          <button 
            onClick={logout}
            className="mt-4 w-full rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Logout
          </button>
        </div>

        {isTabletCollapsed && (
          <button 
            onClick={logout}
            title="Logout"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 lg:hidden"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
      </aside>
    </>
  );
}
