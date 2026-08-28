import { useEffect } from 'react';
import { BarChart3, Brain, FileText, Map, Network, Search, Settings, LayoutDashboard, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { NavigationItem } from '../types/navigation';
import { BrandLogo } from './common/BrandLogo';

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
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function Sidebar({ isOpen, onClose, isHovered = false, onMouseEnter, onMouseLeave }: SidebarProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    
    // Lock body scroll on mobile when drawer is active
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // On desktop: default state is compact (w-20), on hover it smoothly expands to w-[260px]
  const isExpanded = isHovered;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[1040] bg-navy/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Automatic Hover-Expand SOC Sidebar */}
      <aside 
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`fixed inset-y-0 left-0 z-[1050] flex flex-col border-r border-white/10 bg-navy/95 py-4 text-slate-200 shadow-2xl transition-all duration-300 ease-in-out md:static md:flex md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isExpanded ? 'md:w-[260px] px-3.5' : 'md:w-20 md:px-2 w-[260px] px-3.5'}`}
      >
        {/* Header Branding */}
        <div className={`flex items-center pb-5 ${!isExpanded ? 'md:justify-center md:px-0' : 'justify-between px-2'}`}>
          <div className={`${!isExpanded ? 'md:hidden' : 'block'}`}>
            <BrandLogo showText variant="sidebar" size={28} />
          </div>
          {!isExpanded && (
            <div className="hidden md:flex items-center justify-center">
              <BrandLogo size={32} />
            </div>
          )}
          <button 
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden">
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
                    'group relative flex items-center transition-all duration-200',
                    !isExpanded
                      ? 'md:justify-center rounded-xl p-3'
                      : 'gap-3 rounded-xl px-3.5 py-2.5',
                    isActive
                      ? 'bg-police text-white shadow-lg shadow-police/20 font-semibold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white',
                  ].join(' ')
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={`text-sm font-medium transition-opacity duration-200 whitespace-nowrap ${
                  !isExpanded ? 'md:hidden' : 'block'
                }`}>
                  {item.label}
                </span>

                {/* Tooltip on Collapsed State */}
                {!isExpanded && (
                  <span className="pointer-events-none absolute left-full ml-3 z-[1100] hidden whitespace-nowrap rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl group-hover:block">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
