'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Play,
  Square,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Award,
  Filter,
  CalendarDays,
  Info,
  Timer,
  CheckCircle,
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';

export default function EmployeeAttendancePage() {
  const {
    todayAttendance,
    clockIn,
    clockOut,
    attendanceRecords,
    currentUser,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [clockInNotes, setClockInNotes] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isClocking, setIsClocking] = useState(false);

  // Keep client-side clock running safely
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

  // Employee only accesses their own records
  const userRecords = attendanceRecords.filter((r) => r.user_id === currentUser.id);

  // Filtered personal records
  const filteredRecords = userRecords.filter((rec) => {
    const matchesDate = !filterDate || rec.date === filterDate;
    const matchesStatus = filterStatus === 'All' || rec.status === filterStatus.toLowerCase();
    return matchesDate && matchesStatus;
  });

  // Calculate metrics
  const presentDays = userRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
  const totalHours = userRecords.reduce((acc, r) => acc + (r.work_hours || 0), 0);
  const lateCount = userRecords.filter((r) => r.status === 'late').length;
  const punctualityScore = userRecords.length
    ? Math.round(((presentDays - lateCount) / userRecords.length) * 100)
    : 100;

  // Build current week breakdown (Mon - Sun)
  const currentMonday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dayDate = addDays(currentMonday, i);
    const dateStr = format(dayDate, 'yyyy-MM-dd');
    const record = userRecords.find((r) => r.date === dateStr);
    const isToday = isSameDay(dayDate, new Date());
    const isFuture = dayDate > new Date() && !isToday;
    const isWeekend = i === 5 || i === 6;

    return {
      date: dayDate,
      dateStr,
      dayName: format(dayDate, 'EEE'),
      dayNumber: format(dayDate, 'd MMM'),
      record,
      isToday,
      isFuture,
      isWeekend,
    };
  });

  const weeklyHoursLogged = weekDays.reduce((acc, d) => acc + (d.record?.work_hours || 0), 0);
  const targetWeeklyHours = 40;
  const weeklyProgress = Math.min(100, Math.round((weeklyHoursLogged / targetWeeklyHours) * 100));

  const handleClockIn = async () => {
    setIsClocking(true);
    try {
      clockIn(clockInNotes);
      setClockInNotes('');
    } finally {
      setIsClocking(false);
    }
  };

  const handleClockOut = async () => {
    setIsClocking(true);
    try {
      clockOut();
    } finally {
      setIsClocking(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <Badge variant="success">Present</Badge>;
      case 'late':
        return <Badge variant="warning">Late</Badge>;
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
              My Attendance & Shift Tracker
            </h1>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Employee Portal
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Clock in for your daily shift, track logged hours, and review personal attendance records.
          </p>
        </div>

        {/* Live Clock Card */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Timer className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Current Local Time</p>
            <p className="text-base font-mono font-bold text-slate-900 dark:text-white">
              {currentTime ? format(currentTime, 'hh:mm:ss a') : '--:--:-- --'}
            </p>
          </div>
        </div>
      </div>

      {/* TODAY'S ATTENDANCE HERO CARD */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-500/30 p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {currentTime ? format(currentTime, 'EEEE, MMMM d, yyyy') : todayStr}
              </span>
              {todayAttendance ? (
                todayAttendance.check_out ? (
                  <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                    Shift Completed 🎉
                  </Badge>
                ) : (
                  <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse">
                    Currently Clocked In ⏱️
                  </Badge>
                )
              ) : (
                <Badge variant="neutral" className="bg-slate-800 text-slate-300 border-slate-700">
                  Not Checked In Yet
                </Badge>
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {todayAttendance?.check_in
                  ? todayAttendance.check_out
                    ? `Great job today, ${currentUser.full_name.split(' ')[0]}!`
                    : `Shift in Progress: ${currentUser.full_name.split(' ')[0]}`
                  : `Good day, ${currentUser.full_name.split(' ')[0]}! Ready to start?`}
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                {todayAttendance?.check_in
                  ? todayAttendance.check_out
                    ? `You clocked out at ${format(parseISO(todayAttendance.check_out), 'hh:mm a')}. Logged ${todayAttendance.work_hours} hours total.`
                    : `Clocked in at ${format(parseISO(todayAttendance.check_in), 'hh:mm a')}. Remember to clock out at the end of your shift.`
                  : 'Record your check-in timestamp to start logging hours for today.'}
              </p>
            </div>

            {/* Check In / Out Time Stamps Display */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-[11px] text-slate-400">Check-In Time</span>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {todayAttendance?.check_in
                    ? format(parseISO(todayAttendance.check_in), 'hh:mm a')
                    : '—'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-[11px] text-slate-400">Check-Out Time</span>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {todayAttendance?.check_out
                    ? format(parseISO(todayAttendance.check_out), 'hh:mm a')
                    : '—'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-400">Logged Hours Today</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">
                  {todayAttendance?.work_hours ? `${todayAttendance.work_hours} hrs` : '0.0 hrs'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button & Notes Area */}
          <div className="flex flex-col gap-3 min-w-[280px] bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
            {!todayAttendance?.check_in ? (
              <>
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1.5">
                    Optional Clock-In Note / Location:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Office Desk, Remote, Client Meeting"
                    value={clockInNotes}
                    onChange={(e) => setClockInNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <Button
                  variant="success"
                  size="lg"
                  disabled={isClocking}
                  onClick={handleClockIn}
                  className="w-full text-base font-bold shadow-lg shadow-emerald-500/25 cursor-pointer py-3.5"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {isClocking ? 'Clocking In...' : 'Clock In Now'}
                </Button>
              </>
            ) : !todayAttendance.check_out ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    Shift is active. Clock out when you finish your work today.
                  </span>
                </div>
                <Button
                  variant="danger"
                  size="lg"
                  disabled={isClocking}
                  onClick={handleClockOut}
                  className="w-full text-base font-bold shadow-lg shadow-rose-500/25 cursor-pointer py-3.5"
                >
                  <Square className="w-5 h-5 fill-current" />
                  {isClocking ? 'Clocking Out...' : 'Clock Out'}
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                <CheckCircle className="w-7 h-7 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-emerald-300">Shift Finished</p>
                <p className="text-xs text-slate-400">
                  Attendance recorded for {todayStr}. See you tomorrow!
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                Present Days
              </p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {presentDays} <span className="text-xs font-normal text-slate-400">days</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-indigo-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                Total Hours Logged
              </p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {totalHours.toFixed(1)} <span className="text-xs font-normal text-slate-400">hrs</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                Late Arrivals
              </p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {lateCount} <span className="text-xs font-normal text-slate-400">shifts</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                Punctuality Rate
              </p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {punctualityScore}%
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* WEEKLY ATTENDANCE VIEW */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-base">Weekly Attendance Overview</CardTitle>
            </div>
            <CardDescription>
              Week of {format(currentMonday, 'MMMM d')} – {format(addDays(currentMonday, 6), 'MMMM d, yyyy')}
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                {weeklyHoursLogged.toFixed(1)} / {targetWeeklyHours} hrs
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{weeklyProgress}% of weekly target</p>
            </div>
            <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const hasRecord = !!day.record;
              return (
                <div
                  key={day.dateStr}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between min-h-[125px] ${
                    day.isToday
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 shadow-sm'
                      : day.isWeekend
                      ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-80'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-bold ${day.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {day.dayName}
                      </p>
                      <p className="text-[11px] text-slate-400">{day.dayNumber}</p>
                    </div>
                    {day.isToday && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                    )}
                  </div>

                  <div className="space-y-1.5 my-2">
                    {hasRecord ? (
                      <>
                        <div className="scale-90 origin-left">
                          {getStatusBadge(day.record?.status)}
                        </div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {day.record?.work_hours} hrs
                        </p>
                      </>
                    ) : day.isFuture ? (
                      <p className="text-[11px] text-slate-400 italic">Upcoming</p>
                    ) : day.isWeekend ? (
                      <p className="text-[11px] text-slate-400 italic">Weekend</p>
                    ) : (
                      <p className="text-[11px] text-rose-500 font-medium">No record</p>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {day.record?.check_in
                      ? `${format(parseISO(day.record.check_in), 'HH:mm')} - ${day.record.check_out ? format(parseISO(day.record.check_out), 'HH:mm') : '...'}`
                      : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ATTENDANCE HISTORY LOGS */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-base">Personal Attendance History</CardTitle>
            <CardDescription>Comprehensive record of your past shifts and time entries</CardDescription>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

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

            {(filterDate || filterStatus !== 'All') && (
              <button
                onClick={() => {
                  setFilterDate('');
                  setFilterStatus('All');
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No attendance records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {format(parseISO(rec.date), 'EEE, MMM d, yyyy')}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {rec.check_in ? format(parseISO(rec.check_in), 'hh:mm a') : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {rec.check_out ? format(parseISO(rec.check_out), 'hh:mm a') : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                        {rec.work_hours ? `${rec.work_hours} hrs` : '0.0 hrs'}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(rec.status)}</td>
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
