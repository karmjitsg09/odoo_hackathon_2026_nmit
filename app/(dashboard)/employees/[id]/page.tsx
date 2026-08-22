'use client';

import React, { useState, use } from 'react';
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
  Briefcase,
  ShieldCheck,
  Edit2,
  Check,
  X,
  Clock,
  CalendarCheck,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const targetId = resolvedParams.id;

  const {
    profiles,
    currentUser,
    currentRole,
    updateEmployeeProfile,
    attendanceRecords,
    leaveRequests,
    payrollRecords,
  } = useApp();

  const targetUser = profiles.find((p) => p.id === targetId) || currentUser;
  const isOwnProfile = currentUser.id === targetUser.id;
  const isAdmin = currentRole === 'admin';

  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'leave' | 'payroll'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    full_name: targetUser.full_name,
    phone: targetUser.phone,
    address: targetUser.address,
    emergency_contact_name: targetUser.emergency_contact_name,
    emergency_contact_phone: targetUser.emergency_contact_phone,
    job_title: targetUser.job_title,
    department: targetUser.department,
    role: targetUser.role,
  });

  const userAttendance = attendanceRecords.filter((a) => a.user_id === targetUser.id);
  const userLeaves = leaveRequests.filter((l) => l.user_id === targetUser.id);
  const userPayroll = payrollRecords.filter((p) => p.user_id === targetUser.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    // Permission enforcement
    const updates: any = {
      phone: editForm.phone,
      address: editForm.address,
      emergency_contact_name: editForm.emergency_contact_name,
      emergency_contact_phone: editForm.emergency_contact_phone,
    };

    if (isAdmin) {
      updates.full_name = editForm.full_name;
      updates.job_title = editForm.job_title;
      updates.department = editForm.department;
      updates.role = editForm.role;
    }

    updateEmployeeProfile(targetUser.id, updates);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Hero Card */}
      <Card className="p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar src={targetUser.avatar_url} name={targetUser.full_name} size="xl" className="ring-4 ring-indigo-500/30" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">{targetUser.full_name}</h1>
                <Badge variant={targetUser.role === 'admin' ? 'secondary' : 'neutral'}>
                  {targetUser.role === 'admin' ? 'HR Officer' : 'Employee'}
                </Badge>
              </div>
              <p className="text-sm text-indigo-200">{targetUser.job_title} • {targetUser.department}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{targetUser.email}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Joined {targetUser.date_of_joining}</span>
              </div>
            </div>
          </div>

          {(isOwnProfile || isAdmin) && (
            <Button
              variant={isEditing ? 'outline' : 'primary'}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs"
            >
              {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-6 mt-6 border-t border-slate-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Personal Overview
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'attendance' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Attendance Logs ({userAttendance.length})
          </button>
          <button
            onClick={() => setActiveTab('leave')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'leave' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Leave History ({userLeaves.length})
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'payroll' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Payroll & Payslips ({userPayroll.length})
          </button>
        </div>
      </Card>

      {/* Tab 1: Overview & Edit Form */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Contact & Identity Information</CardTitle>
                  <CardDescription>
                    {isEditing ? 'Modify profile fields' : 'Primary contact details and emergency records'}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {!isAdmin && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>As an employee, job title, department, and role are restricted to HR Admins.</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Residential Address</label>
                        <input
                          type="text"
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Emergency Contact Name</label>
                        <input
                          type="text"
                          value={editForm.emergency_contact_name}
                          onChange={(e) => setEditForm({ ...editForm, emergency_contact_name: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Emergency Contact Phone</label>
                        <input
                          type="text"
                          value={editForm.emergency_contact_phone}
                          onChange={(e) => setEditForm({ ...editForm, emergency_contact_phone: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                        <p className="text-xs font-bold uppercase text-indigo-500">Admin Only Settings</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Job Title</label>
                            <input
                              type="text"
                              value={editForm.job_title}
                              onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Department</label>
                            <input
                              type="text"
                              value={editForm.department}
                              onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Phone</p>
                      <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{targetUser.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400">Address</p>
                      <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{targetUser.address}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400">Emergency Contact</p>
                      <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{targetUser.emergency_contact_name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400">Emergency Contact Phone</p>
                      <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{targetUser.emergency_contact_phone}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Employment Record</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Employee ID</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{targetUser.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">System Role</span>
                  <Badge variant={targetUser.role === 'admin' ? 'secondary' : 'neutral'}>
                    {targetUser.role.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Department</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{targetUser.department}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Joining Date</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{targetUser.date_of_joining}</span>
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
            <CardTitle className="text-base">Attendance History</CardTitle>
            <CardDescription>Complete clock-in and clock-out log history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Check In</th>
                    <th className="py-3 px-4">Check Out</th>
                    <th className="py-3 px-4">Hours</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {userAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No attendance records logged for this employee yet.
                      </td>
                    </tr>
                  ) : (
                    userAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{rec.date}</td>
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
      )}

      {/* Tab 3: Leave History */}
      {activeTab === 'leave' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leave Applications & Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase">
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Start Date</th>
                    <th className="py-3 px-4">End Date</th>
                    <th className="py-3 px-4">Days</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {userLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No leave applications filed.
                      </td>
                    </tr>
                  ) : (
                    userLeaves.map((req) => (
                      <tr key={req.id}>
                        <td className="py-3 px-4 font-semibold capitalize">{req.leave_type} Leave</td>
                        <td className="py-3 px-4">{req.start_date}</td>
                        <td className="py-3 px-4">{req.end_date}</td>
                        <td className="py-3 px-4 font-bold">{req.total_days}</td>
                        <td className="py-3 px-4 text-slate-500">{req.reason}</td>
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
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {userPayroll.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No payroll statements recorded.
                      </td>
                    </tr>
                  ) : (
                    userPayroll.map((pay) => (
                      <tr key={pay.id}>
                        <td className="py-3 px-4 font-semibold">{pay.month}</td>
                        <td className="py-3 px-4">${pay.base_salary.toLocaleString()}</td>
                        <td className="py-3 px-4 text-emerald-600">+${pay.allowances.toLocaleString()}</td>
                        <td className="py-3 px-4 text-rose-500">-${pay.deductions.toLocaleString()}</td>
                        <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                          ${pay.net_salary.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              pay.payment_status === 'paid'
                                ? 'success'
                                : pay.payment_status === 'processed'
                                ? 'secondary'
                                : 'warning'
                            }
                            className="capitalize"
                          >
                            {pay.payment_status}
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
