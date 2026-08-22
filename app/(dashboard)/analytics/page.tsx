'use client';

import React from 'react';
import { useApp } from '@/lib/store/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, TrendingUp, Users, Calendar, DollarSign, Award } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export default function AnalyticsPage() {
  const { currentRole, profiles, leaveRequests, payrollRecords } = useApp();

  // Role Gate
  if (currentRole !== 'admin') {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 rounded-3xl bg-rose-500/10 text-rose-500">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Restricted</h2>
        <p className="text-sm text-slate-500 max-w-md">
          HR Analytics and Graphical Financial Reports are accessible exclusively to HR Officers and Organization Administrators.
        </p>
      </div>
    );
  }

  // Data Aggregations for Recharts
  const deptCounts: Record<string, number> = {};
  profiles.forEach((p) => {
    deptCounts[p.department] = (deptCounts[p.department] || 0) + 1;
  });

  const headcountData = Object.keys(deptCounts).map((dept) => ({
    department: dept,
    headcount: deptCounts[dept],
  }));

  const leaveTypeCounts: Record<string, number> = {};
  leaveRequests.forEach((l) => {
    leaveTypeCounts[l.leave_type] = (leaveTypeCounts[l.leave_type] || 0) + 1;
  });

  const leaveChartData = Object.keys(leaveTypeCounts).map((type) => ({
    name: type.toUpperCase(),
    value: leaveTypeCounts[type],
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const attendanceTrendData = [
    { month: 'Apr', rate: 91 },
    { month: 'May', rate: 93 },
    { month: 'Jun', rate: 95 },
    { month: 'Jul', rate: 92 },
    { month: 'Aug', rate: 96 },
  ];

  const payrollDeptData = [
    { department: 'Engineering', amount: 18200 },
    { department: 'Design', amount: 8500 },
    { department: 'Product', amount: 8850 },
    { department: 'Human Resources', amount: 12200 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Executive HR Analytics & Intelligence
            </h1>
            <Badge variant="secondary">Admin Authorized</Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time graphical insights into workforce distribution, attendance compliance, leave trends, and payroll expenses
          </p>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Total Headcount</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{profiles.length}</p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Punctuality Benchmark</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">96.2%</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Leave Approval Rate</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">88.5%</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Payroll Monthly Total</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">$47,750</p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Graphical Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Department Headcount */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Headcount by Department</CardTitle>
            <CardDescription>Active employee count per functional department</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={headcountData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="department" stroke="#94a3b8" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="headcount" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Attendance Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance Rate Trend (%)</CardTitle>
            <CardDescription>5-month organization punctuality & presence rate</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis domain={[80, 100]} stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Leave Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leave Breakdown by Category</CardTitle>
            <CardDescription>Ratio of Casual, Sick, Annual, and Unpaid leave requests</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {leaveChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 4: Payroll Expenditure by Department */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payroll Expense by Department ($)</CardTitle>
            <CardDescription>Monthly compensation allocation per department</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payrollDeptData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="department" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
