import { Clock3, Sparkles, Menu, Shield } from 'lucide-react';
import dayjs from 'dayjs';
import { Button } from './Button';
import { useState } from 'react';
import { Modal } from './Modal';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { BrandLogo } from './common/BrandLogo';
import { GlobalSearchBar } from './GlobalSearchBar';
import { useAuth } from '../store/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
  onTabletCollapseToggle?: () => void;
}

export function Navbar({ onMenuClick, onTabletCollapseToggle }: NavbarProps) {
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const { user } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'OF';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-[1020] border-b border-white/10 bg-navy/85 px-3 py-2.5 md:px-4 md:py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex flex-row items-center justify-between gap-2 md:gap-4 w-full">
        
        {/* Branding & Menu Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => {
              if (window.innerWidth < 768) {
                onMenuClick();
              } else {
                onTabletCollapseToggle?.();
              }
            }}
            aria-label="Toggle menu"
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white lg:hidden shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="hidden md:block">
            <BrandLogo size={30} showText variant="header" />
          </div>
        </div>

        {/* Action area (Functional Search + Clock + Profile Avatar) */}
        <div className="flex flex-1 items-center gap-2 md:gap-3 justify-end min-w-0">
          {/* Functional Global Search */}
          <div className="flex-1 max-w-xl min-w-0">
            <GlobalSearchBar />
          </div>

          <Button 
            variant="secondary" 
            className="hidden xl:flex h-10 px-3.5 shrink-0 text-xs"
            onClick={() => setIsQuickActionsOpen(true)}
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan" />
            Quick Actions
          </Button>

          <div className="glass-panel hidden 2xl:flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs text-slate-300">
            <Clock3 className="h-3.5 w-3.5 text-cyan" />
            <span>{dayjs().format('ddd, DD MMM · HH:mm')}</span>
          </div>

          {/* Top-Right User Profile Avatar */}
          <Link
            to="/profile"
            className="group relative flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-1.5 md:pr-3 text-left transition-all hover:border-cyan/40 hover:bg-white/10 shrink-0"
            title="View Officer Profile"
          >
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'Officer'}
                  className="h-8 w-8 rounded-lg object-cover border border-cyan/40"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-police/40 border border-cyan/30 text-xs font-bold text-cyan">
                  {getInitials(user?.name)}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-navy" />
            </div>

            <div className="hidden md:flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate max-w-[110px]">
                {user?.name || 'Officer'}
              </span>
              <span className="text-[10px] text-cyan uppercase font-semibold tracking-wider">
                {user?.role || 'Investigator'}
              </span>
            </div>
          </Link>
        </div>

      </div>

      <Modal 
        isOpen={isQuickActionsOpen} 
        onClose={() => setIsQuickActionsOpen(false)}
        title="Quick Actions"
      >
        <div className="grid gap-3">
          {[
            { name: 'Ask AI', path: '/ai' },
            { name: 'Search FIR', path: '/cases' },
            { name: 'Open Network', path: '/network' },
            { name: 'Generate Report', path: '/reports' }
          ].map((action) => (
            <Link
              key={action.name}
              to={action.path}
              onClick={() => setIsQuickActionsOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan/40 hover:bg-white/10"
            >
              <span>{action.name}</span>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </Link>
          ))}
        </div>
      </Modal>
    </header>
  );
}
