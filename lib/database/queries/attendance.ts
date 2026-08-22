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

export async function getAllAttendanceWithEmployees(
  supabase: SupabaseClient<Database>,
  filters?: {
    date?: string;
    status?: string;
    employeeId?: string;
  }
): Promise<(Attendance & { employee?: Database['public']['Tables']['employees']['Row'] })[]> {
  let query = supabase
    .from('attendance')
    .select(`
      *,
      employee:employees(*)
    `)
    .order('date', { ascending: false });

  if (filters?.date) {
    query = query.eq('date', filters.date);
  }
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status as Database['public']['Tables']['attendance']['Row']['status']);
  }
  if (filters?.employeeId) {
    query = query.eq('employee_id', filters.employeeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching all attendance records:', error.message);
    return [];
  }
  return (data as unknown as (Attendance & { employee?: Database['public']['Tables']['employees']['Row'] })[]) || [];
}

export async function upsertAttendanceRecord(
  supabase: SupabaseClient<Database>,
  record: Database['public']['Tables']['attendance']['Insert']
): Promise<Attendance | null> {
  const { data, error } = await supabase
    .from('attendance')
    .upsert(record, { onConflict: 'employee_id,date' })
    .select()
    .single();

  if (error) {
    console.error('Error saving attendance record:', error.message);
    return null;
  }
  return data;
}

export async function updateAttendanceRecord(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database['public']['Tables']['attendance']['Update']
): Promise<Attendance | null> {
  const { data, error } = await supabase
    .from('attendance')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating attendance record ${id}:`, error.message);
    return null;
  }
  return data;
}

export async function deleteAttendanceRecord(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<boolean> {
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting attendance record ${id}:`, error.message);
    return false;
  }
  return true;
}
