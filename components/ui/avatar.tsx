import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt, name = 'User', size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getInitials = (str: string) => {
    return str
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div
      className={twMerge(
        clsx(
          'relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-500 to-purple-600 font-semibold text-white shadow-sm',
          sizes[size],
          className
        )
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : null}
      <span className={src ? 'hidden' : ''}>{getInitials(name)}</span>
    </div>
  );
}
