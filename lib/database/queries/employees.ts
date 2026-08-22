import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { Employee } from '@/types';

/**
 * Foundation database query functions for Employee management.
 * Ready for Phase 2/3 developer implementation.
 */

export async function getEmployees(supabase: SupabaseClient<Database>): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching employees:', error.message);
    return [];
  }
  return data || [];
}

export async function getEmployeeById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<Employee | null> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching employee with ID ${id}:`, error.message);
    return null;
  }
  return data;
}

export async function getEmployeeByProfileId(
  supabase: SupabaseClient<Database>,
  profileId: string
): Promise<Employee | null> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('profile_id', profileId)
    .single();

  if (error) {
    console.error(`Error fetching employee for profile ${profileId}:`, error.message);
    return null;
  }
  return data;
}

export async function createEmployee(
  supabase: SupabaseClient<Database>,
  employeeData: Database['public']['Tables']['employees']['Insert']
): Promise<Employee | null> {
  const { data, error } = await supabase
    .from('employees')
    .insert(employeeData)
    .select()
    .single();

  if (error) {
    console.error('Error creating employee:', error.message);
    return null;
  }
  return data;
}

export async function updateEmployee(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database['public']['Tables']['employees']['Update']
): Promise<Employee | null> {
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating employee ${id}:`, error.message);
    return null;
  }
  return data;
}

export async function deleteEmployee(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<boolean> {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting employee ${id}:`, error.message);
    return false;
  }
  return true;
}

