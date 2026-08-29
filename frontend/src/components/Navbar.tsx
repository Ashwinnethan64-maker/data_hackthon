import { Clock3, Sparkles, Menu, Shield, Settings, ArrowUpRight } from 'lucide-react';
import dayjs from 'dayjs';
import { Button } from './Button';
import { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { Link } from 'react-router-dom';
import { BrandLogo } from './common/BrandLogo';
import { GlobalSearchBar } from './GlobalSearchBar';
import { useAuth } from '../store/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
  onTabletCollapseToggle?: () => void;
}

export function Navbar({ onMenuClick, onTabletCollapseToggle }: NavbarProps) {
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  // Close profile popover on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

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
    <header className="sticky top-0 z-[1020] border-b border-white/10 bg-navy/90 px-3 py-2 md:px-5 md:py-3 backdrop-blur-xl">
      <div className="flex flex-row items-center justify-between gap-2 md:gap-4 w-full">
        
        {/* Branding & Menu Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            onClick={onMenuClick}
            aria-label="Toggle navigation menu"
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white hover:bg-white/10 md:hidden shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center transition active:scale-95"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="hidden sm:block">
            <BrandLogo size={28} showText variant="header" />
          </div>
          <div className="block sm:hidden">
            <BrandLogo size={28} variant="iconOnly" />
          </div>
        </div>

        {/* Action area (Functional Search + Clock + Profile Avatar Popover) */}
        <div className="flex flex-1 items-center gap-2 md:gap-3 justify-end min-w-0">
          {/* Functional Global Search */}
          <div className="flex-1 max-w-xl min-w-0">
            <GlobalSearchBar />
          </div>

          <Button 
            variant="secondary" 
            className="hidden lg:flex h-10 px-3.5 shrink-0 text-xs"
            onClick={() => setIsQuickActionsOpen(true)}
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan" />
            <span>Quick Actions</span>
          </Button>

          <div className="glass-panel hidden xl:flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs text-slate-300">
            <Clock3 className="h-3.5 w-3.5 text-cyan" />
            <span>{dayjs().format('ddd, DD MMM · HH:mm')}</span>
          </div>

          {/* Top-Right User Profile Avatar with Interactive Popover */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              aria-label="Open profile menu"
              aria-expanded={isProfileMenuOpen}
              className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-1.5 md:pr-3 text-left transition-all hover:border-cyan/40 hover:bg-white/10 shrink-0 focus:outline-none"
            >
              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'Officer'}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Gracefully fall back to initials if image URL fails to load
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                    className="h-8 w-8 rounded-lg object-cover border border-cyan/40"
                  />
                ) : null}
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-police/40 border border-cyan/30 text-xs font-bold text-cyan"
                  style={{ display: user?.avatar ? 'none' : 'flex' }}
                >
                  {getInitials(user?.name)}
                </div>
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
            </button>

            {/* Profile Popover Dropdown */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-white/10 bg-slate-900/95 p-3 text-slate-200 shadow-2xl backdrop-blur-xl z-[1200] animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'Officer'}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                      className="h-10 w-10 rounded-xl object-cover border border-cyan/40"
                    />
                  ) : null}
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-police/40 border border-cyan/30 text-sm font-bold text-cyan"
                    style={{ display: user?.avatar ? 'none' : 'flex' }}
                  >
                    {getInitials(user?.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{user?.name || 'Officer'}</p>
                    <p className="text-xs text-slate-400 font-mono truncate">{user?.email || 'officer@ksp.gov.in'}</p>
                  </div>
                </div>

                <div className="py-2 space-y-1 text-xs">
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <Shield className="h-4 w-4 text-cyan" />
                    <span>Officer Profile & Credentials</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>System Settings</span>
                  </Link>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
                  >
                    <span>Sign Out of AI-CIOS</span>
                  </button>
                </div>
              </div>
            )}
          </div>
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
