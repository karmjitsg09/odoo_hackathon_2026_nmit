'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { CalendarCheck, Plus, Check, X, Clock, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LeavePage() {
  const {
    leaveRequests,
    leaveBalances,
    currentUser,
    currentRole,
    applyForLeave,
    reviewLeaveRequest,
  } = useApp();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [reviewCommentMap, setReviewCommentMap] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    leave_type: 'casual' as 'casual' | 'sick' | 'annual' | 'unpaid',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    total_days: 1,
    reason: '',
  });

  const userBalance = leaveBalances.find((b) => b.user_id === currentUser.id) || {
    casual_leave: 12,
    sick_leave: 10,
    annual_leave: 15,
  };

  const filteredRequests = leaveRequests.filter((req) => {
    const isRoleMatch = currentRole === 'admin' ? true : req.user_id === currentUser.id;
    const isStatusMatch = filterStatus === 'All' || req.status === filterStatus.toLowerCase();
    return isRoleMatch && isStatusMatch;
  });

  const pendingQueue = leaveRequests.filter((r) => r.status === 'pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reason.trim()) {
      toast.error('Please specify a reason for leave.');
      return;
    }
    applyForLeave(form);
    setIsApplyModalOpen(false);
    setForm({
      leave_type: 'casual',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      total_days: 1,
      reason: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Leave Management & Approvals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {currentRole === 'admin'
              ? 'Review pending leave applications and manage organization leave balances'
              : 'Apply for time off, view approval status, and monitor leave balances'}
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsApplyModalOpen(true)} className="font-semibold text-xs sm:text-sm">
          <Plus className="w-4 h-4" />
          Apply For Leave
        </Button>
      </div>

      {/* Leave Balance Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-indigo-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Casual Leave Balance</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {userBalance.casual_leave} <span className="text-xs font-normal text-slate-400">/ 12 Days</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Sick Leave Balance</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {userBalance.sick_leave} <span className="text-xs font-normal text-slate-400">/ 10 Days</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Annual Paid Leave</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {userBalance.annual_leave} <span className="text-xs font-normal text-slate-400">/ 15 Days</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Admin Approval Queue Section (Shown prominently for HR Admins) */}
      {currentRole === 'admin' && (
        <Card className="border-amber-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Pending HR Approval Queue</CardTitle>
                <Badge variant="warning">{pendingQueue.length} Action Required</Badge>
              </div>
              <CardDescription>Requests awaiting HR review and balance verification</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {pendingQueue.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-500">
                🎉 No pending requests in queue! All leave applications are up to date.
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                {pendingQueue.map((req) => (
                  <div key={req.id} className="pt-4 first:pt-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Avatar src={req.user_avatar} name={req.user_name} size="md" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{req.user_name}</span>
                          <Badge variant="secondary" className="capitalize text-[10px]">
                            {req.leave_type} Leave ({req.total_days} days)
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-slate-900 dark:text-white">Dates:</span> {req.start_date} to {req.end_date}
                        </p>
                        <p className="text-xs text-slate-500 italic">"{req.reason}"</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto self-end md:self-center">
                      <input
                        type="text"
                        placeholder="Optional comment..."
                        value={reviewCommentMap[req.id] || ''}
                        onChange={(e) =>
                          setReviewCommentMap({ ...reviewCommentMap, [req.id]: e.target.value })
                        }
                        className="w-full sm:w-48 px-2.5 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => reviewLeaveRequest(req.id, 'approved', reviewCommentMap[req.id])}
                          className="flex-1 sm:flex-none text-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => reviewLeaveRequest(req.id, 'rejected', reviewCommentMap[req.id])}
                          className="flex-1 sm:flex-none text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Leave Request Log Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-base">
              {currentRole === 'admin' ? 'All Organization Leave Requests' : 'Your Leave Application History'}
            </CardTitle>
            <CardDescription>Filterable history log</CardDescription>
          </div>

          <div className="flex items-center gap-2">
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
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                  {currentRole === 'admin' && <th className="py-3 px-4">Employee</th>}
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Total Days</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">HR Reviewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      {currentRole === 'admin' && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar src={req.user_avatar} name={req.user_name} size="sm" />
                            <span className="font-semibold text-slate-900 dark:text-white">{req.user_name}</span>
                          </div>
                        </td>
                      )}
                      <td className="py-3 px-4 font-semibold capitalize">{req.leave_type} Leave</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {req.start_date} to {req.end_date}
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">{req.total_days}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{req.reason}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            req.status === 'approved'
                              ? 'success'
                              : req.status === 'rejected'
                              ? 'danger'
                              : 'warning'
                          }
                          className="capitalize"
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {req.reviewed_by_name ? req.reviewed_by_name : req.status === 'pending' ? 'Pending HR' : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Leave Application"
        description="Apply for casual, sick, or annual leave allowance."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Leave Type</label>
            <select
              value={form.leave_type}
              onChange={(e) => setForm({ ...form, leave_type: e.target.value as any })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="casual">Casual Leave ({userBalance.casual_leave} days remaining)</option>
              <option value="sick">Sick Leave ({userBalance.sick_leave} days remaining)</option>
              <option value="annual">Annual Leave ({userBalance.annual_leave} days remaining)</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Start Date</label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">End Date</label>
              <input
                type="date"
                required
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
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
              value={form.total_days}
              onChange={(e) => setForm({ ...form, total_days: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Reason</label>
            <textarea
              rows={3}
              required
              placeholder="State reason for leave request..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
