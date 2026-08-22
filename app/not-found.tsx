import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
        404 - Page Not Found
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
        The route you are trying to access does not exist or has been moved in the Dayflow HRMS workspace.
      </p>
      <div className="flex items-center gap-3">
        <Link href="/employee/dashboard">
          <Button variant="primary">
            <Home className="w-4 h-4" />
            Employee Dashboard
          </Button>
        </Link>
        <Link href="/admin/dashboard">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4" />
            Admin Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
