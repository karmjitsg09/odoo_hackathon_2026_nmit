import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { Notification } from '@/types';

/**
 * Foundation database query functions for Notifications.
 * Ready for Phase 2/3 developer implementation.
 */

export async function getNotifications(
  supabase: SupabaseClient<Database>,
  employeeId: string
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching notifications for ${employeeId}:`, error.message);
    return [];
  }
  return data || [];
}

export async function markNotificationAsRead(
  supabase: SupabaseClient<Database>,
  notificationId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error(`Error updating notification ${notificationId}:`, error.message);
    return false;
  }
  return true;
}
