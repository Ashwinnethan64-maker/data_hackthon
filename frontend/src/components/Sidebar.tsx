import { BarChart3, Brain, FileText, Map, Network, Search, Settings, LayoutDashboard } from 'lucide-react';
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

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden w-[280px] flex-col border-r border-white/10 bg-navy/95 px-4 py-5 text-slate-200 shadow-2xl lg:flex">
      <div className="space-y-1 px-2 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan/80">AI-CIOS</p>
        <h1 className="text-lg font-bold text-white">Crime Intelligence OS</h1>
        <p className="text-sm text-slate-400">Karnataka State Police</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-200',
                  isActive
                    ? 'bg-police text-white shadow-lg shadow-police/20'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
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
    </aside>
  );
}
