import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { ToastContainer } from '../components/ToastContainer';

export function AppShell() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const location = useLocation();

  const isFullHeightPage = 
    location.pathname.startsWith('/ai') || 
    location.pathname === '/network' || 
    location.pathname === '/map';

  return (
    <div className="h-screen bg-navy text-slate-100 overflow-hidden">
      <div className="flex h-screen relative overflow-hidden">
        <Sidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)} 
          isHovered={isSidebarHovered}
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
        />

        <main className="flex h-screen flex-1 flex-col overflow-hidden min-w-0">
          <Navbar 
            onMenuClick={() => setIsMobileSidebarOpen(true)}
          />
          <div className={`flex-1 flex flex-col min-h-0 ${isFullHeightPage ? 'p-0 overflow-hidden h-[calc(100vh-4rem)]' : 'p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto'}`}>
            <div className="mx-auto w-full max-w-[1920px] flex-1 flex flex-col min-h-0">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
