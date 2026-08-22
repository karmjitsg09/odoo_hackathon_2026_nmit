import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { Attendance } from '@/types';

/**
 * Foundation database query functions for Attendance tracking.
 * Ready for Phase 2/3 developer implementation.
 */

export async function getAttendanceByEmployee(
  supabase: SupabaseClient<Database>,
  employeeId: string
): Promise<Attendance[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .order('date', { ascending: false });

  if (error) {
    console.error(`Error fetching attendance for employee ${employeeId}:`, error.message);
    return [];
  }
  return data || [];
}

export async function getTodayAttendance(
  supabase: SupabaseClient<Database>
): Promise<Attendance[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('date', today);

  if (error) {
    console.error('Error fetching today attendance:', error.message);
    return [];
  }
  return data || [];
}
