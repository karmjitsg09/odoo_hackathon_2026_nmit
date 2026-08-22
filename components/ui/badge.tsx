import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: React.ReactNode;
}

export function Badge({ variant = 'neutral', children, className, ...props }: BadgeProps) {
  const variants = {
    primary:
      'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    secondary:
      'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
    outline:
      'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-transparent',
    success:
      'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    warning:
      'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    danger:
      'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
    info:
      'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30',
    neutral:
      'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
