import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './store/AuthContext';
import { AppShell } from './layouts/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Suspense, lazy } from 'react';

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AiInvestigatorPage = lazy(() => import('./pages/AiInvestigatorPage').then(m => ({ default: m.AiInvestigatorPage })));
const CaseExplorerPage = lazy(() => import('./pages/CaseExplorerPage').then(m => ({ default: m.CaseExplorerPage })));
const CaseDetailsPage = lazy(() => import('./pages/CaseDetailsPage').then(m => ({ default: m.CaseDetailsPage })));
const CriminalNetworkPage = lazy(() => import('./pages/CriminalNetworkPage').then(m => ({ default: m.CriminalNetworkPage })));
const CrimeMapPage = lazy(() => import('./pages/CrimeMapPage').then(m => ({ default: m.CrimeMapPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan/30 border-t-cyan"></div>
      </div>
    );
  }

  const PageLoader = () => (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan/30 border-t-cyan"></div>
    </div>
  );

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to={`/login${location.search}`} replace />
          )
        } 
      />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
          <Route path="/ai" element={<Suspense fallback={<PageLoader />}><AiInvestigatorPage /></Suspense>} />
          <Route path="/cases" element={<Suspense fallback={<PageLoader />}><CaseExplorerPage /></Suspense>} />
          <Route path="/case/:id" element={<Suspense fallback={<PageLoader />}><CaseDetailsPage /></Suspense>} />
          <Route path="/network" element={<Suspense fallback={<PageLoader />}><CriminalNetworkPage /></Suspense>} />
          <Route path="/map" element={<Suspense fallback={<PageLoader />}><CrimeMapPage /></Suspense>} />
          <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>} />
          <Route path="/reports" element={<Suspense fallback={<PageLoader />}><ReportsPage /></Suspense>} />
          <Route path="/settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
