import { useState, useEffect } from 'react';
import { HiOutlineCog6Tooth, HiOutlineBell, HiOutlineMoon, HiOutlineKey, HiOutlineCheck } from 'react-icons/hi2';
import api from '../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    emailNotifications: { reports: true, marketing: false, security: true },
    autoScan: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real app, fetch settings from API here
  }, []);

  const saveSettings = async () => {
    setLoading(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved');
    } catch (e) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleToggle = (category, key) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: !prev[category][key] }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="space-y-1">
          {[
            { id: 'general', icon: HiOutlineCog6Tooth, label: 'General' },
            { id: 'notifications', icon: HiOutlineBell, label: 'Notifications' },
            { id: 'appearance', icon: HiOutlineMoon, label: 'Appearance' },
            { id: 'api-keys', icon: HiOutlineKey, label: 'API Keys' },
          ].map(tab => (
            <button key={tab.id} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab.id === 'general' ? 'bg-primary-500/10 text-primary-400' : 'text-dark-300 hover:bg-dark-800/50 hover:text-white'}`}>
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { key: 'reports', label: 'Report Generation', desc: 'Get notified when a new analysis report is ready.' },
                { key: 'security', label: 'Security Alerts', desc: 'Receive immediate alerts for critical vulnerabilities.' },
                { key: 'marketing', label: 'Product Updates', desc: 'News about new features and improvements.' }
              ].map(item => (
                <div key={item.key} className="flex items-start justify-between py-3 border-b border-dark-700/50 last:border-0 last:pb-0">
                  <div>
                    <h3 className="text-sm font-medium text-white">{item.label}</h3>
                    <p className="text-xs text-dark-400 mt-0.5">{item.desc}</p>
                  </div>
                  <button onClick={() => toggleToggle('emailNotifications', item.key)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.emailNotifications[item.key] ? 'bg-primary-500' : 'bg-dark-600'}`}>
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.emailNotifications[item.key] ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Automation</h2>
            <div className="flex items-start justify-between py-3">
              <div>
                <h3 className="text-sm font-medium text-white">Auto-Scan Repositories</h3>
                <p className="text-xs text-dark-400 mt-0.5">Automatically trigger an analysis when connecting a new GitHub repository.</p>
              </div>
              <button onClick={() => setSettings({ ...settings, autoScan: !settings.autoScan })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.autoScan ? 'bg-primary-500' : 'bg-dark-600'}`}>
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.autoScan ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={saveSettings} disabled={loading} className="gradient-btn px-6 flex items-center gap-2">
              <HiOutlineCheck className="w-5 h-5" /> {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
