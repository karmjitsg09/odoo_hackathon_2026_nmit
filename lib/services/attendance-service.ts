import { createClient } from '../supabase/client';
import { AttendanceRecord, AttendanceStatus } from '../types';

export interface ClockInPayload {
  userId: string;
  userName?: string;
  userAvatar?: string;
  userDepartment?: string;
  notes?: string;
}

export const attendanceService = {
  /**
   * Clock in an employee for today
   */
  async clockIn({ userId, userName, userAvatar, userDepartment, notes }: ClockInPayload): Promise<AttendanceRecord> {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);
    const status: AttendanceStatus = isLate ? 'late' : 'present';

    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      user_id: userId,
      user_name: userName,
      user_avatar: userAvatar,
      user_department: userDepartment,
      date: todayStr,
      check_in: now.toISOString(),
      check_out: null,
      work_hours: 0,
      status,
      notes: notes || (isLate ? 'Late Arrival' : 'On-time Arrival'),
      created_at: now.toISOString(),
    };

    try {
      const supabase = createClient();
      // Attempt Supabase insert
      await supabase.from('attendance').insert({
        user_id: userId,
        date: todayStr,
        check_in: record.check_in,
        status: record.status,
        notes: record.notes,
      });
    } catch {
      // Graceful fallback for non-configured or offline Supabase
    }

    return record;
  },

  /**
   * Clock out an employee for today
   */
  async clockOut(existingRecord: AttendanceRecord): Promise<AttendanceRecord> {
    if (!existingRecord.check_in) {
      throw new Error('Cannot clock out without checking in first.');
    }

    const now = new Date();
    const checkInTime = new Date(existingRecord.check_in);
    const diffMs = now.getTime() - checkInTime.getTime();
    const workHours = Math.max(0.1, Number((diffMs / (1000 * 60 * 60)).toFixed(2)));

    // If worked less than 4 hours, mark as half-day if status was present
    let finalStatus = existingRecord.status;
    if (workHours < 4 && finalStatus === 'present') {
      finalStatus = 'half_day';
    }

    const updatedRecord: AttendanceRecord = {
      ...existingRecord,
      check_out: now.toISOString(),
      work_hours: workHours,
      status: finalStatus,
    };

    try {
      const supabase = createClient();
      await supabase
        .from('attendance')
        .update({
          check_out: updatedRecord.check_out,
          work_hours: workHours,
          status: finalStatus,
        })
        .eq('user_id', existingRecord.user_id)
        .eq('date', existingRecord.date);
    } catch {
      // Graceful fallback
    }

    return updatedRecord;
  },
};
