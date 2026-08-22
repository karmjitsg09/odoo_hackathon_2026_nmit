import React from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className={cn('w-full caption-bottom text-sm text-left', className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-slate-100/75 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800', className)} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-slate-200 dark:divide-slate-800/60', className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40 data-[state=selected]:bg-slate-100 dark:data-[state=selected]:bg-slate-800',
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-11 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider',
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('p-4 align-middle text-slate-700 dark:text-slate-300 font-normal', className)} {...props} />;
}
