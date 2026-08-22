export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'hr' | 'employee';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
export type LeaveType = 'casual' | 'sick' | 'annual' | 'unpaid' | 'maternity' | 'paternity';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type NotificationType = 'system' | 'leave' | 'payroll' | 'attendance' | 'announcement';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      employees: {
        Row: {
          id: string;
          employee_id: string;
          profile_id: string | null;
          full_name: string;
          phone: string | null;
          address: string | null;
          department: string | null;
          designation: string | null;
          joining_date: string | null;
          profile_image: string | null;
          salary: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          profile_id?: string | null;
          full_name: string;
          phone?: string | null;
          address?: string | null;
          department?: string | null;
          designation?: string | null;
          joining_date?: string | null;
          profile_image?: string | null;
          salary?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          profile_id?: string | null;
          full_name?: string;
          phone?: string | null;
          address?: string | null;
          department?: string | null;
          designation?: string | null;
          joining_date?: string | null;
          profile_image?: string | null;
          salary?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'employees_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      attendance: {
        Row: {
          id: string;
          employee_id: string;
          date: string;
          check_in: string | null;
          check_out: string | null;
          status: AttendanceStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          date?: string;
          check_in?: string | null;
          check_out?: string | null;
          status?: AttendanceStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          date?: string;
          check_in?: string | null;
          check_out?: string | null;
          status?: AttendanceStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'attendance_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'employees';
            referencedColumns: ['id'];
          }
        ];
      };
      leave_requests: {
        Row: {
          id: string;
          employee_id: string;
          leave_type: LeaveType;
          start_date: string;
          end_date: string;
          remarks: string | null;
          status: LeaveStatus;
          admin_comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          leave_type: LeaveType;
          start_date: string;
          end_date: string;
          remarks?: string | null;
          status?: LeaveStatus;
          admin_comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          leave_type?: LeaveType;
          start_date?: string;
          end_date?: string;
          remarks?: string | null;
          status?: LeaveStatus;
          admin_comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'leave_requests_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'employees';
            referencedColumns: ['id'];
          }
        ];
      };
      payroll: {
        Row: {
          id: string;
          employee_id: string;
          basic_salary: number;
          allowances: number;
          deductions: number;
          net_salary: number;
          effective_date: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          basic_salary: number;
          allowances?: number;
          deductions?: number;
          net_salary: number;
          effective_date: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          basic_salary?: number;
          allowances?: number;
          deductions?: number;
          net_salary?: number;
          effective_date?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payroll_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'employees';
            referencedColumns: ['id'];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          employee_id: string;
          title: string;
          message: string;
          type: NotificationType;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          title: string;
          message: string;
          type?: NotificationType;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          title?: string;
          message?: string;
          type?: NotificationType;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'employees';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_current_employee_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      is_admin_or_hr: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
  };
}
