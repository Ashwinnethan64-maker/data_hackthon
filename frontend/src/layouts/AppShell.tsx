import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTabletCollapsed, setIsTabletCollapsed] = useState(false);
  const location = useLocation();

  const isAiPage = location.pathname.startsWith('/ai');

  return (
    <div className="h-screen bg-navy text-slate-100 overflow-hidden">
      <div className="flex h-screen relative overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          isTabletCollapsed={isTabletCollapsed}
        />

        <main className="flex h-screen flex-1 flex-col overflow-hidden">
          <Navbar 
            onMenuClick={() => setIsSidebarOpen(true)}
            onTabletCollapseToggle={() => setIsTabletCollapsed(p => !p)}
          />
          <div className={`flex-1 flex flex-col min-h-0 ${isAiPage ? 'p-3 overflow-hidden h-[calc(100vh-4rem)]' : 'p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto'}`}>
            <div className="mx-auto w-full max-w-[1920px] flex-1 flex flex-col min-h-0">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
