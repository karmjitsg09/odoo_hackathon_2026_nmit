'use client';

import React from 'react';
import { useApp } from '@/lib/store/app-context';
import { RoleSwitcher } from './role-switcher';
import { NotificationDropdown } from './notification-dropdown';
import { Menu, Sun, Moon, Search } from 'lucide-react';
import { Avatar } from '../ui/avatar';
import Link from 'next/link';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme, currentUser } = useApp();

  return (
    <header className="sticky top-0 z-30 h-16 glass-nav px-4 sm:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden focus:outline-none"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative hidden sm:flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee, leave, or payroll..."
            className="w-64 lg:w-80 pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-3">
        {/* Role switcher widget */}
        <RoleSwitcher />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Notification dropdown */}
        <NotificationDropdown />

        {/* User avatar link */}
        <Link href={`/employees/${currentUser.id}`} className="flex items-center gap-2 pl-2">
          <Avatar src={currentUser.avatar_url} name={currentUser.full_name} size="sm" />
        </Link>
      </div>
    </header>
  );
}
