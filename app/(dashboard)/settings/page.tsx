'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Bell, Lock, Moon, Sun, Shield, User } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { currentUser, currentRole, theme, toggleTheme } = useApp();

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password updated successfully');
    setPasswordForm({ current: '', newPass: '', confirmPass: '' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your personal preferences, theme, and security settings
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card className="flex items-center gap-4">
        <Avatar src={currentUser.avatar_url} name={currentUser.full_name} size="xl" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{currentUser.full_name}</h2>
            <Badge variant={currentRole === 'admin' ? 'secondary' : 'neutral'}>
              {currentRole === 'admin' ? 'HR Officer' : 'Employee'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">{currentUser.email}</p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            {currentUser.job_title} • {currentUser.department}
          </p>
        </div>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            Theme & Appearance
          </CardTitle>
          <CardDescription>Customize your interface color palette</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
            </p>
            <p className="text-xs text-slate-500">Toggle between dark high-contrast mode and clean light theme</p>
          </div>
          <Button variant="outline" onClick={toggleTheme} className="text-xs">
            Switch to {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </CardContent>
      </Card>

      {/* Security & Password Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-500" />
            Security & Password
          </CardTitle>
          <CardDescription>Update your account login credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Current Password</label>
              <input
                type="password"
                required
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">New Password</label>
              <input
                type="password"
                required
                value={passwordForm.newPass}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordForm.confirmPass}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPass: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <Button type="submit" variant="primary" className="text-xs">
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
