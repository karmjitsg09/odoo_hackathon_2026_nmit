'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useApp } from '@/lib/store/app-context';
import { Alert } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentRole, setRole } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} portal="admin" />
      
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {currentRole !== 'admin' && (
            <Alert variant="warning" title="Access Notice: Active Role is Employee" className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <span>
                  You are viewing Admin & HR management interfaces with employee credentials. Restricted administrative operations require an Admin or HR role.
                </span>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Switch to Admin Role
                </button>
              </div>
            </Alert>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

