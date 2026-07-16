import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export function AppShell() {
  return (
    <div className="min-h-screen bg-navy text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex min-h-screen flex-1 flex-col">
          <Navbar />
          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
