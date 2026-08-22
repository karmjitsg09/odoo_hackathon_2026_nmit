'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  Sparkles,
  Shield,
  UserCheck,
  User,
  ArrowLeftRight,
  BarChart3,
} from 'lucide-react';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  portal?: 'employee' | 'admin';
}

export function Sidebar({ isOpen, setIsOpen, portal }: SidebarProps) {
  const pathname = usePathname();
  const isCurrentAdminPath = portal === 'admin' || pathname.startsWith('/admin');

  const employeeNavItems = [
    {
      name: 'Dashboard',
      href: '/employee/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'My Profile',
      href: '/employee/profile',
      icon: User,
    },
    {
      name: 'Attendance',
<<<<<<< HEAD
      href: currentRole === 'admin' ? '/admin/attendance' : '/employee/attendance',
=======
      href: '/employee/attendance',
>>>>>>> cab571b (feat: create Dayflow foundation)
      icon: Clock,
    },
    {
<<<<<<< HEAD
      name: 'Leave',
      href: currentRole === 'admin' ? '/admin/leave' : '/employee/leave',
=======
      name: 'Leave Requests',
      href: '/employee/leave',
>>>>>>> cab571b (feat: create Dayflow foundation)
      icon: CalendarCheck,
    },
    {
      name: 'My Payroll',
      href: '/employee/payroll',
      icon: CreditCard,
    },
  ];

  const adminNavItems = [
    {
      name: 'Admin Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Employee Directory',
      href: '/admin/employees',
      icon: Users,
    },
    {
      name: 'Attendance Logs',
      href: '/admin/attendance',
      icon: Clock,
    },
    {
      name: 'Leave Approvals',
      href: '/admin/leave',
      icon: CalendarCheck,
    },
    {
      name: 'Payroll Management',
      href: '/admin/payroll',
      icon: CreditCard,
    },
    {
      name: 'Reports & Analytics',
      href: '/admin/reports',
      icon: BarChart3,
    },
  ];

  const currentNavItems = isCurrentAdminPath ? adminNavItems : employeeNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <Link href={isCurrentAdminPath ? '/admin/dashboard' : '/employee/dashboard'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5" />
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
                {isCurrentAdminPath ? 'Admin & HR Portal' : 'Employee Portal'}
              </p>
            </div>
          </Link>
        </div>

        {/* Portal Switcher Banner */}
        <div className="px-4 pt-4">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isCurrentAdminPath ? (
                <Shield className="w-4 h-4 text-rose-500" />
              ) : (
                <UserCheck className="w-4 h-4 text-emerald-500" />
              )}
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isCurrentAdminPath ? 'HR / Admin View' : 'Employee View'}
              </span>
            </div>
            <Link
              href={isCurrentAdminPath ? '/employee/dashboard' : '/admin/dashboard'}
              className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Switch portal view"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {isCurrentAdminPath ? 'Administration' : 'Employee Workspace'}
          </div>

<<<<<<< HEAD
          {navItems.map((item) => {
            const isAdminOnly = !item.roles.includes('employee');
            const isForbidden = currentRole === 'employee' && isAdminOnly;
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`) ||
              (item.name === 'Attendance' && pathname.includes('/attendance')) ||
              (item.name === 'Leave' && pathname.includes('/leave'));
=======
          {currentNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
>>>>>>> cab571b (feat: create Dayflow foundation)

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
              </Link>
            );
          })}
        </div>

        {/* User Card & Role Footnote */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
            <Avatar name={isCurrentAdminPath ? 'Admin User' : 'Sarah Connor'} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {isCurrentAdminPath ? 'Admin Workspace' : 'Sarah Connor'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {isCurrentAdminPath ? 'admin@dayflow.hr' : 'EMP-003 • Engineering'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
            <Link href="/login" className="hover:text-indigo-400 transition-colors">
              Sign In
            </Link>
            <span>•</span>
            <Link href="/signup" className="hover:text-indigo-400 transition-colors">
              Sign Up
            </Link>
            <span>•</span>
            <Badge variant="outline" className="text-[10px]">Phase 1</Badge>
          </div>
        </div>
      </aside>
    </>
  );
}
