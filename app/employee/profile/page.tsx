'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function EmployeeProfilePage() {
  const {
    currentUser,
    currentRole,
    updateEmployeeProfile,
    attendanceRecords,
    leaveRequests,
    payrollRecords,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'leave' | 'payroll'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    full_name: currentUser.full_name,
    phone: currentUser.phone,
    address: currentUser.address,
    emergency_contact_name: currentUser.emergency_contact_name,
    emergency_contact_phone: currentUser.emergency_contact_phone,
    job_title: currentUser.job_title,
    department: currentUser.department,
  });

  const userAttendance = attendanceRecords.filter((a) => a.user_id === currentUser.id);
  const userLeaves = leaveRequests.filter((l) => l.user_id === currentUser.id);
  const userPayroll = payrollRecords.filter((p) => p.user_id === currentUser.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const updates = {
      phone: editForm.phone,
      address: editForm.address,
      emergency_contact_name: editForm.emergency_contact_name,
      emergency_contact_phone: editForm.emergency_contact_phone,
    };

    updateEmployeeProfile(currentUser.id, updates);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Hero Card */}
      <Card className="p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar
              src={currentUser.avatar_url}
              name={currentUser.full_name}
              size="xl"
              className="ring-4 ring-indigo-500/30 shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {currentUser.full_name}
                </h1>
                <Badge variant={currentRole === 'admin' ? 'secondary' : 'neutral'}>
                  {currentRole === 'admin' ? 'HR Officer' : 'Employee'}
                </Badge>
              </div>
              <p className="text-sm text-indigo-200">
                {currentUser.job_title} • {currentUser.department}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {currentUser.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {currentUser.date_of_joining}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant={isEditing ? 'outline' : 'primary'}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-semibold"
          >
            {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
            {isEditing ? 'Cancel' : 'Edit Contact Info'}
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-6 mt-6 border-t border-slate-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Personal Overview
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Attendance Logs ({userAttendance.length})
          </button>
          <button
            onClick={() => setActiveTab('leave')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'leave'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Leave History ({userLeaves.length})
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'payroll'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Payroll & Payslips ({userPayroll.length})
          </button>
        </div>
      </Card>

      {/* Tab 1: Personal Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Contact & Identity Details</CardTitle>
                  <CardDescription>
                    {isEditing
                      ? 'Modify your phone number and address'
                      : 'Your contact details and organizational identity'}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Residential Address
                        </label>
                        <input
                          type="text"
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Emergency Contact Name
                        </label>
                        <input
                          type="text"
                          value={editForm.emergency_contact_name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, emergency_contact_name: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Emergency Contact Phone
                        </label>
                        <input
                          type="text"
                          value={editForm.emergency_contact_phone}
                          onChange={(e) =>
                            setEditForm({ ...editForm, emergency_contact_phone: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary" size="sm">
                        <Check className="w-4 h-4" />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-indigo-500" /> Phone Number
                      </span>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {currentUser.phone || 'Not provided'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Address
                      </span>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {currentUser.address || 'Not provided'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-500" /> Emergency Contact
                      </span>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {currentUser.emergency_contact_name || 'Not provided'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" /> Emergency Phone
                      </span>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {currentUser.emergency_contact_phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Organizational Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Employment Details</CardTitle>
                <CardDescription>Department assignment & role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Employee ID</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {currentUser.id.slice(0, 12)}...
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Department</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {currentUser.department}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Job Title</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {currentUser.job_title}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Joining Date</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {currentUser.date_of_joining}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Logs */}
      {activeTab === 'attendance' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Attendance Records</CardTitle>
            <CardDescription>Your logged shifts and time duration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Check-In</th>
                    <th className="py-3 px-4">Check-Out</th>
                    <th className="py-3 px-4">Hours</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {userAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No attendance records recorded yet.
                      </td>
                    </tr>
                  ) : (
                    userAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {rec.date}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {rec.check_in ? format(parseISO(rec.check_in), 'hh:mm a') : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {rec.check_out ? format(parseISO(rec.check_out), 'hh:mm a') : '—'}
                        </td>
                        <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                          {rec.work_hours} hrs
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              rec.status === 'present'
                                ? 'success'
                                : rec.status === 'late'
                                ? 'warning'
                                : 'neutral'
                            }
                            className="capitalize"
                          >
                            {rec.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{rec.notes || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Leave History */}
      {activeTab === 'leave' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leave Application Log</CardTitle>
            <CardDescription>Submitted time-off requests and HR responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">HR Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {userLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No leave requests submitted yet.
                      </td>
                    </tr>
                  ) : (
                    userLeaves.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white capitalize">
                          {l.leave_type} Leave
                        </td>
                        <td className="py-3 px-4">
                          {l.start_date} to {l.end_date}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {l.total_days} days
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                          &quot;{l.reason}&quot;
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              l.status === 'approved'
                                ? 'success'
                                : l.status === 'rejected'
                                ? 'danger'
                                : 'warning'
                            }
                            className="capitalize"
                          >
                            {l.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500 italic">
                          {l.review_comment || 'Pending HR review'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Payroll & Payslips */}
      {activeTab === 'payroll' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payslip Statements</CardTitle>
            <CardDescription>Monthly salary disbursements and breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                    <th className="py-3 px-4">Month</th>
                    <th className="py-3 px-4">Base Salary</th>
                    <th className="py-3 px-4">Allowances</th>
                    <th className="py-3 px-4">Deductions</th>
                    <th className="py-3 px-4">Net Salary</th>
                    <th className="py-3 px-4">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {userPayroll.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No payroll statements issued yet for this account.
                      </td>
                    </tr>
                  ) : (
                    userPayroll.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {p.month}
                        </td>
                        <td className="py-3 px-4">${p.base_salary.toLocaleString()}</td>
                        <td className="py-3 px-4 text-emerald-600 font-medium">
                          +${p.allowances.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-rose-500 font-medium">
                          -${p.deductions.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                          ${p.net_salary.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={p.payment_status === 'paid' ? 'success' : 'info'}
                            className="capitalize"
                          >
                            {p.payment_status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
