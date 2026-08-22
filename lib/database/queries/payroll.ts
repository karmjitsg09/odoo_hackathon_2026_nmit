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

export async function getAllPayrollWithEmployees(
  supabase: SupabaseClient<Database>
): Promise<(Payroll & { employee?: Database['public']['Tables']['employees']['Row'] })[]> {
  const { data, error } = await supabase
    .from('payroll')
    .select(`
      *,
      employee:employees(*)
    `)
    .order('effective_date', { ascending: false });

  if (error) {
    console.error('Error fetching all payroll records:', error.message);
    return [];
  }
  return (data as unknown as (Payroll & { employee?: Database['public']['Tables']['employees']['Row'] })[]) || [];
}

export async function savePayrollRecord(
  supabase: SupabaseClient<Database>,
  record: {
    id?: string;
    employee_id: string;
    basic_salary: number;
    allowances?: number;
    deductions?: number;
    effective_date: string;
  }
): Promise<Payroll | null> {
  const basic = Math.max(0, Number(record.basic_salary) || 0);
  const allow = Math.max(0, Number(record.allowances) || 0);
  const ded = Math.max(0, Number(record.deductions) || 0);
  const net = Math.max(0, basic + allow - ded);

  const payload = {
    employee_id: record.employee_id,
    basic_salary: basic,
    allowances: allow,
    deductions: ded,
    net_salary: net,
    effective_date: record.effective_date || new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString(),
  };

  let query;
  if (record.id) {
    query = supabase.from('payroll').update(payload).eq('id', record.id).select().single();
  } else {
    query = supabase.from('payroll').insert(payload).select().single();
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error saving payroll record:', error.message);
    return null;
  }

  // Also update salary column on employees table for consistency
  await supabase.from('employees').update({ salary: basic }).eq('id', record.employee_id);

  return data;
}

export async function deletePayrollRecord(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<boolean> {
  const { error } = await supabase
    .from('payroll')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting payroll record ${id}:`, error.message);
    return false;
  }
  return true;
}

