'use client';

import React from 'react';
import { useApp } from '@/lib/store/app-context';
import { ShieldCheck, UserCheck } from 'lucide-react';

export function RoleSwitcher() {
  const { currentRole, setRole, currentUser } = useApp();

  return (
    <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-inner">
      <button
        onClick={() => setRole('admin')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
          currentRole === 'admin'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Admin / HR
      </button>

      <button
        onClick={() => setRole('employee')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
          currentRole === 'employee'
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <UserCheck className="w-3.5 h-3.5" />
        Employee
      </button>
    </div>
  );
}
