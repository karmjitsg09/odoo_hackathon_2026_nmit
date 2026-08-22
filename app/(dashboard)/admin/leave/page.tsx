'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  Check,
  X,
  Search,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Building2,
  ShieldAlert,
  FileCheck,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

export default function AdminLeavePage() {
  const {
    leaveRequests,
    leaveBalances,
    profiles,
    currentRole,
    setRole,
    reviewLeaveRequest,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [reviewCommentMap, setReviewCommentMap] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Authorization Guard: Non-admins blocked
  if (currentRole !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-rose-500/30 bg-rose-500/5">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            HR Admin Privileges Required
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
            You are currently in <strong>Employee</strong> mode. Leave approvals and company-wide requests are reserved for HR Officers and Administrators.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => setRole('admin')}
              className="font-semibold text-xs"
            >
              Switch to Admin Role
            </Button>
            <Link href="/employee/leave">
              <Button variant="outline" className="w-full font-semibold text-xs">
                Back to My Leave
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Enrich requests with employee profile details
  const enrichedRequests = leaveRequests.map((req) => {
    const profile = profiles.find((p) => p.id === req.user_id);
    const balance = leaveBalances.find((b) => b.user_id === req.user_id);
    return {
      ...req,
      user_name: req.user_name || profile?.full_name || 'Employee',
      user_avatar: req.user_avatar || profile?.avatar_url,
      user_department: req.user_department || profile?.department || 'General',
      user_job_title: profile?.job_title || 'Staff',
      user_email: profile?.email || '',
      user_balance: balance || { casual_leave: 12, sick_leave: 10, annual_leave: 15 },
    };
  });

  // Pending queue
  const pendingQueue = enrichedRequests.filter((r) => r.status === 'pending');

  // Filtered requests for history log
  const filteredRequests = enrichedRequests.filter((req) => {
    const matchesSearch =
      !searchTerm ||
      req.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.user_department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEmployee = selectedEmployeeId === 'All' || req.user_id === selectedEmployeeId;
    const matchesStatus = filterStatus === 'All' || req.status === filterStatus.toLowerCase();
    const matchesType = filterType === 'All' || req.leave_type === filterType.toLowerCase();

    return matchesSearch && matchesEmployee && matchesStatus && matchesType;
  });

  // Metrics
  const totalRequests = enrichedRequests.length;
  const totalApproved = enrichedRequests.filter((r) => r.status === 'approved').length;
  const totalRejected = enrichedRequests.filter((r) => r.status === 'rejected').length;

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const comment = reviewCommentMap[id] || (status === 'approved' ? 'Approved by HR' : 'Declined by HR');
      reviewLeaveRequest(id, status, comment);
      setReviewCommentMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } finally {
      setProcessingId(null);
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
            Pending Action
          </Badge>
        );
    }
  };

  const getLeaveTypeBadge = (type: string) => {
    switch (type) {
      case 'annual':
        return <Badge variant="secondary">Annual Paid</Badge>;
      case 'sick':
        return <Badge variant="info">Sick Leave</Badge>;
      case 'casual':
        return <Badge variant="neutral">Casual</Badge>;
      case 'unpaid':
        return <Badge variant="warning">Unpaid</Badge>;
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
              Leave Applications & Approval Hub
            </h1>
            <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              Admin & HR Access
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review time-off requests, check employee quota balances, and record approval feedback.
          </p>
        </div>
      </div>

      {/* SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pending Approval Queue
              </p>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {pendingQueue.length}{' '}
                <span className="text-xs font-normal text-slate-400">requests</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
          </div>
        </Card>

        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Approved Leaves
              </p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {totalApproved}{' '}
                <span className="text-xs font-normal text-slate-400">approved</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-rose-500/30 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Declined Requests
              </p>
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {totalRejected}{' '}
                <span className="text-xs font-normal text-slate-400">rejected</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Submissions
              </p>
              <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                {totalRequests}{' '}
                <span className="text-xs font-normal text-slate-400">applications</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* PROMINENT PENDING APPROVAL QUEUE */}
      <Card className="border-amber-500/40 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <div className="flex items-center gap-2.5">
              <CardTitle className="text-base">Pending HR Review & Approval Queue</CardTitle>
              <Badge variant="warning">
                {pendingQueue.length} Action{pendingQueue.length === 1 ? '' : 's'} Required
              </Badge>
            </div>
            <CardDescription>
              Carefully inspect employee remarks and quota balance before granting approval
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {pendingQueue.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                All leave requests are up to date!
              </p>
              <p className="text-xs text-slate-400">
                New leave applications submitted by employees will appear in this action queue.
              </p>
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
              {pendingQueue.map((req) => (
                <div
                  key={req.id}
                  className="pt-4 first:pt-0 flex flex-col xl:flex-row xl:items-center justify-between gap-6"
                >
                  {/* Left: Employee details & request info */}
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar
                      src={req.user_avatar}
                      name={req.user_name}
                      size="lg"
                      className="shrink-0 mt-0.5"
                    />

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {req.user_name}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {req.user_department}
                        </span>
                        {getLeaveTypeBadge(req.leave_type)}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>
                            {format(parseISO(req.start_date), 'MMM d, yyyy')} –{' '}
                            {format(parseISO(req.end_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {req.total_days} {req.total_days === 1 ? 'Day' : 'Days'} Total
                        </span>
                      </div>

                      {/* Reason */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 italic">
                        &quot;{req.reason}&quot;
                      </p>

                      {/* Balance preview */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span>Available Balance:</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          Casual: <strong>{req.user_balance.casual_leave}d</strong>
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">
                          Sick: <strong>{req.user_balance.sick_leave}d</strong>
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">
                          Annual: <strong>{req.user_balance.annual_leave}d</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Comment & Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 xl:w-auto w-full">
                    <input
                      type="text"
                      placeholder="Add HR remarks or comment..."
                      value={reviewCommentMap[req.id] || ''}
                      onChange={(e) =>
                        setReviewCommentMap({ ...reviewCommentMap, [req.id]: e.target.value })
                      }
                      className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-64"
                    />

                    <div className="flex items-center gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        disabled={processingId === req.id}
                        onClick={() => handleReview(req.id, 'approved')}
                        className="flex-1 sm:flex-none font-bold text-xs shadow-md shadow-emerald-500/20"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={processingId === req.id}
                        onClick={() => handleReview(req.id, 'rejected')}
                        className="flex-1 sm:flex-none font-bold text-xs shadow-md shadow-rose-500/20"
                      >
                        <X className="w-4 h-4" />
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

      {/* ALL ORGANIZATION LEAVE REQUESTS TABLE */}
      <Card>
        <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-base">Complete Leave Directory</CardTitle>
            <CardDescription>
              Filter and inspect all historical leave requests and HR feedback across the company
            </CardDescription>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[180px]">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff, dept, reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filter by Employee */}
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="All">All Staff Members</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>

            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="All">All Categories</option>
              <option value="Casual">Casual</option>
              <option value="Sick">Sick</option>
              <option value="Annual">Annual Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {(searchTerm || selectedEmployeeId !== 'All' || filterType !== 'All' || filterStatus !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedEmployeeId('All');
                  setFilterType('All');
                  setFilterStatus('All');
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
              >
                Reset
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Total Days</th>
                  <th className="py-3 px-4">Employee Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reviewer / Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      No matching leave records found.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Employee */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={req.user_avatar}
                            name={req.user_name}
                            size="sm"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {req.user_name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {req.user_job_title}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                          {req.user_department}
                        </span>
                      </td>

                      {/* Leave Type */}
                      <td className="py-3.5 px-4">{getLeaveTypeBadge(req.leave_type)}</td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        {format(parseISO(req.start_date), 'MMM d')} –{' '}
                        {format(parseISO(req.end_date), 'MMM d, yyyy')}
                      </td>

                      {/* Total Days */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {req.total_days} {req.total_days === 1 ? 'day' : 'days'}
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        &quot;{req.reason}&quot;
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(req.status)}</td>

                      {/* Reviewer / Feedback */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {req.review_comment ? (
                          <div>
                            <p className="text-slate-800 dark:text-slate-200 font-medium italic">
                              &quot;{req.review_comment}&quot;
                            </p>
                            {req.reviewed_by_name && (
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Reviewed by: {req.reviewed_by_name}
                              </p>
                            )}
                          </div>
                        ) : req.status === 'pending' ? (
                          <span className="text-amber-500 font-medium italic text-[11px]">
                            Pending Action
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
    </div>
  );
}
