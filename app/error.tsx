'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
        An unexpected error occurred while loading this view. The system logged the trace for evaluation.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={() => reset()} variant="primary" size="sm">
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </Button>
        <Link href="/employee/dashboard">
          <Button variant="outline" size="sm">
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
