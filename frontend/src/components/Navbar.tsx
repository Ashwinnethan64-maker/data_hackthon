import { Bell, Clock3, Search, Sparkles, Menu } from 'lucide-react';
import dayjs from 'dayjs';
import { Button } from './Button';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-navy/85 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan/80">Mission Control</p>
            <h2 className="mt-1 text-xl font-bold text-white">AI-CIOS</h2>
          </div>
          <button 
            onClick={onMenuClick}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center xl:justify-end">
          <label className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300 shadow-inner shadow-black/10">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              aria-label="Search"
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              placeholder="Search FIR, accused, officer, or district"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button variant="secondary" className="h-12 px-4">
              <Sparkles className="h-4 w-4 text-cyan" />
              Quick Actions
            </Button>
            <button className="glass-panel flex h-12 w-12 items-center justify-center rounded-2xl text-slate-200 transition hover:border-cyan/40 hover:text-white">
              <Bell className="h-4 w-4" />
            </button>
            <div className="glass-panel hidden sm:flex h-12 items-center gap-2 rounded-2xl px-4 text-sm text-slate-300">
              <Clock3 className="h-4 w-4 text-cyan" />
              <span>{dayjs().format('ddd, DD MMM · HH:mm')}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
