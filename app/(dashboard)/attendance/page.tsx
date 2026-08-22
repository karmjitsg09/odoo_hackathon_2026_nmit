'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  Clock,
  Play,
  Square,
  CheckCircle2,
  Calendar,
  Filter,
  Users,
  AlertTriangle,
  Award,
  Search,
} from 'lucide-react';

export default function AttendancePage() {
  const {
    attendanceRecords,
    todayAttendance,
    clockIn,
    clockOut,
    currentUser,
    currentRole,
    profiles,
  } = useApp();

  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // User-specific or All (depending on role)
  const displayRecords = attendanceRecords.filter((rec) => {
    const isRoleMatch = currentRole === 'admin' ? true : rec.user_id === currentUser.id;
    const isDateMatch = !filterDate || rec.date === filterDate;
    const isStatusMatch = filterStatus === 'All' || rec.status === filterStatus.toLowerCase();
    const isSearchMatch =
      !searchTerm || (rec.user_name && rec.user_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return isRoleMatch && isDateMatch && isStatusMatch && isSearchMatch;
  });

  // Calculate personal metrics for employee
  const userLogs = attendanceRecords.filter((r) => r.user_id === currentUser.id);
  const presentDays = userLogs.filter((r) => r.status === 'present' || r.status === 'late').length;
  const totalHours = userLogs.reduce((acc, r) => acc + r.work_hours, 0);
  const lateCount = userLogs.filter((r) => r.status === 'late').length;
  const punctualityScore = userLogs.length ? Math.round(((presentDays - lateCount) / userLogs.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Attendance & Time Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {currentRole === 'admin'
              ? 'Monitor organization-wide clock-in logs and team punctuality'
              : 'Log daily shifts, track work hours, and review attendance history'}
          </p>
        </div>
      </div>

      {/* Clock In / Out Hero Widget */}
      <Card className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-indigo-500/20 text-white p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                Shift Tracker
              </Badge>
              <span className="text-xs text-slate-400">Today: {todayStr}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {todayAttendance?.check_in
                ? todayAttendance.check_out
                  ? 'Shift Completed Today 🎉'
                  : 'Currently Clocked In ⏱️'
                : 'Ready to Start Your Shift?'}
            </h2>
            <p className="text-sm text-slate-300 max-w-lg">
              {todayAttendance?.check_in
                ? `Started shift at ${new Date(todayAttendance.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Press Check In to record your daily attendance time stamp.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {!todayAttendance?.check_in ? (
              <Button
                variant="success"
                size="lg"
                onClick={() => clockIn()}
                className="w-full sm:w-auto text-base font-bold shadow-lg shadow-emerald-500/30"
              >
                <Play className="w-5 h-5 fill-current" />
                Clock In Now
              </Button>
            ) : !todayAttendance.check_out ? (
              <Button
                variant="danger"
                size="lg"
                onClick={() => clockOut()}
                className="w-full sm:w-auto text-base font-bold shadow-lg shadow-rose-500/30"
              >
                <Square className="w-5 h-5 fill-current" />
                Clock Out
              </Button>
            ) : (
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                <span className="text-xs text-indigo-200">Total Work Duration Logged</span>
                <p className="text-xl font-bold text-emerald-400">{todayAttendance.work_hours} Hours</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Present Days</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{presentDays}</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Total Hours Logged</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalHours.toFixed(1)} hrs</p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Late Arrivals</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{lateCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Punctuality Score</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{punctualityScore}%</p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Attendance Logs Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-base">
              {currentRole === 'admin' ? 'Organization Attendance Directory' : 'Your Personal Attendance Logs'}
            </CardTitle>
            <CardDescription>Filterable logs with status tags and shift duration</CardDescription>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {currentRole === 'admin' && (
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            )}

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                  {currentRole === 'admin' && <th className="py-3 px-4">Employee</th>}
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Work Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      No matching attendance records found.
                    </td>
                  </tr>
                ) : (
                  displayRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      {currentRole === 'admin' && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar src={rec.user_avatar} name={rec.user_name || 'User'} size="sm" />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{rec.user_name}</p>
                              <p className="text-[10px] text-slate-400">{rec.user_department}</p>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{rec.date}</td>
                      <td className="py-3 px-4">
                        {rec.check_in
                          ? new Date(rec.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {rec.check_out
                          ? new Date(rec.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">{rec.work_hours} hrs</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            rec.status === 'present'
                              ? 'success'
                              : rec.status === 'late'
                              ? 'warning'
                              : 'danger'
                          }
                          className="capitalize"
                        >
                          {rec.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{rec.notes || '-'}</td>
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
