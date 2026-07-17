import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy text-slate-100">
      <div className="flex min-h-screen relative overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
          <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1920px]">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
