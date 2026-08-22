'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  Clock,
  Play,
  Square,
  CalendarCheck,
  CreditCard,
  User,
  Calendar,
  ArrowRight,
  Sparkles,
  Timer,
} from 'lucide-react';
import { format, parseISO, startOfWeek, addDays } from 'date-fns';

export default function EmployeeDashboardPage() {
  const {
    currentUser,
    todayAttendance,
    clockIn,
    clockOut,
    attendanceRecords,
    leaveRequests,
    leaveBalances,
    payrollRecords,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isClocking, setIsClocking] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentTime(new Date());
    }, 0);
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Employee's personal records
  const userAttendance = attendanceRecords.filter((r) => r.user_id === currentUser.id);
  const userLeaves = leaveRequests.filter((r) => r.user_id === currentUser.id);
  const userPayroll = payrollRecords.filter((r) => r.user_id === currentUser.id);
  const userBalance = leaveBalances.find((b) => b.user_id === currentUser.id) || {
    casual_leave: 12,
    sick_leave: 10,
    annual_leave: 15,
  };

  const totalLeaveAvailable =
    (userBalance.casual_leave || 0) +
    (userBalance.sick_leave || 0) +
    (userBalance.annual_leave || 0);

  // Weekly hours logged
  const currentMonday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weeklyRecords = userAttendance.filter((r) => {
    const d = new Date(r.date);
    return d >= currentMonday && d <= addDays(currentMonday, 6);
  });
  const weeklyHours = weeklyRecords.reduce((acc, r) => acc + (r.work_hours || 0), 0);

  // Recent 3 leave requests
  const recentLeaves = userLeaves.slice(0, 3);

  // Latest payslip
  const latestPayslip = userPayroll[0];

  const handleQuickClockIn = async () => {
    setIsClocking(true);
    try {
      clockIn('Quick Dashboard Clock-In');
    } finally {
      setIsClocking(false);
    }
  };

  const handleQuickClockOut = async () => {
    setIsClocking(true);
    try {
      clockOut();
    } finally {
      setIsClocking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <Avatar src={currentUser.avatar_url} name={currentUser.full_name} size="xl" className="ring-4 ring-indigo-500/30 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {currentUser.full_name.split(' ')[0]}! 👋
                </h1>
                <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px]">
                  Employee Portal
                </Badge>
              </div>
              <p className="text-sm text-indigo-200 mt-1">
                {currentUser.job_title} • {currentUser.department}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {currentTime ? format(currentTime, 'EEEE, MMMM d, yyyy') : todayStr}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-mono text-white">
                  <Timer className="w-3.5 h-3.5 text-emerald-400" />
                  {currentTime ? format(currentTime, 'hh:mm:ss a') : '--:--:--'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Clock-In Widget */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="text-left sm:text-right pr-2">
              <p className="text-[11px] text-slate-400 font-medium uppercase">Today&apos;s Shift</p>
              <p className="text-sm font-bold text-white">
                {todayAttendance?.check_in
                  ? todayAttendance.check_out
                    ? 'Shift Finished 🎉'
                    : 'Currently Clocked In ⏱️'
                  : 'Not Clocked In Yet'}
              </p>
            </div>

            {!todayAttendance?.check_in ? (
              <Button
                variant="success"
                size="md"
                disabled={isClocking}
                onClick={handleQuickClockIn}
                className="font-bold text-xs shadow-lg shadow-emerald-500/25"
              >
                <Play className="w-4 h-4 fill-current" />
                Clock In Now
              </Button>
            ) : !todayAttendance.check_out ? (
              <Button
                variant="danger"
                size="md"
                disabled={isClocking}
                onClick={handleQuickClockOut}
                className="font-bold text-xs shadow-lg shadow-rose-500/25"
              >
                <Square className="w-4 h-4 fill-current" />
                Clock Out
              </Button>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                {todayAttendance.work_hours} hrs logged
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-indigo-500/20 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Weekly Hours
              </p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {weeklyHours.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 40 hrs</span>
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, (weeklyHours / 40) * 100)}%` }}
                />
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Leave Balance
              </p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {totalLeaveAvailable} <span className="text-xs font-normal text-slate-400">days available</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Casual: {userBalance.casual_leave}d • Sick: {userBalance.sick_leave}d
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-purple-500/20 hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Shift Status
              </p>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                {todayAttendance?.check_in
                  ? todayAttendance.check_out
                    ? 'Completed'
                    : 'Active'
                  : 'Ready'}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                {todayAttendance?.check_in
                  ? `In at ${format(parseISO(todayAttendance.check_in), 'hh:mm a')}`
                  : 'Shift starts at 09:00 AM'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-sky-500/20 hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Latest Net Pay
              </p>
              <p className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">
                ${latestPayslip ? latestPayslip.net_salary.toLocaleString() : '8,500'}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Status: {latestPayslip?.payment_status?.toUpperCase() || 'PROCESSED'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* QUICK ACTIONS & MODULE SHORTCUTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/employee/attendance">
          <Card className="p-5 hover:border-indigo-500/50 transition-all group cursor-pointer h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attendance Tracker</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Log shifts & review weekly hours</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>
          </Card>
        </Link>

        <Link href="/employee/leave">
          <Card className="p-5 hover:border-emerald-500/50 transition-all group cursor-pointer h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Apply For Leave</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Request time-off & check approval</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </div>
          </Card>
        </Link>

        <Link href="/employee/profile">
          <Card className="p-5 hover:border-purple-500/50 transition-all group cursor-pointer h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Profile & Payslips</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Manage contact & view records</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
            </div>
          </Card>
        </Link>
      </div>

      {/* TWO COLUMN SUMMARY: RECENT LEAVES & RECENT SHIFTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leave Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Recent Leave Requests</CardTitle>
              <CardDescription>Status of your recent time-off applications</CardDescription>
            </div>
            <Link href="/employee/leave">
              <Button variant="ghost" size="sm" className="text-xs text-indigo-600 dark:text-indigo-400">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentLeaves.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No recent leave requests. Click Apply For Leave to submit.
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
                {recentLeaves.map((req) => (
                  <div key={req.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white capitalize">
                          {req.leave_type} Leave ({req.total_days}d)
                        </span>
                        <Badge
                          variant={
                            req.status === 'approved'
                              ? 'success'
                              : req.status === 'rejected'
                              ? 'danger'
                              : 'warning'
                          }
                          className="capitalize text-[10px]"
                        >
                          {req.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {req.start_date} to {req.end_date} • &quot;{req.reason}&quot;
                      </p>
                    </div>

                    {req.review_comment && (
                      <span className="text-[10px] text-slate-400 italic max-w-[150px] truncate">
                        HR: {req.review_comment}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance Log */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Recent Attendance History</CardTitle>
              <CardDescription>Shift duration and punctuality records</CardDescription>
            </div>
            <Link href="/employee/attendance">
              <Button variant="ghost" size="sm" className="text-xs text-indigo-600 dark:text-indigo-400">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {userAttendance.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No attendance logs found for this account.
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
                {userAttendance.slice(0, 3).map((att) => (
                  <div key={att.id} className="pt-3 first:pt-0 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">
                        {format(parseISO(att.date), 'EEE, MMM d, yyyy')}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {att.check_in ? format(parseISO(att.check_in), 'hh:mm a') : '—'} -{' '}
                        {att.check_out ? format(parseISO(att.check_out), 'hh:mm a') : '...'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {att.work_hours} hrs
                      </span>
                      <Badge
                        variant={
                          att.status === 'present'
                            ? 'success'
                            : att.status === 'late'
                            ? 'warning'
                            : 'neutral'
                        }
                        className="text-[10px] capitalize"
                      >
                        {att.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
