'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  AttendanceRecord,
  LeaveRequest,
  LeaveBalance,
  PayrollRecord,
  NotificationItem,
  UserRole,
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_LEAVE_BALANCES,
  INITIAL_PAYROLL,
  INITIAL_NOTIFICATIONS,
} from '../mock-data';
import { toast } from 'sonner';

interface AppContextType {
  // Current session & state
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  setCurrentUserId: (id: string) => void;
  profiles: UserProfile[];
  
  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Clock In / Out
  todayAttendance: AttendanceRecord | undefined;
  clockIn: (notes?: string) => void;
  clockOut: () => void;
  attendanceRecords: AttendanceRecord[];

  // Employee Management
  addEmployee: (newEmp: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => void;
  updateEmployeeProfile: (id: string, updates: Partial<UserProfile>) => void;

  // Leave Management
  leaveRequests: LeaveRequest[];
  leaveBalances: LeaveBalance[];
  applyForLeave: (leaveData: {
    leave_type: 'casual' | 'sick' | 'annual' | 'unpaid';
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
  }) => void;
  reviewLeaveRequest: (id: string, status: 'approved' | 'rejected', comment?: string) => void;

  // Payroll Management
  payrollRecords: PayrollRecord[];
  generatePayrollBatch: (month: string) => void;
  updatePayrollStatus: (id: string, status: 'pending' | 'processed' | 'paid') => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<UserProfile[]>(INITIAL_PROFILES);
  const [currentRoleId, setCurrentRoleId] = useState<UserRole>('admin');
  const [currentUserId, setCurrentUserId] = useState<string>('user-admin-1');

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>(INITIAL_LEAVE_BALANCES);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(INITIAL_PAYROLL);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Sync current user with current selected user ID
  const currentUser = profiles.find((p) => p.id === currentUserId) || profiles[0];
  const currentRole = currentUser.role;

  // Handle dark mode toggle
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setRole = (role: UserRole) => {
    if (role === 'admin') {
      const adminUser = profiles.find((p) => p.role === 'admin') || profiles[0];
      setCurrentUserId(adminUser.id);
      setCurrentRoleId('admin');
      toast.success('Switched active perspective to Admin / HR Officer');
    } else {
      const empUser = profiles.find((p) => p.role === 'employee') || profiles[1];
      setCurrentUserId(empUser.id);
      setCurrentRoleId('employee');
      toast.success('Switched active perspective to Employee');
    }
  };

  // Find today's attendance for current user
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.find(
    (a) => a.user_id === currentUser.id && a.date === todayStr
  );

  const clockIn = (notes?: string) => {
    if (todayAttendance?.check_in) {
      toast.error('You have already checked in for today.');
      return;
    }

    const now = new Date();
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);
    const statusTag = isLate ? 'late' : 'present';

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_avatar: currentUser.avatar_url,
      user_department: currentUser.department,
      date: todayStr,
      check_in: now.toISOString(),
      check_out: null,
      work_hours: 0,
      status: statusTag,
      notes: notes || (isLate ? 'Late Clock In' : 'Punctual Clock In'),
      created_at: now.toISOString(),
    };

    setAttendanceRecords((prev) => [newRecord, ...prev]);
    toast.success(`Successfully checked in! Status: ${statusTag.toUpperCase()}`);

