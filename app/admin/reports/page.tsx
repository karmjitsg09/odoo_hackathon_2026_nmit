'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  Building2,
  RefreshCw,
  Printer,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { createClient } from '@/lib/supabase/client';
import {
  getEmployees,
  getAllAttendanceWithEmployees,
  getAllLeaveRequestsWithEmployees,
  getAllPayrollWithEmployees,
  getDepartmentDistribution,
  getLeaveTypeDistribution,
  getAttendanceTrends,
  DepartmentStat,
  LeaveTypeStat,
  AttendanceTrendDay,
} from '@/lib/database';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { toast } from 'sonner';
import type { Employee, Attendance, LeaveRequest, Payroll } from '@/types';

type AttendanceWithEmp = Attendance & { employee?: Employee };
type LeaveWithEmp = LeaveRequest & { employee?: Employee };
type PayrollWithEmp = Payroll & { employee?: Employee };

const CHART_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6'];

export default function AdminReportsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [activeTab, setActiveTab] = useState<'analytics' | 'reports'>('analytics');
  const [reportType, setReportType] = useState<'attendance' | 'leave' | 'employees' | 'payroll'>('attendance');

  // Master Data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceWithEmp[]>([]);
  const [leaves, setLeaves] = useState<LeaveWithEmp[]>([]);
  const [payrolls, setPayrolls] = useState<PayrollWithEmp[]>([]);

  // Analytics Aggregates
  const [deptStats, setDeptStats] = useState<DepartmentStat[]>([]);
  const [leaveStats, setLeaveStats] = useState<LeaveTypeStat[]>([]);
  const [trendStats, setTrendStats] = useState<AttendanceTrendDay[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Report Filters
  const [selectedDept, setSelectedDept] = useState('all');
  const [startDate, setStartDate] = useState(() =>
    new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );

  const fetchAllData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [
        empData,
        attData,
        leaveData,
        payData,
        deptData,
        leaveTypeData,
        trendsData,
      ] = await Promise.all([
        getEmployees(supabase),
        getAllAttendanceWithEmployees(supabase),
        getAllLeaveRequestsWithEmployees(supabase),
        getAllPayrollWithEmployees(supabase),
        getDepartmentDistribution(supabase),
        getLeaveTypeDistribution(supabase),
        getAttendanceTrends(supabase, 7),
      ]);

      if (empData && empData.length > 0) setEmployees(empData);
      if (attData && attData.length > 0) setAttendance(attData);
      if (leaveData && leaveData.length > 0) setLeaves(leaveData);
      if (payData && payData.length > 0) setPayrolls(payData);
      if (deptData && deptData.length > 0) setDeptStats(deptData);
      if (leaveTypeData && leaveTypeData.length > 0) setLeaveStats(leaveTypeData);
      if (trendsData && trendsData.length > 0) setTrendStats(trendsData);

      // Fallback sample data if empty
      if (!empData || empData.length === 0) {
        setDeptStats([
          { name: 'Engineering', count: 2, totalSalary: 215000 },
          { name: 'Design', count: 1, totalSalary: 105000 },
          { name: 'Human Resources', count: 1, totalSalary: 95000 },
          { name: 'Executive', count: 1, totalSalary: 125000 },
        ]);
        setLeaveStats([
          { type: 'annual', count: 4 },
          { type: 'sick', count: 2 },
          { type: 'casual', count: 1 },
        ]);
        setTrendStats([
          { date: 'Mon', present: 4, late: 0, half_day: 0, absent: 0, on_leave: 0 },
          { date: 'Tue', present: 3, late: 1, half_day: 0, absent: 0, on_leave: 0 },
          { date: 'Wed', present: 3, late: 0, half_day: 0, absent: 0, on_leave: 1 },
          { date: 'Thu', present: 4, late: 0, half_day: 0, absent: 0, on_leave: 0 },
          { date: 'Fri', present: 2, late: 1, half_day: 1, absent: 0, on_leave: 0 },
        ]);
      }
    } catch (err) {
      console.error('Failed to load reports data:', err);
      toast.error('Failed to load reports data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const [
          empData,
          attData,
          leaveData,
          payData,
          deptData,
          leaveTypeData,
          trendsData,
        ] = await Promise.all([
          getEmployees(supabase),
          getAllAttendanceWithEmployees(supabase),
          getAllLeaveRequestsWithEmployees(supabase),
          getAllPayrollWithEmployees(supabase),
          getDepartmentDistribution(supabase),
          getLeaveTypeDistribution(supabase),
          getAttendanceTrends(supabase, 7),
        ]);

        if (!ignore) {
          if (empData && empData.length > 0) setEmployees(empData);
          if (attData && attData.length > 0) setAttendance(attData);
          if (leaveData && leaveData.length > 0) setLeaves(leaveData);
          if (payData && payData.length > 0) setPayrolls(payData);
          if (deptData && deptData.length > 0) setDeptStats(deptData);
          if (leaveTypeData && leaveTypeData.length > 0) setLeaveStats(leaveTypeData);
          if (trendsData && trendsData.length > 0) setTrendStats(trendsData);

          if (!empData || empData.length === 0) {
            setDeptStats([
              { name: 'Engineering', count: 2, totalSalary: 215000 },
              { name: 'Design', count: 1, totalSalary: 105000 },
              { name: 'Human Resources', count: 1, totalSalary: 95000 },
              { name: 'Executive', count: 1, totalSalary: 125000 },
            ]);
            setLeaveStats([
              { type: 'annual', count: 4 },
              { type: 'sick', count: 2 },
              { type: 'casual', count: 1 },
            ]);
            setTrendStats([
              { date: 'Mon', present: 4, late: 0, half_day: 0, absent: 0, on_leave: 0 },
              { date: 'Tue', present: 3, late: 1, half_day: 0, absent: 0, on_leave: 0 },
              { date: 'Wed', present: 3, late: 0, half_day: 0, absent: 0, on_leave: 1 },
              { date: 'Thu', present: 4, late: 0, half_day: 0, absent: 0, on_leave: 0 },
              { date: 'Fri', present: 2, late: 1, half_day: 1, absent: 0, on_leave: 0 },
            ]);
          }

          setLoading(false);
        }
      } catch (err) {
        console.error('Reports fetch error:', err);
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [supabase]);

  // Filtered dataset for active report
  const filteredReportData = useMemo(() => {
    switch (reportType) {
      case 'attendance':
        return attendance.filter((r) => {
          const inDept = selectedDept === 'all' || r.employee?.department === selectedDept;
          const inDate = (!startDate || r.date >= startDate) && (!endDate || r.date <= endDate);
          return inDept && inDate;
        });

      case 'leave':
        return leaves.filter((r) => {
          const inDept = selectedDept === 'all' || r.employee?.department === selectedDept;
          const inDate = (!startDate || r.start_date >= startDate) && (!endDate || r.end_date <= endDate);
          return inDept && inDate;
        });

      case 'employees':
        return employees.filter((r) => {
          const inDept = selectedDept === 'all' || r.department === selectedDept;
          return inDept;
        });

      case 'payroll':
        return payrolls.filter((r) => {
          const inDept = selectedDept === 'all' || r.employee?.department === selectedDept;
          return inDept;
        });
    }
  }, [reportType, attendance, leaves, employees, payrolls, selectedDept, startDate, endDate]);

  // Export to CSV Functionality
  const exportToCSV = () => {
    try {
      let headers: string[] = [];
      let rows: string[][] = [];
      const filename = `dayflow_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;

      if (reportType === 'attendance') {
        headers = ['Employee ID', 'Full Name', 'Department', 'Date', 'Check In', 'Check Out', 'Status'];
        rows = (filteredReportData as AttendanceWithEmp[]).map((r) => [
          r.employee?.employee_id || 'N/A',
          `"${r.employee?.full_name || 'Staff'}"`,
          `"${r.employee?.department || 'General'}"`,
          r.date,
          r.check_in || 'N/A',
          r.check_out || 'N/A',
          r.status,
        ]);
      } else if (reportType === 'leave') {
        headers = ['Employee ID', 'Full Name', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Status', 'Remarks', 'Admin Comment'];
        rows = (filteredReportData as LeaveWithEmp[]).map((r) => [
          r.employee?.employee_id || 'N/A',
          `"${r.employee?.full_name || 'Staff'}"`,
          `"${r.employee?.department || 'General'}"`,
          r.leave_type,
          r.start_date,
          r.end_date,
          r.status,
          `"${r.remarks || ''}"`,
          `"${r.admin_comment || ''}"`,
        ]);
      } else if (reportType === 'employees') {
        headers = ['Employee ID', 'Full Name', 'Department', 'Designation', 'Phone', 'Joining Date', 'Annual Base Salary'];
        rows = (filteredReportData as Employee[]).map((r) => [
          r.employee_id,
          `"${r.full_name}"`,
          `"${r.department || 'General'}"`,
          `"${r.designation || 'Staff'}"`,
          `"${r.phone || ''}"`,
          r.joining_date || 'N/A',
          String(r.salary || 0),
        ]);
      } else if (reportType === 'payroll') {
        headers = ['Employee ID', 'Full Name', 'Department', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary', 'Effective Date'];
        rows = (filteredReportData as PayrollWithEmp[]).map((r) => [
          r.employee?.employee_id || 'N/A',
          `"${r.employee?.full_name || 'Staff'}"`,
          `"${r.employee?.department || 'General'}"`,
          String(r.basic_salary),
          String(r.allowances),
          String(r.deductions),
          String(r.net_salary),
          r.effective_date,
        ]);
      }

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${filename} successfully!`);
    } catch (err) {
      console.error('Export CSV error:', err);
      toast.error('Failed to export CSV file.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Analytics & Executive Reports
            </h1>
            <Badge variant="primary">Admin Intelligence</Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Workforce demographic distributions, punctuality trends, leave utilization, and downloadable register exports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAllData}
            disabled={refreshing}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {activeTab === 'reports' && (
            <Button
              variant="primary"
              size="sm"
              onClick={exportToCSV}
              className="text-xs font-semibold shadow-md shadow-indigo-500/25"
            >
              <Download className="w-3.5 h-3.5" />
              Export to CSV
            </Button>
          )}
        </div>
      </div>

      {/* Main View Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Visual Analytics
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'reports'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Data Reports & Export
        </button>
      </div>

      {/* ================================================================= */}
      {/* TAB 1: VISUAL ANALYTICS */}
      {/* ================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Workforce Chart */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Headcount by Department</CardTitle>
                  <CardDescription className="text-xs">
                    Current active staff count per organizational division
                  </CardDescription>
                </div>
                <Badge variant="primary">{deptStats.length} Divisions</Badge>
              </div>

              <div className="h-64 w-full pt-2">
                {loading ? (
                  <Skeleton className="h-full w-full" />
                ) : deptStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888888' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#888888' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="count" name="Staff Count" fill="#6366F1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No department data available.
                  </div>
                )}
              </div>
            </Card>

            {/* Department Salary Distribution */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Payroll Expenditure by Dept</CardTitle>
                  <CardDescription className="text-xs">
                    Total annual base compensation allocation
                  </CardDescription>
                </div>
                <Badge variant="success">Financials</Badge>
              </div>

              <div className="h-64 w-full pt-2">
                {loading ? (
                  <Skeleton className="h-full w-full" />
                ) : deptStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptStats} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888888' }} />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#888888' }}
                        tickFormatter={(v) => `$${v / 1000}k`}
                      />
                      <Tooltip
                        formatter={(val: unknown) => [formatCurrency(Number(val)), 'Total Base Pay']}
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="totalSalary" name="Payroll" fill="#10B981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No salary data available.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Trend Chart */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">7-Day Attendance Trend</CardTitle>
                  <CardDescription className="text-xs">
                    Daily employee check-in and presence volume
                  </CardDescription>
                </div>
                <Badge variant="primary">Punctuality</Badge>
              </div>

              <div className="h-64 w-full pt-2">
                {loading ? (
                  <Skeleton className="h-full w-full" />
                ) : trendStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888888' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#888888' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#fff',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="present"
                        name="Present"
                        stroke="#6366F1"
                        fillOpacity={1}
                        fill="url(#colorPresent)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No trend records available.
                  </div>
                )}
              </div>
            </Card>

            {/* Leave Type Distribution Chart */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Leave Distribution by Category</CardTitle>
                  <CardDescription className="text-xs">
                    Volume breakdown by leave application type
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  Categories
                </Badge>
              </div>

              <div className="h-64 w-full pt-2 flex items-center justify-center">
                {loading ? (
                  <Skeleton className="h-full w-full" />
                ) : leaveStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leaveStats}
                        dataKey="count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {leaveStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#fff',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No leave statistics available.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: DATA REPORTS & EXPORT */}
      {/* ================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <Card className="p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Report Category Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  onClick={() => setReportType('attendance')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    reportType === 'attendance'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Attendance Report
                </button>

                <button
                  onClick={() => setReportType('leave')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    reportType === 'leave'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  Leave Summary
                </button>

                <button
                  onClick={() => setReportType('employees')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    reportType === 'employees'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Employee Directory
                </button>

                <button
                  onClick={() => setReportType('payroll')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    reportType === 'payroll'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Payroll Register
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="py-1.5 px-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="all">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Design">Design</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                {(reportType === 'attendance' || reportType === 'leave') && (
                  <div className="flex items-center gap-2 text-xs">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="py-1 px-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    />
                    <span className="text-slate-400">→</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="py-1 px-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </Button>
              </div>
            </div>
          </Card>

          {/* Report Data Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm capitalize">
                  {reportType} Master Register
                </h4>
                <p className="text-xs text-slate-500">
                  {filteredReportData.length} records matched active criteria
                </p>
              </div>

              <Badge variant="outline" className="font-mono text-xs">
                RFC-4180 CSV Ready
              </Badge>
            </div>

            {/* Attendance Report */}
            {reportType === 'attendance' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredReportData as AttendanceWithEmp[]).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-semibold text-xs">
                        {r.employee?.full_name || 'Staff Member'} ({r.employee?.employee_id})
                      </TableCell>
                      <TableCell className="text-xs">{r.employee?.department || 'General'}</TableCell>
                      <TableCell className="text-xs">{formatDate(r.date)}</TableCell>
                      <TableCell className="text-xs font-mono">{formatTime(r.check_in)}</TableCell>
                      <TableCell className="text-xs font-mono">{formatTime(r.check_out)}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === 'present' ? 'success' : 'warning'}>
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Leave Report */}
            {reportType === 'leave' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredReportData as LeaveWithEmp[]).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-semibold text-xs">
                        {r.employee?.full_name} ({r.employee?.employee_id})
                      </TableCell>
                      <TableCell className="text-xs capitalize">{r.leave_type}</TableCell>
                      <TableCell className="text-xs">
                        {formatDate(r.start_date)} → {formatDate(r.end_date)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {r.remarks || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'}>
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Employee Directory Report */}
            {reportType === 'employees' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Contact Phone</TableHead>
                    <TableHead>Joining Date</TableHead>
                    <TableHead>Annual Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredReportData as Employee[]).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs font-mono font-semibold text-indigo-500">
                        {r.employee_id}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{r.full_name}</TableCell>
                      <TableCell className="text-xs">{r.department || 'General'}</TableCell>
                      <TableCell className="text-xs">{r.designation || 'Staff'}</TableCell>
                      <TableCell className="text-xs">{r.phone || '—'}</TableCell>
                      <TableCell className="text-xs">{formatDate(r.joining_date)}</TableCell>
                      <TableCell className="text-xs font-semibold font-mono text-emerald-500">
                        {formatCurrency(r.salary)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Payroll Report */}
            {reportType === 'payroll' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Effective Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredReportData as PayrollWithEmp[]).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs font-semibold">
                        {r.employee?.full_name || 'Staff'} ({r.employee?.employee_id})
                      </TableCell>
                      <TableCell className="text-xs">{r.employee?.department || 'General'}</TableCell>
                      <TableCell className="text-xs font-medium">{formatCurrency(r.basic_salary)}</TableCell>
                      <TableCell className="text-xs font-semibold text-emerald-500">
                        +{formatCurrency(r.allowances)}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-rose-500">
                        -{formatCurrency(r.deductions)}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                        {formatCurrency(r.net_salary)}
                      </TableCell>
                      <TableCell className="text-xs">{formatDate(r.effective_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
