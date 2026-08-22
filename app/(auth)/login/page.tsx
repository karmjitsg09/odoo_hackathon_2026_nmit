'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck, UserCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useApp } from '@/lib/store/app-context';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Determine role from email for demo purposes
    const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase() === 'admin@dayflow.hr';
    setTimeout(() => {
      if (isAdmin) {
        setRole('admin');
        toast.success('Welcome back, Admin! Redirecting to HR Portal...');
        router.push('/admin/dashboard');
      } else {
        setRole('employee');
        toast.success('Welcome back! Redirecting to Employee Dashboard...');
        router.push('/employee/dashboard');
      }
      setLoading(false);
    }, 500);
  };

  const handleQuickDemo = (role: 'admin' | 'employee') => {
    setRole(role);
    toast.success(`Entering ${role === 'admin' ? 'Admin / HR Officer' : 'Employee'} portal...`);
    router.push(role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-xl shadow-indigo-500/30 mb-2">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Dayflow HRMS
          </h1>
          <p className="text-sm text-slate-400">
            Sign in to access your enterprise workspace
          </p>
        </div>

        {/* Quick Demo Access */}
        <Card className="bg-indigo-950/40 border-indigo-500/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Demo — Quick Portal Access
          </div>
          <p className="text-xs text-slate-300">
            Jump directly into either portal for the live demonstration:
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleQuickDemo('admin')}
              className="bg-indigo-600 hover:bg-indigo-500 text-xs"
              id="btn-demo-admin"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin / HR Portal
            </Button>
            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={() => handleQuickDemo('employee')}
              className="text-xs"
              id="btn-demo-employee"
            >
              <UserCheck className="w-4 h-4" />
              Employee Portal
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
            <div className="flex flex-col">
              <span className="font-semibold text-slate-300">Admin demo credentials:</span>
              <span>admin@dayflow.hr</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-300">Employee demo credentials:</span>
              <span>alex.chen@dayflow.hr</span>
            </div>
          </div>
        </Card>

        {/* Login Form */}
        <Card className="bg-slate-900/90 border-slate-800 p-6 shadow-2xl backdrop-blur-xl">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg">Sign In to Dayflow</CardTitle>
            <CardDescription className="text-xs">
              Use your organizational email and password
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="name@dayflow.hr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                id="input-email"
              />

              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                id="input-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 font-semibold"
                disabled={loading}
                id="btn-signin"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="text-center pt-2 text-xs text-slate-400">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-indigo-400 hover:underline font-semibold">
                Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
