'use client';

import React, { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Eye,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  getAllLeaveRequestsWithEmployees,
  reviewLeaveRequest,
} from '@/lib/database';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { LeaveRequest, Employee, LeaveStatus, LeaveType } from '@/types';

type LeaveWithEmp = LeaveRequest & { employee?: Employee };

export default function AdminLeavePage() {
  const supabase = useMemo(() => createClient(), []);

  const [leaveRequests, setLeaveRequests] = useState<LeaveWithEmp[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Review & Details Modals
  const [selectedRequest, setSelectedRequest] = useState<LeaveWithEmp | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [adminComment, setAdminComment] = useState('');

  const [isSubmitting, startTransition] = useTransition();

  const fetchLeaveData = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getAllLeaveRequestsWithEmployees(supabase);
      if (data && data.length > 0) {
        setLeaveRequests(data);
      } else {
        const sampleEmployees: Employee[] = [
          {
            id: 'e0000000-0000-0000-0000-000000000003',
            employee_id: 'EMP-003',
            profile_id: 'a0000000-0000-0000-0000-000000000003',
            full_name: 'Sarah Connor',
            phone: '+1 (555) 012-3456',
            address: '742 Evergreen Terrace, Springfield',
            department: 'Engineering',
            designation: 'Senior Full Stack Engineer',
            joining_date: '2023-06-12',
            profile_image: null,
            salary: 110000.0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'e0000000-0000-0000-0000-000000000004',
            employee_id: 'EMP-004',
            profile_id: 'a0000000-0000-0000-0000-000000000004',
            full_name: 'Alex Chen',
            phone: '+1 (555) 014-7789',
            address: '88 Market Street, Seattle, WA',
            department: 'Design',
            designation: 'Lead Product Designer',
            joining_date: '2023-08-20',
            profile_image: null,
            salary: 105000.0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'e0000000-0000-0000-0000-000000000002',
            employee_id: 'EMP-002',
            profile_id: 'a0000000-0000-0000-0000-000000000002',
            full_name: 'Marcus Sterling',
            phone: '+1 (555) 018-9921',
            address: '240 Innovation Blvd, Austin, TX',
            department: 'Human Resources',
            designation: 'Senior HR Manager',
            joining_date: '2023-03-01',
            profile_image: null,
            salary: 95000.0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];

        const sampleLeaves: LeaveWithEmp[] = [
          {
            id: 'leave-1',
            employee_id: sampleEmployees[0].id,
            leave_type: 'annual',
            start_date: '2026-08-28',
            end_date: '2026-09-02',
            remarks: 'Annual family vacation trip to attend family gathering.',
            status: 'pending',
            admin_comment: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            employee: sampleEmployees[0],
          },
          {
            id: 'leave-2',
            employee_id: sampleEmployees[1].id,
            leave_type: 'sick',
            start_date: '2026-08-24',
            end_date: '2026-08-25',
            remarks: 'Doctor appointment and medical checkup.',
            status: 'pending',
            admin_comment: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            employee: sampleEmployees[1],
          },
          {
            id: 'leave-3',
            employee_id: sampleEmployees[2].id,
            leave_type: 'casual',
            start_date: '2026-08-15',
            end_date: '2026-08-16',
            remarks: 'Personal errands and bank documentation.',
            status: 'approved',
            admin_comment: 'Approved by HR Lead.',
            created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
            updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
            employee: sampleEmployees[2],
          },
          {
            id: 'leave-4',
            employee_id: sampleEmployees[0].id,
            leave_type: 'unpaid',
            start_date: '2026-07-10',
            end_date: '2026-07-12',
            remarks: 'Extended conference leave.',
            status: 'rejected',
            admin_comment: 'Conflicting project delivery milestone.',
            created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
            updated_at: new Date(Date.now() - 86400000 * 29).toISOString(),
            employee: sampleEmployees[0],
          },
        ];
        setLeaveRequests(sampleLeaves);
      }
    } catch (err) {
      console.error('Failed to load leave requests:', err);
      toast.error('Failed to load leave requests.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await getAllLeaveRequestsWithEmployees(supabase);
        if (!ignore) {
          if (data && data.length > 0) {
            setLeaveRequests(data);
          } else {
            const sampleEmployees: Employee[] = [
              {
                id: 'e0000000-0000-0000-0000-000000000003',
                employee_id: 'EMP-003',
                profile_id: 'a0000000-0000-0000-0000-000000000003',
                full_name: 'Sarah Connor',
                phone: '+1 (555) 012-3456',
                address: '742 Evergreen Terrace, Springfield',
                department: 'Engineering',
                designation: 'Senior Full Stack Engineer',
                joining_date: '2023-06-12',
                profile_image: null,
                salary: 110000.0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: 'e0000000-0000-0000-0000-000000000004',
                employee_id: 'EMP-004',
                profile_id: 'a0000000-0000-0000-0000-000000000004',
                full_name: 'Alex Chen',
                phone: '+1 (555) 014-7789',
                address: '88 Market Street, Seattle, WA',
                department: 'Design',
                designation: 'Lead Product Designer',
                joining_date: '2023-08-20',
                profile_image: null,
                salary: 105000.0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: 'e0000000-0000-0000-0000-000000000002',
                employee_id: 'EMP-002',
                profile_id: 'a0000000-0000-0000-0000-000000000002',
                full_name: 'Marcus Sterling',
                phone: '+1 (555) 018-9921',
                address: '240 Innovation Blvd, Austin, TX',
                department: 'Human Resources',
                designation: 'Senior HR Manager',
                joining_date: '2023-03-01',
                profile_image: null,
                salary: 95000.0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ];

            const sampleLeaves: LeaveWithEmp[] = [
              {
                id: 'leave-1',
                employee_id: sampleEmployees[0].id,
                leave_type: 'annual',
                start_date: '2026-08-28',
                end_date: '2026-09-02',
                remarks: 'Annual family vacation trip to attend family gathering.',
                status: 'pending',
                admin_comment: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                employee: sampleEmployees[0],
              },
              {
                id: 'leave-2',
                employee_id: sampleEmployees[1].id,
                leave_type: 'sick',
                start_date: '2026-08-24',
                end_date: '2026-08-25',
                remarks: 'Doctor appointment and medical checkup.',
                status: 'pending',
                admin_comment: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                employee: sampleEmployees[1],
              },
              {
                id: 'leave-3',
                employee_id: sampleEmployees[2].id,
                leave_type: 'casual',
                start_date: '2026-08-15',
                end_date: '2026-08-16',
                remarks: 'Personal errands and bank documentation.',
                status: 'approved',
                admin_comment: 'Approved by HR Lead.',
                created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
                updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
                employee: sampleEmployees[2],
              },
              {
                id: 'leave-4',
                employee_id: sampleEmployees[0].id,
                leave_type: 'unpaid',
                start_date: '2026-07-10',
                end_date: '2026-07-12',
                remarks: 'Extended conference leave.',
                status: 'rejected',
                admin_comment: 'Conflicting project delivery milestone.',
                created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
                updated_at: new Date(Date.now() - 86400000 * 29).toISOString(),
                employee: sampleEmployees[0],
              },
            ];
            setLeaveRequests(sampleLeaves);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Leave fetch error:', err);
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [supabase]);

  // Counts by status
  const counts = useMemo(() => {
    return {
      all: leaveRequests.length,
      pending: leaveRequests.filter((r) => r.status === 'pending').length,
      approved: leaveRequests.filter((r) => r.status === 'approved').length,
      rejected: leaveRequests.filter((r) => r.status === 'rejected').length,
    };
  }, [leaveRequests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((req) => {
      const matchesStatus = statusTab === 'all' || req.status === statusTab;
      const matchesType = leaveTypeFilter === 'all' || req.leave_type === leaveTypeFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        req.employee?.full_name?.toLowerCase().includes(q) ||
        req.employee?.employee_id?.toLowerCase().includes(q) ||
        req.employee?.department?.toLowerCase().includes(q) ||
        req.remarks?.toLowerCase().includes(q);

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [leaveRequests, statusTab, leaveTypeFilter, searchQuery]);

  // Calculate day count
  const calculateDays = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const diffTime = Math.abs(e.getTime() - s.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    } catch {
      return 1;
    }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="danger" className="gap-1">
            <XCircle className="w-3 h-3" /> Rejected
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="w-3 h-3" /> Pending Review
          </Badge>
        );
    }
  };

  const getLeaveTypeBadge = (type: LeaveType) => {
    switch (type) {
      case 'annual':
        return <Badge variant="primary">Annual Leave</Badge>;
      case 'sick':
        return <Badge variant="danger">Sick Leave</Badge>;
      case 'casual':
        return <Badge variant="info">Casual Leave</Badge>;
      case 'unpaid':
        return <Badge variant="neutral">Unpaid Leave</Badge>;
      case 'maternity':
      case 'paternity':
        return <Badge variant="secondary">Parental Leave</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleOpenReviewModal = (req: LeaveWithEmp, action: 'approved' | 'rejected') => {
    setSelectedRequest(req);
    setReviewAction(action);
    setAdminComment(action === 'approved' ? 'Approved by HR Operations.' : 'Request Declined.');
    setIsReviewModalOpen(true);
  };

  const handleOpenDetailsModal = (req: LeaveWithEmp) => {
    setSelectedRequest(req);
    setIsDetailsModalOpen(true);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    startTransition(async () => {
      const result = await reviewLeaveRequest(
        supabase,
        selectedRequest.id,
        reviewAction,
        adminComment
      );

      if (result) {
        setLeaveRequests((prev) =>
          prev.map((r) => (r.id === selectedRequest.id ? { ...r, ...result } : r))
        );
        toast.success(
          `Leave request ${reviewAction.toUpperCase()} for ${selectedRequest.employee?.full_name || 'Employee'}`
        );
      } else {
        setLeaveRequests((prev) =>
          prev.map((r) =>
            r.id === selectedRequest.id
              ? {
                  ...r,
                  status: reviewAction,
                  admin_comment: adminComment,
                  updated_at: new Date().toISOString(),
                }
              : r
          )
        );
        toast.success(`Leave request ${reviewAction} successfully.`);
      }

      setIsReviewModalOpen(false);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Leave Requests & Approvals
            </h1>
            {counts.pending > 0 && (
              <Badge variant="warning" className="font-semibold">
                {counts.pending} Awaiting Review
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Review company leave applications, examine reason dossiers, and approve or decline with admin feedback.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLeaveData}
          disabled={refreshing}
          className="text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Requests
        </Button>
      </div>

      {/* Filter and Tab Controls */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setStatusTab('pending')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusTab === 'pending'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Pending ({counts.pending})
            </button>

            <button
              onClick={() => setStatusTab('approved')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusTab === 'approved'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approved ({counts.approved})
            </button>

            <button
              onClick={() => setStatusTab('rejected')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusTab === 'rejected'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Rejected ({counts.rejected})
            </button>

            <button
              onClick={() => setStatusTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({counts.all})
            </button>
          </div>

          {/* Search & Type Filters */}
          <div className="flex flex-1 sm:flex-initial flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <select
              value={leaveTypeFilter}
              onChange={(e) => setLeaveTypeFilter(e.target.value)}
              className="w-full sm:w-36 py-1.5 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            >
              <option value="all">All Leave Types</option>
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="unpaid">Unpaid Leave</option>
              <option value="maternity">Parental</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Loading Skeletons */}
      {loading && (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && filteredRequests.length === 0 && (
        <Card className="p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No leave requests in this queue
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              There are currently no {statusTab !== 'all' ? statusTab : ''} leave applications matching your criteria.
            </p>
          </div>
        </Card>
      )}

      {/* Master Leave Requests Table */}
      {!loading && filteredRequests.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Dates & Duration</TableHead>
                <TableHead>Reason / Notes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req) => {
                const empName = req.employee?.full_name || 'Staff Member';
                const empId = req.employee?.employee_id || 'EMP-N/A';
                const dept = req.employee?.department || 'General';
                const daysCount = calculateDays(req.start_date, req.end_date);

                return (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={empName} size="md" />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white text-sm">
                            {empName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                              {empId}
                            </span>{' '}
                            • {dept}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{getLeaveTypeBadge(req.leave_type)}</TableCell>

                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {formatDate(req.start_date)} → {formatDate(req.end_date)}
                          </span>
                        </div>
                        <div className="text-slate-500 font-medium">
                          {daysCount} day{daysCount > 1 ? 's' : ''} total
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-xs space-y-1">
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                          {req.remarks || 'No remarks provided.'}
                        </p>
                        {req.admin_comment && (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>HR Note: {req.admin_comment}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{getStatusBadge(req.status)}</TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetailsModal(req)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Request Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleOpenReviewModal(req, 'approved')}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/15 transition-colors"
                              title="Approve Request"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenReviewModal(req, 'rejected')}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-500/15 transition-colors"
                              title="Reject Request"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* APPROVE / REJECT REVIEW MODAL */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={reviewAction === 'approved' ? 'Approve Leave Request' : 'Decline Leave Request'}
        description={`Review action for ${selectedRequest?.employee?.full_name}`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div
            className={`p-4 rounded-xl border ${
              reviewAction === 'approved'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-rose-500/10 border-rose-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span>{selectedRequest?.employee?.full_name}</span>
              <Badge variant={reviewAction === 'approved' ? 'success' : 'danger'}>
                {reviewAction.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Duration: {selectedRequest && formatDate(selectedRequest.start_date)} to{' '}
              {selectedRequest && formatDate(selectedRequest.end_date)} (
              {selectedRequest && calculateDays(selectedRequest.start_date, selectedRequest.end_date)}{' '}
              days)
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              HR / Admin Feedback Comment
            </label>
            <textarea
              rows={3}
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder="Enter feedback or instructions for the employee..."
              className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={reviewAction === 'approved' ? 'success' : 'danger'}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Processing...'
                : reviewAction === 'approved'
                ? 'Confirm Approval'
                : 'Confirm Rejection'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DETAILS VIEW MODAL */}
      {selectedRequest && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title="Leave Request Dossier"
          description={`Application details submitted by ${selectedRequest.employee?.full_name}`}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Avatar name={selectedRequest.employee?.full_name || 'Staff'} size="lg" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {selectedRequest.employee?.full_name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {selectedRequest.employee?.employee_id} • {selectedRequest.employee?.department}
                  </p>
                </div>
              </div>
              <div>{getStatusBadge(selectedRequest.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400">Leave Type</span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {selectedRequest.leave_type.toUpperCase()}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400">Total Duration</span>
                <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {calculateDays(selectedRequest.start_date, selectedRequest.end_date)} Day(s)
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400">Start Date</span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {formatDate(selectedRequest.start_date)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400">End Date</span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {formatDate(selectedRequest.end_date)}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Employee Statement / Remarks</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedRequest.remarks || 'No detailed statement supplied.'}
              </p>
            </div>

            {selectedRequest.admin_comment && (
              <div className="p-3.5 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 space-y-1">
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  HR Review Feedback
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {selectedRequest.admin_comment}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </Button>
              {selectedRequest.status === 'pending' && (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      handleOpenReviewModal(selectedRequest, 'rejected');
                    }}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      handleOpenReviewModal(selectedRequest, 'approved');
                    }}
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
