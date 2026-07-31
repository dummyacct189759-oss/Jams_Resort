import React, { useState, useEffect } from 'react';
import {
  Building2,
  Receipt,
  CreditCard,
  Database,
  Bell,
  Globe,
  Lock,
  Palette,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useResort } from '@/context/ResortContext';
import { toast } from 'react-hot-toast';
import { settingsService } from '@/services/api';

const Settings = () => {
  const { settings, updateSettings } = useResort();
  const [formData, setFormData] = useState({
    resort_name: '',
    contact_number: '',
    address: ''
  });
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (settings) {
      setFormData({
        resort_name: settings.resort_name,
        contact_number: settings.contact_number,
        address: settings.address
      });
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleBackup = () => {
    toast.loading('Preparing backup...', { duration: 2000 });
    setTimeout(() => {
        window.location.href = settingsService.getBackupUrl();
        toast.success('Backup downloaded successfully!');
    }, 1500);
  };

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setIsDarkMode(isDark);
    toast.success(`${isDark ? 'Dark' : 'Light'} mode enabled`);
  };

  return (
    <div className="space-y-8 max-w-4xl pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500">Global system configuration and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Resort Information</CardTitle>
                  <CardDescription>Update your resort's public profile and contact details.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Resort Name</label>
                  <input
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.resort_name}
                    onChange={e => setFormData({...formData, resort_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Contact Number</label>
                  <input
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.contact_number}
                    onChange={e => setFormData({...formData, contact_number: e.target.value})}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Address</label>
                  <input
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
              <Button type="submit" className="rounded-xl h-12 px-8 font-bold">Save Changes</Button>
            </CardContent>
          </Card>
        </form>

        <div className="grid grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:border-primary transition-colors overflow-hidden group" onClick={handleBackup}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Backup & Restore</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Download full DB export</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors overflow-hidden group" onClick={toggleTheme}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-gold/10 dark:bg-gold/20 rounded-2xl group-hover:bg-gold/20 dark:group-hover:bg-gold/30 transition-colors">
                <Palette className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Appearance</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Toggle {isDarkMode ? 'Light' : 'Dark'} Mode</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
