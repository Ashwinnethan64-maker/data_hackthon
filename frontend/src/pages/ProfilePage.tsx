import { useAuth } from '../store/AuthContext';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Shield, User, Mail, Building, MapPin, KeyRound, LogOut, CheckCircle2, ShieldCheck, Activity, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const { user, loading, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'OF';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Page Header */}
      <section className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan/80">Command Identity</p>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Officer Profile & Security Credentials</h1>
            <p className="mt-1 text-sm text-slate-400">
              Verified credentials, jurisdictional role assignments, and authentication chain of custody.
            </p>
          </div>
          <Badge variant="success" className="w-fit flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active Session
          </Badge>
        </div>
      </section>

      {/* Main Profile Grid */}
      <div className="grid gap-6 md:grid-cols-[1.1fr_1.9fr]">
        {/* Left: Avatar & Quick Status */}
        <Card className="flex flex-col items-center text-center p-6 space-y-4">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'Officer'}
                className="h-28 w-28 rounded-3xl border-2 border-cyan/40 object-cover shadow-2xl shadow-cyan/20"
              />
            ) : (
              <div className="h-28 w-28 rounded-3xl border-2 border-cyan/40 bg-gradient-to-br from-police via-navy to-slate-900 flex items-center justify-center text-3xl font-black text-cyan shadow-2xl shadow-cyan/20">
                {getInitials(user?.name)}
              </div>
            )}
            <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-navy ring-2 ring-emerald-500/30" />
          </div>

          <div className="space-y-1 w-full">
            <h2 className="text-xl font-bold text-white truncate">{user?.name || 'Officer Ashwin Nethan'}</h2>
            <p className="text-xs font-mono text-cyan truncate">{user?.email || 'officer@karnatakapolice.gov.in'}</p>
            <p className="text-xs text-slate-400 mt-1">
              Role: <span className="text-slate-200 font-semibold uppercase">{user?.role || 'Investigator'}</span>
            </p>
          </div>

          <div className="w-full pt-4 border-t border-white/10 space-y-2 text-left text-xs">
            <div className="flex justify-between py-1.5 text-slate-400 border-b border-white/5">
              <span>Authentication:</span>
              <span className="text-white font-medium">{user?.provider || 'Google Auth'}</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-400 border-b border-white/5">
              <span>Security Clearance:</span>
              <span className="text-cyan font-semibold">Tier-1 SOC Classified</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-400">
              <span>Station ID:</span>
              <span className="text-white font-mono">{user?.district || 'Bengaluru Central'} PS</span>
            </div>
          </div>

          <button
            onClick={logout}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2.5 text-xs font-bold transition-all disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {loading ? 'Terminating Session...' : 'Sign Out of AI-CIOS'}
          </button>
        </Card>

        {/* Right: Detailed Information Sections */}
        <div className="space-y-6">
          {/* Official Information Card */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <Shield className="h-5 w-5 text-cyan" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Jurisdictional Credentials</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-slate-400">Assigned Department</p>
                <p className="text-sm font-bold text-white">Cyber Crime & Narcotics Intelligence</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-slate-400">Primary District</p>
                <p className="text-sm font-bold text-white">{user?.district || 'Bengaluru Urban'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-slate-400">Command Unit</p>
                <p className="text-sm font-bold text-white">Karnataka State Police SOC</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-slate-400">Badge Identifier</p>
                <p className="text-sm font-mono font-bold text-cyan">KA-KSP-{user?.id?.slice(0, 6).toUpperCase() || '772910'}</p>
              </div>
            </div>
          </Card>

          {/* Security & Access Audit Card */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <KeyRound className="h-5 w-5 text-police-light" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Session Security & Audit Compliance</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-white">Multi-Factor Authentication</p>
                    <p className="text-[11px] text-slate-400">Authenticated through official OAuth Identity Provider</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Enforced
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-cyan" />
                  <div>
                    <p className="font-semibold text-white">Chain-of-Custody Logging</p>
                    <p className="text-[11px] text-slate-400">All FIR accesses, AI queries, and dossier exports are audited</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase bg-cyan/20 text-cyan border border-cyan/30 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                to="/settings"
                className="text-xs font-semibold text-cyan hover:text-white transition-colors"
              >
                Configure Notification & System Preferences →
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
