'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import { Sparkles, ShieldCheck, UserCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { setRole, setCurrentUserId, profiles } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Find matching user or default to Admin
      const matched = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setCurrentUserId(matched.id);
        setRole(matched.role);
      } else {
        const defaultUser = profiles[0];
        setCurrentUserId(defaultUser.id);
        setRole(defaultUser.role);
      }

      toast.success('Successfully logged into Dayflow HRMS');
      setLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  const handleQuickDemoLogin = (role: 'admin' | 'employee') => {
    setLoading(true);
    setTimeout(() => {
      if (role === 'admin') {
        const adminUser = profiles.find((p) => p.role === 'admin') || profiles[0];
        setCurrentUserId(adminUser.id);
        setRole('admin');
      } else {
        const empUser = profiles.find((p) => p.role === 'employee') || profiles[1];
        setCurrentUserId(empUser.id);
        setRole('employee');
      }

      toast.success(`Logged in as Demo ${role === 'admin' ? 'HR Admin' : 'Employee'}`);
      setLoading(false);
      router.push('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-xl shadow-indigo-500/30 mb-2">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Dayflow HRMS
          </h1>
          <p className="text-sm text-slate-400">
            Human Resource Management & Workforce Platform
          </p>
        </div>

        {/* Quick Evaluator Demo Card */}
        <Card className="bg-indigo-950/40 border-indigo-500/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Hackathon Evaluator Quick Login
          </div>
          <p className="text-xs text-slate-300">
            Test the full multi-role workflow instantly with pre-configured demo profiles:
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleQuickDemoLogin('admin')}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              Demo Admin / HR
            </Button>
            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={() => handleQuickDemoLogin('employee')}
              disabled={loading}
              className="text-xs"
            >
              <UserCheck className="w-4 h-4" />
              Demo Employee
            </Button>
          </div>
        </Card>

        {/* Login Form */}
        <Card className="bg-slate-900/80 border-slate-800 p-6 space-y-5 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@dayflow.hr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <a href="#" className="text-xs text-indigo-400 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 font-semibold"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-400">
            Don't have an account?{' '}
            <a href="/register" className="text-indigo-400 hover:underline font-semibold">
              Register New Employee
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
