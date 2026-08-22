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

export async function getAllLeaveRequestsWithEmployees(
  supabase: SupabaseClient<Database>,
  statusFilter?: string
): Promise<(LeaveRequest & { employee?: Database['public']['Tables']['employees']['Row'] })[]> {
  let query = supabase
    .from('leave_requests')
    .select(`
      *,
      employee:employees(*)
    `)
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter as Database['public']['Tables']['leave_requests']['Row']['status']);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching all leave requests:', error.message);
    return [];
  }
  return (data as unknown as (LeaveRequest & { employee?: Database['public']['Tables']['employees']['Row'] })[]) || [];
}

export async function reviewLeaveRequest(
  supabase: SupabaseClient<Database>,
  id: string,
  status: 'approved' | 'rejected',
  adminComment?: string
): Promise<LeaveRequest | null> {
  const { data, error } = await supabase
    .from('leave_requests')
    .update({
      status,
      admin_comment: adminComment || (status === 'approved' ? 'Request Approved' : 'Request Declined'),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error reviewing leave request ${id}:`, error.message);
    return null;
  }
  return data;
}

export async function createLeaveRequest(
  supabase: SupabaseClient<Database>,
  requestData: Database['public']['Tables']['leave_requests']['Insert']
): Promise<LeaveRequest | null> {
  const { data, error } = await supabase
    .from('leave_requests')
    .insert(requestData)
    .select()
    .single();

  if (error) {
    console.error('Error creating leave request:', error.message);
    return null;
  }
  return data;
}

