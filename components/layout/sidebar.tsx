'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  BarChart3,
  Settings,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, currentRole } = useApp();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'employee'],
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: Users,
      roles: ['admin', 'employee'],
    },
    {
      name: 'Attendance',
      href: currentRole === 'admin' ? '/admin/attendance' : '/employee/attendance',
      icon: Clock,
      roles: ['admin', 'employee'],
    },
    {
      name: 'Leave',
      href: currentRole === 'admin' ? '/admin/leave' : '/employee/leave',
      icon: CalendarCheck,
      roles: ['admin', 'employee'],
    },
    {
      name: 'Payroll',
      href: '/payroll',
      icon: CreditCard,
      roles: ['admin', 'employee'],
    },
    {
      name: 'HR Analytics',
      href: '/analytics',
      icon: BarChart3,
      roles: ['admin'],
      badge: 'Admin',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['admin', 'employee'],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/60">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:via-indigo-100 dark:to-indigo-300 bg-clip-text text-transparent">
                  Dayflow
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  HRMS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Human Resource System
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Main Menu
          </div>

          {navItems.map((item) => {
            const isAdminOnly = !item.roles.includes('employee');
            const isForbidden = currentRole === 'employee' && isAdminOnly;
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`) ||
              (item.name === 'Attendance' && pathname.includes('/attendance')) ||
              (item.name === 'Leave' && pathname.includes('/leave'));

            if (isForbidden) return null;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant={isActive ? 'neutral' : 'secondary'}
                    className={isActive ? 'bg-white/20 text-white border-transparent' : ''}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Card & Role Footnote */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
            <Avatar src={currentUser.avatar_url} name={currentUser.full_name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {currentUser.full_name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentUser.job_title}
              </p>
              <div className="mt-1">
                <Badge variant={currentRole === 'admin' ? 'secondary' : 'success'} className="text-[10px]">
                  {currentRole === 'admin' ? 'HR Admin' : 'Employee'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
