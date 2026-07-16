import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './store/AuthContext';
import { AppShell } from './layouts/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AiInvestigatorPage } from './pages/AiInvestigatorPage';
import { CaseExplorerPage } from './pages/CaseExplorerPage';
import { CaseDetailsPage } from './pages/CaseDetailsPage';
import { CriminalNetworkPage } from './pages/CriminalNetworkPage';
import { CrimeMapPage } from './pages/CrimeMapPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ai" element={<AiInvestigatorPage />} />
          <Route path="/cases" element={<CaseExplorerPage />} />
          <Route path="/case/:id" element={<CaseDetailsPage />} />
          <Route path="/network" element={<CriminalNetworkPage />} />
          <Route path="/map" element={<CrimeMapPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
