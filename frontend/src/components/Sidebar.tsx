import { useEffect, useState } from 'react';
import { BarChart3, Brain, FileText, Map, Network, Search, Settings, LayoutDashboard, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
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
      
      {/* Collapsible SOC Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[1050] flex flex-col border-r border-white/10 bg-navy/95 py-4 text-slate-200 shadow-2xl transition-all duration-300 ease-in-out md:static md:flex md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20 md:px-2' : 'w-[260px] px-3.5'}`}
      >
        {/* Header Branding */}
        <div className={`flex items-center pb-5 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-2'}`}>
          <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
            <BrandLogo showText variant="sidebar" size={28} />
          </div>
          {isCollapsed && (
            <div className="flex items-center justify-center">
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
        <nav className="flex-1 space-y-1.5 overflow-y-auto">
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
                    isCollapsed
                      ? 'justify-center rounded-xl p-3'
                      : 'gap-3 rounded-xl px-3.5 py-2.5',
                    isActive
                      ? 'bg-police text-white shadow-lg shadow-police/20 font-semibold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white',
                  ].join(' ')
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}

                {/* Tooltip on Collapsed State */}
                {isCollapsed && (
                  <span className="pointer-events-none absolute left-full ml-3 z-[1100] hidden whitespace-nowrap rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl group-hover:block">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Expand / Collapse Toggle Control */}
        <div className="pt-3 border-t border-white/10 mt-2 hidden md:block">
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`flex w-full items-center gap-2.5 rounded-xl border border-white/5 p-2.5 text-xs text-slate-400 hover:bg-white/5 hover:text-white transition-all ${
              isCollapsed ? 'justify-center' : 'justify-start'
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-cyan" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 text-cyan" />
                <span className="font-medium text-slate-300">Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
