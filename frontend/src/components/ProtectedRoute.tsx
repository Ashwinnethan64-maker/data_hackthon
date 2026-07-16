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
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan/30 border-t-cyan"></div>
      </div>
    );
  }

  // AuthContext handles Catalyst session check. If authenticated, user will be populated.
  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}
