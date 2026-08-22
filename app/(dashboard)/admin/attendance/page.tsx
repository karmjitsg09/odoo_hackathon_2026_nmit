'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserX,
  ShieldAlert,
  Download,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

export default function AdminAttendancePage() {
  const {
    attendanceRecords,
    profiles,
    currentRole,
    setRole,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');

  // Authorization Guard: Prevent non-admin access
  if (currentRole !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-rose-500/30 bg-rose-500/5">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Admin Privileges Required
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
            You are currently accessing Dayflow in <strong>Employee</strong> mode. This organization attendance directory is strictly restricted to HR Officers & Administrators.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => setRole('admin')}
              className="font-semibold text-xs"
            >
              Switch to Admin Role
            </Button>
            <Link href="/employee/attendance">
              <Button variant="outline" className="w-full font-semibold text-xs">
                Back to My Attendance
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Unique departments for filter
  const departments = Array.from(new Set(profiles.map((p) => p.department).filter(Boolean)));

  // Join attendance records with employee profiles if missing avatar/name
  const enrichedRecords = attendanceRecords.map((rec) => {
    const profile = profiles.find((p) => p.id === rec.user_id);
    return {
      ...rec,
      user_name: rec.user_name || profile?.full_name || 'Employee',
      user_avatar: rec.user_avatar || profile?.avatar_url,
      user_department: rec.user_department || profile?.department || 'General',
      user_job_title: profile?.job_title || 'Staff',
      user_email: profile?.email || '',
    };
  });

  // Filtered records
  const filteredRecords = enrichedRecords.filter((rec) => {
    const matchesSearch =
      !searchTerm ||
      rec.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.user_department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEmployee = selectedEmployeeId === 'All' || rec.user_id === selectedEmployeeId;
    const matchesDate = !filterDate || rec.date === filterDate;
    const matchesStatus = filterStatus === 'All' || rec.status === filterStatus.toLowerCase();
    const matchesDept = filterDepartment === 'All' || rec.user_department === filterDepartment;

    return matchesSearch && matchesEmployee && matchesDate && matchesStatus && matchesDept;
  });

  // Organization-wide Today Metrics
  const todayLogs = enrichedRecords.filter((r) => r.date === todayStr);
  const presentToday = todayLogs.filter((r) => r.status === 'present' || r.status === 'late').length;
  const lateToday = todayLogs.filter((r) => r.status === 'late').length;
  const absentOrNotLogged = Math.max(0, profiles.length - presentToday);
  const avgWorkHours = todayLogs.length
    ? (todayLogs.reduce((acc, r) => acc + (r.work_hours || 0), 0) / todayLogs.length).toFixed(1)
    : '0.0';

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <Badge variant="success">Present</Badge>;
      case 'late':
        return <Badge variant="warning">Late Arrival</Badge>;
      case 'half_day':
        return <Badge variant="info">Half Day</Badge>;
      case 'absent':
        return <Badge variant="danger">Absent</Badge>;
      case 'leave':
        return <Badge variant="secondary">On Leave</Badge>;
      default:
        return <Badge variant="neutral">Not Logged</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Organization Attendance Management
            </h1>
            <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              Admin & HR Access
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor real-time company-wide check-in logs, punctuality metrics, and staff shift records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Export mock CSV
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                ['Name,Department,Date,Check-In,Check-Out,Hours,Status']
                  .concat(
                    filteredRecords.map(
                      (r) =>
                        `"${r.user_name}","${r.user_department}","${r.date}","${r.check_in || ''}","${r.check_out || ''}","${r.work_hours}","${r.status}"`
                    )
                  )
                  .join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `dayflow-attendance-${todayStr}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            Export Log CSV
          </Button>
        </div>
      </div>

      {/* TODAY'S ORG SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-indigo-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Staff</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {profiles.length} <span className="text-xs font-normal text-slate-400">members</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Present Today</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {presentToday} <span className="text-xs font-normal text-slate-400">/ {profiles.length}</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Late Clock-Ins</p>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {lateToday} <span className="text-xs font-normal text-slate-400">today</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-rose-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Pending / Absent</p>
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {absentOrNotLogged} <span className="text-xs font-normal text-slate-400">members</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <UserX className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Avg Shift Duration</p>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                {avgWorkHours} <span className="text-xs font-normal text-slate-400">hrs</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* FILTER & SEARCH PANEL */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">All Employee Attendance Directory</CardTitle>
              <CardDescription>
                Showing {filteredRecords.length} records across organization departments
              </CardDescription>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative min-w-[200px] flex-1 sm:flex-none">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Filter by Specific Employee */}
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="All">All Employees</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.department})
                  </option>
                ))}
              </select>

              {/* Filter by Department */}
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="All">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {/* Filter by Date */}
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />

              {/* Filter by Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half_day">Half Day</option>
                <option value="Absent">Absent</option>
              </select>

              {(searchTerm || selectedEmployeeId !== 'All' || filterDate || filterStatus !== 'All' || filterDepartment !== 'All') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedEmployeeId('All');
                    setFilterDate('');
                    setFilterStatus('All');
                    setFilterDepartment('All');
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4">Logged Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No matching attendance records found in organization logs.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Employee Profile Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={rec.user_avatar}
                            name={rec.user_name}
                            size="sm"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {rec.user_name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {rec.user_job_title}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {rec.user_department}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        {format(parseISO(rec.date), 'MMM d, yyyy')}
                      </td>

                      {/* Check-In */}
                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {rec.check_in ? format(parseISO(rec.check_in), 'hh:mm a') : '—'}
                      </td>

                      {/* Check-Out */}
                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {rec.check_out ? format(parseISO(rec.check_out), 'hh:mm a') : '—'}
                      </td>

                      {/* Work Hours */}
                      <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                        {rec.work_hours ? `${rec.work_hours} hrs` : '0.0 hrs'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(rec.status)}</td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {rec.notes || '—'}
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
