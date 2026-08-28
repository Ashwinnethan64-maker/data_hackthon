import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useEffect } from 'react';

export function ProtectedRoute() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      navigate('/login', { replace: true });
    };

    window.addEventListener('unauthorized_error', handleUnauthorized);
    return () => window.removeEventListener('unauthorized_error', handleUnauthorized);
  }, [logout, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-5 bg-[#081120] text-slate-100">
        <img
          src="/ai-cios-logo.svg"
          alt="AI-CIOS Logo"
          className="h-16 w-16 object-contain"
        />
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan/80">AI-CIOS</span>
          <p className="text-sm font-bold text-white">Crime Intelligence OS</p>
          <p className="text-xs text-slate-400">Verifying security clearances...</p>
        </div>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan/20 border-t-cyan"></div>
      </div>
    );
  }

  // AuthContext handles Catalyst session check. If authenticated, user will be populated.
  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}
