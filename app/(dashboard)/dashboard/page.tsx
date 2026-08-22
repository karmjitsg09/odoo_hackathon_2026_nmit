'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import {
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Plus,
  Play,
  Square,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  Check,
  X,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DashboardPage() {
  const {
    currentRole,
    currentUser,
    profiles,
    todayAttendance,
    clockIn,
    clockOut,
    attendanceRecords,
    leaveRequests,
    leaveBalances,
    reviewLeaveRequest,
    payrollRecords,
    applyForLeave,
  } = useApp();

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'casual' as 'casual' | 'sick' | 'annual' | 'unpaid',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    total_days: 1,
    reason: '',
  });

  // Calculate live statistics
  const totalEmployees = profiles.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendanceList = attendanceRecords.filter((a) => a.date === todayStr);
  const presentCount = todayAttendanceList.filter((a) => a.status === 'present' || a.status === 'late').length;
  const onLeaveCount = leaveRequests.filter(
    (l) => l.status === 'approved' && l.start_date <= todayStr && l.end_date >= todayStr
  ).length;

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');
  const currentMonth = '2026-08';
  const totalPayrollExpense = payrollRecords
    .filter((p) => p.month === currentMonth)
    .reduce((acc, p) => acc + p.net_salary, 0);

  const userBalance = leaveBalances.find((b) => b.user_id === currentUser.id) || {
    casual_leave: 12,
    sick_leave: 10,
    annual_leave: 15,
  };

  const handleApplyLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) {
      toast.error('Please enter a reason for your leave request.');
      return;
    }
    applyForLeave(leaveForm);
    setIsLeaveModalOpen(false);
    setLeaveForm({
      leave_type: 'casual',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      total_days: 1,
      reason: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-transparent">
                {currentRole === 'admin' ? 'HR Administrator Control Center' : 'Employee Workspace'}
              </Badge>
              <span className="text-xs text-indigo-200">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser.full_name.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-indigo-200 max-w-xl">
              {currentRole === 'admin'
                ? `You have ${pendingLeaves.length} pending leave request(s) to review today.`
                : `Here is your current status, attendance log, and leave request balance.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsLeaveModalOpen(true)}
              className="bg-white text-indigo-950 hover:bg-indigo-50 shadow-md font-semibold text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" />
              Apply For Leave
            </Button>
            {currentRole === 'admin' && (
              <Link href="/analytics">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 text-xs sm:text-sm">
                  <TrendingUp className="w-4 h-4" />
                  View Reports
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Headcount
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalEmployees}</p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> Active Employees
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Present Today
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {presentCount} / {totalEmployees}
              </p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {Math.round((presentCount / (totalEmployees || 1)) * 100)}% Attendance Rate
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                On Leave Today
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{onLeaveCount}</p>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                {pendingLeaves.length} Pending Approval
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Monthly Payroll
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${totalPayrollExpense.toLocaleString()}
              </p>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                August 2026 Processed
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Punch Clock Widget & Dynamic Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Punch Clock Card */}
          <Card className="relative overflow-hidden border-indigo-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={todayAttendance?.check_in ? 'success' : 'neutral'}>
                    {todayAttendance?.check_in
                      ? todayAttendance.check_out
                        ? 'Checked Out'
                        : 'Checked In'
                      : 'Not Checked In'}
                  </Badge>
                  {todayAttendance?.status && (
                    <Badge
                      variant={
                        todayAttendance.status === 'late'
                          ? 'warning'
                          : todayAttendance.status === 'present'
                          ? 'success'
                          : 'danger'
                      }
                    >
                      {todayAttendance.status.toUpperCase()}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Daily Attendance Punch Clock
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {todayAttendance?.check_in
                    ? `Checked in at ${new Date(todayAttendance.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Record your daily shift entry to maintain attendance compliance.'}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {!todayAttendance?.check_in ? (
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => clockIn()}
                    className="w-full sm:w-auto glow-active font-semibold"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Check In Now
                  </Button>
                ) : !todayAttendance.check_out ? (
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={() => clockOut()}
                    className="w-full sm:w-auto font-semibold"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    Check Out
                  </Button>
                ) : (
                  <Button variant="outline" size="lg" disabled className="w-full sm:w-auto">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Shift Completed ({todayAttendance.work_hours} hrs)
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Pending Leaves Queue (For Admin) or Personal Leave Requests (For Employee) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">
                  {currentRole === 'admin' ? 'Pending Leave Approvals' : 'Your Leave Requests'}
                </CardTitle>
                <CardDescription>
                  {currentRole === 'admin'
                    ? 'Review and decide on submitted employee leave requests'
                    : 'Track your pending and past leave application status'}
                </CardDescription>
              </div>
              <Link href="/leave">
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  View All
                </Button>
              </Link>
            </CardHeader>

            <CardContent>
              {currentRole === 'admin' ? (
                pendingLeaves.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    🎉 All pending leave requests have been reviewed!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pendingLeaves.map((req) => (
                      <div key={req.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={req.user_avatar} name={req.user_name} size="md" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{req.user_name}</p>
                              <Badge variant="secondary" className="capitalize text-[10px]">
                                {req.leave_type} Leave
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {req.start_date} to {req.end_date} ({req.total_days} day(s)) • "{req.reason}"
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => reviewLeaveRequest(req.id, 'approved')}
                            className="h-8 px-2.5 text-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => reviewLeaveRequest(req.id, 'rejected')}
                            className="h-8 px-2.5 text-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {leaveRequests.filter((r) => r.user_id === currentUser.id).length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-500">
                      No leave requests filed yet.
                    </div>
                  ) : (
                    leaveRequests
                      .filter((r) => r.user_id === currentUser.id)
                      .slice(0, 4)
                      .map((req) => (
                        <div key={req.id} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold capitalize text-slate-900 dark:text-white">
                                {req.leave_type} Leave ({req.total_days} days)
                              </p>
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
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {req.start_date} to {req.end_date}
                            </p>
                          </div>
                          {req.review_comment && (
                            <span className="text-[11px] text-slate-400 italic max-w-xs truncate">
                              "{req.review_comment}"
                            </span>
                          )}
                        </div>
                      ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Leave Balances & Quick Directory Preview */}
        <div className="space-y-6">
          {/* Leave Balances Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Leave Allowances 2026</CardTitle>
              <CardDescription>Remaining leave entitlement for {currentUser.full_name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Casual Leave</p>
                  <p className="text-xs text-slate-400">12 Days Annual Allowance</p>
                </div>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {userBalance.casual_leave} days
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Sick Leave</p>
                  <p className="text-xs text-slate-400">10 Days Annual Allowance</p>
                </div>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {userBalance.sick_leave} days
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Annual Paid Leave</p>
                  <p className="text-xs text-slate-400">15 Days Annual Allowance</p>
                </div>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {userBalance.annual_leave} days
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Team Directory Spotlight */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Team Members</CardTitle>
              <Link href="/employees">
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Directory
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {profiles.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={p.avatar_url} name={p.full_name} size="sm" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{p.full_name}</p>
                      <p className="text-[10px] text-slate-500">{p.job_title}</p>
                    </div>
                  </div>
                  <Badge variant={p.role === 'admin' ? 'secondary' : 'neutral'} className="text-[10px]">
                    {p.department}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Apply For Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Apply For Leave"
        description="Submit a new leave application to HR for review."
      >
        <form onSubmit={handleApplyLeaveSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Leave Type</label>
            <select
              value={leaveForm.leave_type}
              onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value as any })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="annual">Annual Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Start Date</label>
              <input
                type="date"
                required
                value={leaveForm.start_date}
                onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">End Date</label>
              <input
                type="date"
                required
                value={leaveForm.end_date}
                onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Total Working Days</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              required
              value={leaveForm.total_days}
              onChange={(e) => setLeaveForm({ ...leaveForm, total_days: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Reason</label>
            <textarea
              rows={3}
              required
              placeholder="State your reason for leave..."
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsLeaveModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Leave Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
