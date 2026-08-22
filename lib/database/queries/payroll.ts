import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { Payroll } from '@/types';

/**
 * Foundation database query functions for Payroll.
 * Ready for Phase 2/3 developer implementation.
 */

export async function getPayrollRecords(
  supabase: SupabaseClient<Database>
): Promise<Payroll[]> {
  const { data, error } = await supabase
    .from('payroll')
    .select('*')
    .order('effective_date', { ascending: false });

  if (error) {
    console.error('Error fetching payroll records:', error.message);
    return [];
  }
  return data || [];
}

export async function getEmployeePayroll(
  supabase: SupabaseClient<Database>,
  employeeId: string
): Promise<Payroll[]> {
  const { data, error } = await supabase
    .from('payroll')
    .select('*')
    .eq('employee_id', employeeId)
    .order('effective_date', { ascending: false });

  if (error) {
    console.error(`Error fetching payroll for employee ${employeeId}:`, error.message);
    return [];
  }
  return data || [];
}
