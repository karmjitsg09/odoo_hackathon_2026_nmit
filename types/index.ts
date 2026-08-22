import type { Database } from './database';

export * from './database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Employee = Database['public']['Tables']['employees']['Row'];
export type Attendance = Database['public']['Tables']['attendance']['Row'];
export type LeaveRequest = Database['public']['Tables']['leave_requests']['Row'];
export type Payroll = Database['public']['Tables']['payroll']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

// Extended types for UI views with joined data
export interface EmployeeWithProfile extends Employee {
  profile?: Profile | null;
}

export interface AttendanceWithEmployee extends Attendance {
  employee?: Employee;
}

export interface LeaveRequestWithEmployee extends LeaveRequest {
  employee?: Employee;
}

export interface PayrollWithEmployee extends Payroll {
  employee?: Employee;
}

// Navigation structure
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string | number;
  role?: Database['public']['Tables']['profiles']['Row']['role'][];
}

// System analytics overview
export interface AnalyticsSummary {
  totalEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  pendingLeaves: number;
  totalMonthlyPayroll: number;
  attendanceRate: number;
}
