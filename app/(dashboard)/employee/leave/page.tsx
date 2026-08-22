'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  CalendarCheck,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
  CalendarDays,
} from 'lucide-react';
import { format, differenceInCalendarDays, parseISO } from 'date-fns';
import { toast } from 'sonner';

export default function EmployeeLeavePage() {
  const {
    leaveRequests,
    leaveBalances,
    currentUser,
    applyForLeave,
  } = useApp();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    leave_type: 'casual' as 'casual' | 'sick' | 'annual' | 'unpaid',
    start_date: todayStr,
    end_date: todayStr,
    reason: '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Employee only sees their own requests
  const userRequests = leaveRequests.filter((req) => req.user_id === currentUser.id);

  // Filtered requests
  const filteredRequests = userRequests.filter((req) => {
    const isStatusMatch = filterStatus === 'All' || req.status === filterStatus.toLowerCase();
    return isStatusMatch;
  });

  // User leave balance
  const userBalance = leaveBalances.find((b) => b.user_id === currentUser.id) || {
    casual_leave: 12,
    sick_leave: 10,
    annual_leave: 15,
  };

  const totalRemainingDays =
    (userBalance.casual_leave || 0) +
    (userBalance.sick_leave || 0) +
    (userBalance.annual_leave || 0);

  // Dynamic calculated duration in days
  const calculatedDays =
    form.start_date && form.end_date && new Date(form.end_date) >= new Date(form.start_date)
      ? differenceInCalendarDays(new Date(form.end_date), new Date(form.start_date)) + 1
      : 1;

  // Handle form change with instant validation
  const handleStartDateChange = (val: string) => {
    setForm((prev) => {
      const next = { ...prev, start_date: val };
      if (next.end_date && new Date(next.end_date) < new Date(val)) {
        next.end_date = val; // auto-adjust end date
      }
      return next;
    });
    setValidationError(null);
  };

  const handleEndDateChange = (val: string) => {
    setForm((prev) => ({ ...prev, end_date: val }));
    if (form.start_date && new Date(val) < new Date(form.start_date)) {
      setValidationError('End date cannot be earlier than start date.');
    } else {
      setValidationError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.start_date) {
      setValidationError('Start date is required.');
      toast.error('Start date is required.');
      return;
    }
    if (!form.end_date) {
      setValidationError('End date is required.');
      toast.error('End date is required.');
      return;
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      setValidationError('End date cannot be earlier than start date.');
      toast.error('End date cannot be earlier than start date.');
      return;
    }
    if (!form.reason.trim()) {
      setValidationError('Please specify a detailed reason for leave.');
      toast.error('Please specify a reason for leave.');
      return;
    }

    // Check for overlapping requests
    const newStart = new Date(form.start_date).getTime();
    const newEnd = new Date(form.end_date).getTime();
    const hasOverlap = userRequests.some((req) => {
      if (req.status === 'rejected') return false;
      const reqStart = new Date(req.start_date).getTime();
      const reqEnd = new Date(req.end_date).getTime();
      return newStart <= reqEnd && newEnd >= reqStart;
    });

    if (hasOverlap) {
      setValidationError(
        'You already have an active or pending leave request that overlaps with these dates.'
      );
      toast.error('Overlapping leave request detected.');
      return;
    }

    setIsSubmitting(true);
    try {
      applyForLeave({
        leave_type: form.leave_type,
        start_date: form.start_date,
        end_date: form.end_date,
        total_days: calculatedDays,
        reason: form.reason.trim(),
      });

      setIsApplyModalOpen(false);
      setForm({
        leave_type: 'casual',
        start_date: todayStr,
        end_date: todayStr,
        reason: '',
      });
      setValidationError(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="danger" className="gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="w-3 h-3 animate-pulse" />
            Pending HR Review
          </Badge>
        );
    }
  };

  const getLeaveTypeBadge = (type: string) => {
    switch (type) {
      case 'annual':
        return <Badge variant="secondary">Annual Paid Leave</Badge>;
      case 'sick':
        return <Badge variant="info">Medical / Sick Leave</Badge>;
      case 'casual':
        return <Badge variant="neutral">Casual Leave</Badge>;
      case 'unpaid':
        return <Badge variant="warning">Unpaid Leave</Badge>;
      default:
        return <Badge variant="neutral">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              My Leave & Time-Off Requests
            </h1>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Employee Portal
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Apply for paid, sick, or casual leave, track approval statuses, and manage your remaining quota.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setValidationError(null);
            setIsApplyModalOpen(true);
          }}
          className="font-semibold text-xs sm:text-sm shadow-md shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Apply For Leave
        </Button>
      </div>

      {/* LEAVE BALANCE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Casual Leave
              </p>
              <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                {userBalance.casual_leave}{' '}
                <span className="text-xs font-normal text-slate-400">/ 12 days left</span>
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, ((userBalance.casual_leave || 0) / 12) * 100)}%` }}
                />
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sick / Medical
              </p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {userBalance.sick_leave}{' '}
                <span className="text-xs font-normal text-slate-400">/ 10 days left</span>
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, ((userBalance.sick_leave || 0) / 10) * 100)}%` }}
                />
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Annual Paid Leave
              </p>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                {userBalance.annual_leave}{' '}
                <span className="text-xs font-normal text-slate-400">/ 15 days left</span>
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, ((userBalance.annual_leave || 0) / 15) * 100)}%` }}
                />
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-sky-500/30 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Available
              </p>
              <p className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">
                {totalRemainingDays}{' '}
                <span className="text-xs font-normal text-slate-400">/ 37 Total</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-2">Annual allocation pool</p>
            </div>
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* LEAVE APPLICATION HISTORY TABLE */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-base">My Leave Request Log</CardTitle>
            <CardDescription>
              Track approval progress and view HR comments on your submitted applications
            </CardDescription>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-500">Filter Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="All">All Requests</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Date Range</th>
                  <th className="py-3 px-4">Total Days</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">HR Feedback / Admin Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      No leave requests found. Click &quot;Apply For Leave&quot; to submit a new application.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">{getLeaveTypeBadge(req.leave_type)}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                          <span>
                            {format(parseISO(req.start_date), 'MMM d')} –{' '}
                            {format(parseISO(req.end_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {req.total_days} {req.total_days === 1 ? 'day' : 'days'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        &quot;{req.reason}&quot;
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(req.status)}</td>
                      <td className="py-3.5 px-4">
                        {req.review_comment ? (
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="italic">{req.review_comment}</span>
                          </div>
                        ) : req.status === 'pending' ? (
                          <span className="text-slate-400 italic text-[11px]">
                            Awaiting HR Officer assignment
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* APPLY FOR LEAVE MODAL DIALOG */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply For Leave"
        description="Submit your time-off request to the HR Department for approval."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Leave Type Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Leave Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.leave_type}
              onChange={(e) =>
                setForm({
                  ...form,
                  leave_type: e.target.value as 'casual' | 'sick' | 'annual' | 'unpaid',
                })
              }
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="casual">
                Casual Leave ({userBalance.casual_leave || 0} days remaining)
              </option>
              <option value="sick">
                Sick / Medical Leave ({userBalance.sick_leave || 0} days remaining)
              </option>
              <option value="annual">
                Annual Paid Leave ({userBalance.annual_leave || 0} days remaining)
              </option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={form.end_date}
                min={form.start_date}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Total Days Indicator */}
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs">
            <span className="text-indigo-900 dark:text-indigo-300 font-medium">
              Requested Time-Off Duration:
            </span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
              {calculatedDays} {calculatedDays === 1 ? 'Working Day' : 'Working Days'}
            </span>
          </div>

          {/* Reason / Remarks Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Reason / Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Please explain the purpose of your leave request (e.g. personal family event, medical rest)..."
              value={form.reason}
              onChange={(e) => {
                setForm({ ...form, reason: e.target.value });
                setValidationError(null);
              }}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsApplyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="shadow-md shadow-indigo-500/20 font-semibold"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
