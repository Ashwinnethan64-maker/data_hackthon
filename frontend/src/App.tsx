import { Navigate, Route, Routes } from 'react-router-dom';
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
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
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