    // Persist to Supabase if available
    try {
      import('../services/attendance-service').then(({ attendanceService }) => {
        attendanceService.clockIn({
          userId: currentUser.id,
          userName: currentUser.full_name,
          userAvatar: currentUser.avatar_url,
          userDepartment: currentUser.department,
          notes: newRecord.notes,
        });
      });
    } catch {
      // Graceful fallback
    }
  };

  const clockOut = () => {
    if (!todayAttendance || !todayAttendance.check_in) {
      toast.error('You must check in first before checking out.');
      return;
    }

    if (todayAttendance.check_out) {
      toast.error('You have already checked out for today.');
      return;
    }

    const now = new Date();
    const checkInTime = new Date(todayAttendance.check_in);
    const diffMs = now.getTime() - checkInTime.getTime();
    const hours = Math.max(0.1, Number((diffMs / (1000 * 60 * 60)).toFixed(2)));

    let finalStatus = todayAttendance.status;
    if (hours < 4 && finalStatus === 'present') {
      finalStatus = 'half_day';
    }

    setAttendanceRecords((prev) =>
      prev.map((rec) =>
        rec.id === todayAttendance.id
          ? {
              ...rec,
              check_out: now.toISOString(),
              work_hours: hours,
              status: finalStatus,
            }
          : rec
      )
    );
    toast.success(`Checked out! Work hours logged today: ${hours} hrs`);

    // Persist to Supabase if available
    try {
      import('../services/attendance-service').then(({ attendanceService }) => {
        attendanceService.clockOut({
          ...todayAttendance,
          check_out: now.toISOString(),
          work_hours: hours,
          status: finalStatus,
        });
      });
    } catch {
      // Graceful fallback
    }
  };

  const addEmployee = (newEmpData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => {
    const newId = `user-emp-${Date.now()}`;
    const nowStr = new Date().toISOString();
    const newEmp: UserProfile = {
      ...newEmpData,
      id: newId,
      created_at: nowStr,
      updated_at: nowStr,
    };

    setProfiles((prev) => [...prev, newEmp]);
    setLeaveBalances((prev) => [
      ...prev,
      {
        id: `bal-${Date.now()}`,
        user_id: newId,
        year: new Date().getFullYear(),
        casual_leave: 12,
        sick_leave: 10,
        annual_leave: 15,
        created_at: nowStr,
        updated_at: nowStr,
      },
    ]);

    toast.success(`Added new employee: ${newEmp.full_name}`);
  };

  const updateEmployeeProfile = (id: string, updates: Partial<UserProfile>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    );
    toast.success('Employee profile updated');
  };

  const applyForLeave = (leaveData: {
    leave_type: 'casual' | 'sick' | 'annual' | 'unpaid';
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
  }) => {
    if (!leaveData.start_date) {
      toast.error('Start date is required.');
      return;
    }
    if (!leaveData.end_date) {
      toast.error('End date is required.');
      return;
    }
    if (new Date(leaveData.end_date) < new Date(leaveData.start_date)) {
      toast.error('End date cannot be earlier than start date.');
      return;
    }
    if (!leaveData.reason || !leaveData.reason.trim()) {
      toast.error('Please specify a reason for leave.');
      return;
    }

    // Check for overlapping requests
    const newStart = new Date(leaveData.start_date).getTime();
    const newEnd = new Date(leaveData.end_date).getTime();
    const hasOverlap = leaveRequests.some((req) => {
      if (req.user_id !== currentUser.id) return false;
      if (req.status === 'rejected') return false;
      const reqStart = new Date(req.start_date).getTime();
      const reqEnd = new Date(req.end_date).getTime();
      return newStart <= reqEnd && newEnd >= reqStart;
    });

    if (hasOverlap) {
      toast.error('You already have a pending or active leave request overlapping these dates.');
      return;
    }

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_avatar: currentUser.avatar_url,
      user_department: currentUser.department,
      leave_type: leaveData.leave_type,
      start_date: leaveData.start_date,
      end_date: leaveData.end_date,
      total_days: leaveData.total_days,
      reason: leaveData.reason.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setLeaveRequests((prev) => [newRequest, ...prev]);

    // Create notification for Admin
    const adminUser = profiles.find((p) => p.role === 'admin');
    if (adminUser) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          user_id: adminUser.id,
          title: 'New Leave Request',
          message: `${currentUser.full_name} requested ${leaveData.total_days} day(s) of ${leaveData.leave_type} leave.`,
          type: 'leave',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    toast.success('Leave request submitted to HR for approval!');

    // Persist to Supabase if available
    try {
      import('../services/leave-service').then(({ leaveService }) => {
        leaveService.applyForLeave({
          userId: currentUser.id,
          userName: currentUser.full_name,
          userAvatar: currentUser.avatar_url,
          userDepartment: currentUser.department,
          leave_type: leaveData.leave_type,
          start_date: leaveData.start_date,
          end_date: leaveData.end_date,
          total_days: leaveData.total_days,
          reason: leaveData.reason,
        });
      });
    } catch {
      // Graceful fallback
    }
  };

  const reviewLeaveRequest = (id: string, status: 'approved' | 'rejected', comment?: string) => {
    const targetReq = leaveRequests.find((r) => r.id === id);
    if (!targetReq) return;

    const finalComment = comment?.trim() || (status === 'approved' ? 'Request Approved' : 'Request Declined');

    setLeaveRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status,
              reviewed_by: currentUser.id,
              reviewed_by_name: currentUser.full_name,
              review_comment: finalComment,
              updated_at: new Date().toISOString(),
            }
          : req
      )
    );

    // Deduct leave balance if approved
    if (status === 'approved') {
      setLeaveBalances((prev) =>
        prev.map((b) => {
          if (b.user_id === targetReq.user_id) {
            const fieldKey = `${targetReq.leave_type}_leave` as keyof LeaveBalance;
            if (typeof b[fieldKey] === 'number') {
              const currentVal = b[fieldKey] as number;
              return {
                ...b,
                [fieldKey]: Math.max(0, currentVal - targetReq.total_days),
              };
            }
          }
          return b;
        })
      );
    }

    // Create notification for employee
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        user_id: targetReq.user_id,
        title: `Leave Request ${status.toUpperCase()}`,
        message: `${currentUser.full_name} has ${status} your leave request for ${targetReq.start_date}. Comment: "${finalComment}"`,
        type: 'leave',
        is_read: false,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);

    toast.success(`Leave request ${status}`);

    // Persist to Supabase if available
    try {
      import('../services/leave-service').then(({ leaveService }) => {
        leaveService.reviewLeaveRequest(
          targetReq,
          currentUser.id,
          currentUser.full_name,
          status,
          finalComment
        );
      });
    } catch {
      // Graceful fallback
    }
  };

  const generatePayrollBatch = (month: string) => {
    const newRecords: PayrollRecord[] = profiles.map((p) => {
      const base = p.role === 'admin' ? 12000 : 8500;
      const allowances = 1000;
      const deductions = 1200;
      return {
        id: `pay-${p.id}-${month}`,
        user_id: p.id,
        user_name: p.full_name,
        user_avatar: p.avatar_url,
        user_department: p.department,
        user_job_title: p.job_title,
        month,
        base_salary: base,
        allowances,
        deductions,
        net_salary: base + allowances - deductions,
        payment_status: 'processed',
        payment_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    setPayrollRecords((prev) => {
      const filtered = prev.filter((r) => r.month !== month);
      return [...newRecords, ...filtered];
    });

    toast.success(`Generated monthly payroll for ${month} (${profiles.length} employees)`);
  };

  const updatePayrollStatus = (id: string, status: 'pending' | 'processed' | 'paid') => {
    setPayrollRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, payment_status: status, updated_at: new Date().toISOString() } : r))
    );
    toast.success(`Payroll status updated to ${status.toUpperCase()}`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success('All notifications marked as read');
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setRole,
        currentUser,
        setCurrentUserId,
        profiles,
        theme,
        toggleTheme,
        todayAttendance,
        clockIn,
        clockOut,
        attendanceRecords,
        addEmployee,
        updateEmployeeProfile,
        leaveRequests,
        leaveBalances,
        applyForLeave,
        reviewLeaveRequest,
        payrollRecords,
        generatePayrollBatch,
        updatePayrollStatus,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
