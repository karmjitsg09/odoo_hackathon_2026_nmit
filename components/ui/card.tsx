import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glass?: boolean;
}

export function Card({ children, glass = true, className, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl p-6 transition-all duration-300 shadow-sm border',
          glass
            ? 'glass-card'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={twMerge('flex flex-col space-y-1.5 pb-4', className)}>{children}</div>;
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={twMerge('text-lg font-semibold tracking-tight text-slate-900 dark:text-white', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={twMerge('text-sm text-slate-500 dark:text-slate-400', className)}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={twMerge('pt-0', className)}>{children}</div>;
}
