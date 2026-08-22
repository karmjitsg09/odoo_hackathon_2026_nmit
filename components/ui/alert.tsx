import React from 'react';
import { cn } from '@/lib/utils';
import { Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'warning' | 'success' | 'danger';
  title?: string;
  children: React.ReactNode;
}

export function Alert({ variant = 'info', title, children, className, ...props }: AlertProps) {
  const icons = {
    info: <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
    danger: <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
  };

  const variants = {
    info: 'bg-indigo-50/70 border-indigo-200 text-indigo-900 dark:bg-indigo-950/30 dark:border-indigo-800/60 dark:text-indigo-200',
    warning: 'bg-amber-50/70 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800/60 dark:text-amber-200',
    success: 'bg-emerald-50/70 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800/60 dark:text-emerald-200',
    danger: 'bg-rose-50/70 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800/60 dark:text-rose-200',
  };

  return (
    <div
      role="alert"
      className={cn('flex gap-3 p-4 rounded-xl border text-sm', variants[variant], className)}
      {...props}
    >
      {icons[variant]}
      <div className="space-y-1">
        {title && <h5 className="font-semibold leading-tight">{title}</h5>}
        <div className="text-xs opacity-90">{children}</div>
      </div>
    </div>
  );
}
