export type UserRole = 'admin' | 'employee';

export type AttendanceStatus = 'present' | 'late' | 'half_day' | 'absent';

export type LeaveType = 'casual' | 'sick' | 'annual' | 'unpaid';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type PayrollStatus = 'pending' | 'processed' | 'paid';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  job_title: string;
  department: string;
  phone: string;
  address: string;
  date_of_joining: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  user_department?: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  work_hours: number;
  status: AttendanceStatus;
  notes?: string;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  user_department?: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: LeaveStatus;
  reviewed_by?: string;
  reviewed_by_name?: string;
  review_comment?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalance {
  id: string;
  user_id: string;
  year: number;
  casual_leave: number;
  sick_leave: number;
  annual_leave: number;
  created_at: string;
  updated_at: string;
}

export interface PayrollRecord {
  id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  user_department?: string;
  user_job_title?: string;
  month: string; // YYYY-MM
  base_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  payment_status: PayrollStatus;
  payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'leave' | 'payroll' | 'attendance' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface HRAnalyticsSummary {
  totalEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  attendanceRate: number;
  pendingLeaves: number;
  totalMonthlyPayroll: number;
  departmentCounts: Record<string, number>;
  leaveTypeCounts: Record<string, number>;
}
