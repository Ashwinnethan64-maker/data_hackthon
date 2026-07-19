import { Bell, Clock3, Search, Sparkles, Menu } from 'lucide-react';
import dayjs from 'dayjs';
import { Button } from './Button';
import { useState } from 'react';
import { Modal } from './Modal';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
interface NavbarProps {
  onMenuClick: () => void;
  onTabletCollapseToggle?: () => void;
}

export function Navbar({ onMenuClick, onTabletCollapseToggle }: NavbarProps) {
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[1020] border-b border-white/10 bg-navy/85 px-3 py-3 md:px-4 md:py-4 backdrop-blur-xl sm:px-6 lg:px-8">
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
            className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-slate-300 hover:text-white lg:hidden shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="hidden md:block">
            <p className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-cyan/80">Mission Control</p>
            <h2 className="mt-0.5 md:mt-1 text-lg md:text-xl font-bold text-white">AI-CIOS</h2>
          </div>
        </div>

        {/* Action area (Search + Icons) */}
        <div className="flex flex-1 items-center gap-2 md:gap-3 justify-end">
          <label className="flex w-full md:max-w-xl items-center gap-2 md:gap-3 rounded-xl md:rounded-2xl border border-white/10 bg-white/5 px-3 py-2 md:px-4 md:py-3 text-slate-300 shadow-inner shadow-black/10 min-w-0">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              aria-label="Search"
              className="w-full min-w-0 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              placeholder="Search..."
            />
          </label>

          <Button 
            variant="secondary" 
            className="hidden md:flex h-12 px-4 shrink-0"
            onClick={() => setIsQuickActionsOpen(true)}
          >
            <Sparkles className="h-4 w-4 text-cyan" />
            Quick Actions
          </Button>



          <div className="glass-panel hidden xl:flex h-12 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm text-slate-300">
            <Clock3 className="h-4 w-4 text-cyan" />
            <span>{dayjs().format('ddd, DD MMM · HH:mm')}</span>
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
