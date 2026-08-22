'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Lock, Mail, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      toast.success('Phase 1 Registration Placeholder: Redirecting to Employee Dashboard...');
      setLoading(false);
      router.push('/employee/dashboard');
    }, 500);
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
            Create an employee or administrator account
          </p>
        </div>

        {/* Signup Form */}
        <Card className="bg-slate-900/90 border-slate-800 p-6 shadow-2xl backdrop-blur-xl">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg">Register Account</CardTitle>
            <CardDescription className="text-xs">
              Supabase Auth user trigger will initialize your profile & employee record
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                required
                placeholder="Eleanor Vance"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="Work Email"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Department"
                type="text"
                required
                placeholder="Engineering / HR / Sales"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                leftIcon={<Building className="w-4 h-4" />}
              />

              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 font-semibold"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="text-center pt-2 text-xs text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 hover:underline font-semibold">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
