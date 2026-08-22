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
  const [employeesRes, attendanceRes, leavesRes, payrollRes] = await Promise.all([
    supabase.from('employees').select('id', { count: 'exact', head: true }),
    supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('date', today).eq('status', 'present'),
    supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('payroll').select('net_salary'),
  ]);

  const totalEmployees = employeesRes.count || 0;
  const presentToday = attendanceRes.count || 0;
  const pendingLeaves = leavesRes.count || 0;
  const totalMonthlyPayroll = (payrollRes.data || []).reduce((acc, curr) => acc + Number(curr.net_salary || 0), 0);
  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

  return {
    totalEmployees,
    presentToday,
    onLeaveToday: 0,
    pendingLeaves,
    totalMonthlyPayroll,
    attendanceRate,
  };
}
