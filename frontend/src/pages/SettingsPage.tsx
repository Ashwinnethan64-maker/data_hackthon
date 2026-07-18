import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { apiRequest } from '../utils/api';
import { User, Shield, Bell, Loader2, Save } from 'lucide-react';

export function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/settings/profile');
      setProfile(data);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to fetch profile' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await apiRequest('/settings/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Settings</h1>
        <p className="mt-2 text-slate-400">Manage your profile, preferences, and security settings.</p>
      </header>

      {message && (
        <div className={`px-4 py-3 rounded-lg flex items-center gap-2 ${message.type === 'error' ? 'bg-danger/20 border-danger text-danger' : 'bg-green-500/20 border border-green-500/50 text-green-400'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-cyan/20 text-cyan">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-white">Profile Information</h2>
            </div>
            
            {profile && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={profile.name || ''} 
                      onChange={handleChange}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Badge Number</label>
                    <input 
                      type="text" 
                      name="badgeNumber"
                      value={profile.badgeNumber || ''} 
                      onChange={handleChange}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={profile.email || ''} 
                      onChange={handleChange}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={profile.phone || ''} 
                      onChange={handleChange}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Department</label>
                    <input 
                      type="text" 
                      name="department"
                      value={profile.department || ''} 
                      onChange={handleChange}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Police Station</label>
                    <input 
                      type="text" 
                      name="policeStation"
                      value={profile.policeStation || ''} 
                      onChange={handleChange}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan transition"
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="col-span-1 space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-police/20 text-police">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-white">Security</h2>
            </div>
            <p className="text-sm text-slate-400 mb-4">Ensure your account is using a strong password and review your recent login sessions.</p>
            <Button variant="secondary" className="w-full mb-3">Change Password</Button>
            <Button variant="secondary" className="w-full">View Active Sessions</Button>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-slate-900/50 text-cyan focus:ring-cyan focus:ring-offset-navy" defaultChecked />
                <span className="text-sm text-slate-300">Email Alerts</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-slate-900/50 text-cyan focus:ring-cyan focus:ring-offset-navy" defaultChecked />
                <span className="text-sm text-slate-300">Crime Hotspot Alerts</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-slate-900/50 text-cyan focus:ring-cyan focus:ring-offset-navy" />
                <span className="text-sm text-slate-300">SMS Notifications</span>
              </label>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
