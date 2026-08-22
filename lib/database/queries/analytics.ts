import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { AnalyticsSummary } from '@/types';

/**
 * Foundation database query functions for HR and Admin Analytics.
 * Ready for Phase 2/3 developer implementation.
 */

export async function getAnalyticsSummary(
  supabase: SupabaseClient<Database>
): Promise<AnalyticsSummary> {
  const today = new Date().toISOString().split('T')[0];

  // Fetch counts in parallel
  const [employeesRes, attendancePresentRes, attendanceLateRes, onLeaveAttendanceRes, leavesPendingRes, activeLeavesRes, payrollRes] = await Promise.all([
    supabase.from('employees').select('id', { count: 'exact', head: true }),
    supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('date', today).eq('status', 'present'),
    supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('date', today).eq('status', 'late'),
    supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('date', today).eq('status', 'on_leave'),
    supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('status', 'approved').lte('start_date', today).gte('end_date', today),
    supabase.from('payroll').select('net_salary'),
  ]);

  const totalEmployees = employeesRes.count || 0;
  const presentToday = (attendancePresentRes.count || 0) + (attendanceLateRes.count || 0);
  const onLeaveToday = Math.max(onLeaveAttendanceRes.count || 0, activeLeavesRes.count || 0);
  const pendingLeaves = leavesPendingRes.count || 0;
  const totalMonthlyPayroll = (payrollRes.data || []).reduce((acc, curr) => acc + Number(curr.net_salary || 0), 0);
  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

  return {
    totalEmployees,
    presentToday,
    onLeaveToday,
    pendingLeaves,
    totalMonthlyPayroll,
    attendanceRate,
  };
}

export interface DepartmentStat {
  name: string;
  count: number;
  totalSalary: number;
}

export async function getDepartmentDistribution(
  supabase: SupabaseClient<Database>
): Promise<DepartmentStat[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('department, salary');

  if (error || !data) {
    console.error('Error fetching department distribution:', error?.message);
    return [];
  }

  const deptMap: Record<string, { count: number; totalSalary: number }> = {};
  data.forEach((emp) => {
    const dept = emp.department || 'General';
    if (!deptMap[dept]) {
      deptMap[dept] = { count: 0, totalSalary: 0 };
    }
    deptMap[dept].count += 1;
    deptMap[dept].totalSalary += Number(emp.salary || 0);
  });

  return Object.entries(deptMap).map(([name, stat]) => ({
    name,
    count: stat.count,
    totalSalary: stat.totalSalary,
  }));
}

export interface LeaveTypeStat {
  type: string;
  count: number;
}

export async function getLeaveTypeDistribution(
  supabase: SupabaseClient<Database>
): Promise<LeaveTypeStat[]> {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('leave_type');

  if (error || !data) {
    console.error('Error fetching leave type distribution:', error?.message);
    return [];
  }

  const typeMap: Record<string, number> = {};
  data.forEach((req) => {
    const type = req.leave_type;
    typeMap[type] = (typeMap[type] || 0) + 1;
  });

  return Object.entries(typeMap).map(([type, count]) => ({
    type,
    count,
  }));
}

export interface AttendanceTrendDay {
  date: string;
  present: number;
  late: number;
  half_day: number;
  absent: number;
  on_leave: number;
}

export async function getAttendanceTrends(
  supabase: SupabaseClient<Database>,
  days: number = 7
): Promise<AttendanceTrendDay[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  const startDateStr = startDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('attendance')
    .select('date, status')
    .gte('date', startDateStr)
    .order('date', { ascending: true });

  if (error || !data) {
    console.error('Error fetching attendance trends:', error?.message);
    return [];
  }

  const dayMap: Record<string, AttendanceTrendDay> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dStr = d.toISOString().split('T')[0];
    dayMap[dStr] = {
      date: dStr,
      present: 0,
      late: 0,
      half_day: 0,
      absent: 0,
      on_leave: 0,
    };
  }

  data.forEach((att) => {
    if (dayMap[att.date]) {
      const statusKey = att.status as keyof Omit<AttendanceTrendDay, 'date'>;
      if (typeof dayMap[att.date][statusKey] === 'number') {
        dayMap[att.date][statusKey] += 1;
      }
    }
  });

  return Object.values(dayMap);
}

