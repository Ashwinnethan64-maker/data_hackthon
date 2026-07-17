import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../store/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithMockCredentials, user, loading } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google');
      setIsSubmitting(false);
    }
  };

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show a loading screen if checking session on mount
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan/30 border-t-cyan"></div>
      </div>
    );
  }

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    
    // Assign role based on username content for quick role testing
    let role: any = 'investigator';
    const lowUser = username.toLowerCase();
    if (lowUser.includes('analyst')) role = 'analyst';
    else if (lowUser.includes('supervisor')) role = 'supervisor';
    else if (lowUser.includes('admin')) role = 'administrator';
    
    setTimeout(() => {
      loginWithMockCredentials(username, role);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(29,78,216,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(6,182,212,0.12),_transparent_25%),#081120] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-[1.15fr_0.85fr]">
          <section className="flex flex-col justify-between gap-10 p-8 lg:p-12">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan/80">AI-CIOS</p>
              <h1 className="max-w-xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                AI Crime Intelligence Operating System
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Secure intelligence for investigators, analysts, and supervisors. Explore cases, reveal
                networks, and generate evidence-backed insights.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['Conversational AI', 'Investigative question answering with evidence'],
                ['Relationship Intelligence', 'Graph-based discovery across entities'],
                ['Explainable Insights', 'Traceable reasoning for every response'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex items-center justify-center bg-slate-950/40 p-8 lg:p-12">
            <Card className="w-full max-w-md p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan/80">Secure access</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Login</h2>
              <p className="mt-2 text-sm text-slate-400">Use your credentials or bypass using mock credentials.</p>

              <form className="mt-8 space-y-4" onSubmit={handleManualLogin}>
                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}
                
                <label className="block space-y-2 text-sm text-slate-300">
                  <span>Username</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan/60"
                    placeholder="e.g., investigator.ash (or analyst.bob / supervisor.chief)"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </label>
                <label className="block space-y-2 text-sm text-slate-300">
                  <span>Password</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan/60"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                
                <Button
                  className="mt-2 w-full"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>

                <div className="relative my-4 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <span className="relative bg-[#0d1329] px-3 text-xs text-slate-500 uppercase tracking-widest">
                    Or
                  </span>
                </div>

                <Button
                  className="w-full border border-white/10 bg-transparent hover:bg-white/5 text-slate-200"
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </div>
                </Button>
              </form>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
