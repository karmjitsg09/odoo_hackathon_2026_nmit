import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { LeaveRequest } from '@/types';

/**
 * Foundation database query functions for Leave management.
 * Ready for Phase 2/3 developer implementation.
 */

export async function getLeaveRequests(
  supabase: SupabaseClient<Database>
): Promise<LeaveRequest[]> {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leave requests:', error.message);
    return [];
  }
  return data || [];
}

export async function getEmployeeLeaveRequests(
  supabase: SupabaseClient<Database>,
  employeeId: string
): Promise<LeaveRequest[]> {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching leaves for employee ${employeeId}:`, error.message);
    return [];
  }
  return data || [];
}
