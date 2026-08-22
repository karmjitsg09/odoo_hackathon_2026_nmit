import { createClient } from '../supabase/client';
import { LeaveRequest, LeaveType } from '../types';

export interface ApplyLeavePayload {
  userId: string;
  userName?: string;
  userAvatar?: string;
  userDepartment?: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  existingRequests?: LeaveRequest[];
}

export const leaveService = {
  /**
   * Validate leave application parameters
   */
  validateLeaveApplication(payload: ApplyLeavePayload): { isValid: boolean; error?: string } {
    if (!payload.start_date) {
      return { isValid: false, error: 'Start date is required.' };
    }
    if (!payload.end_date) {
      return { isValid: false, error: 'End date is required.' };
    }
    if (new Date(payload.end_date) < new Date(payload.start_date)) {
      return { isValid: false, error: 'End date cannot be earlier than start date.' };
    }
    if (!payload.leave_type) {
      return { isValid: false, error: 'Please select a leave type.' };
    }
    if (!payload.reason || !payload.reason.trim()) {
      return { isValid: false, error: 'Reason for leave is required.' };
    }

    // Check for overlapping leave requests for this user
    if (payload.existingRequests && payload.existingRequests.length > 0) {
      const newStart = new Date(payload.start_date).getTime();
      const newEnd = new Date(payload.end_date).getTime();

      const hasOverlap = payload.existingRequests.some((req) => {
        if (req.user_id !== payload.userId) return false;
        if (req.status === 'rejected') return false; // Rejected leaves don't block
        const reqStart = new Date(req.start_date).getTime();
        const reqEnd = new Date(req.end_date).getTime();

        // Check if [newStart, newEnd] overlaps with [reqStart, reqEnd]
        return newStart <= reqEnd && newEnd >= reqStart;
      });

      if (hasOverlap) {
        return {
          isValid: false,
          error: 'You already have an active or pending leave request overlapping with these dates.',
        };
      }
    }

    return { isValid: true };
  },

  /**
   * Submit a new leave request
   */
  async applyForLeave(payload: ApplyLeavePayload): Promise<LeaveRequest> {
    const validation = this.validateLeaveApplication(payload);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid leave request');
    }

    const nowStr = new Date().toISOString();
    const newRecord: LeaveRequest = {
      id: `leave-${Date.now()}`,
      user_id: payload.userId,
      user_name: payload.userName,
      user_avatar: payload.userAvatar,
      user_department: payload.userDepartment,
      leave_type: payload.leave_type,
      start_date: payload.start_date,
      end_date: payload.end_date,
      total_days: payload.total_days,
      reason: payload.reason.trim(),
      status: 'pending',
      created_at: nowStr,
      updated_at: nowStr,
    };

    try {
      const supabase = createClient();
      await supabase.from('leave_requests').insert({
        employee_id: payload.userId,
        leave_type: payload.leave_type,
        start_date: payload.start_date,
        end_date: payload.end_date,
        remarks: payload.reason.trim(),
        status: 'pending',
      });
    } catch {
      // Graceful fallback
    }

    return newRecord;
  },

  /**
   * Review a leave request (Approve or Reject) with admin comment
   */
  async reviewLeaveRequest(
    targetRequest: LeaveRequest,
    reviewerId: string,
    reviewerName: string,
    status: 'approved' | 'rejected',
    comment?: string
  ): Promise<LeaveRequest> {
    const nowStr = new Date().toISOString();
    const finalComment = comment?.trim() || (status === 'approved' ? 'Approved by HR' : 'Declined by HR');

    const updatedRecord: LeaveRequest = {
      ...targetRequest,
      status,
      reviewed_by: reviewerId,
      reviewed_by_name: reviewerName,
      review_comment: finalComment,
      updated_at: nowStr,
    };

    try {
      const supabase = createClient();
      // Update leave request in Supabase
      await supabase
        .from('leave_requests')
        .update({
          status,
          admin_comment: finalComment,
          updated_at: nowStr,
        })
        .eq('id', targetRequest.id);

      // Insert notification for employee
      await supabase.from('notifications').insert({
        employee_id: targetRequest.user_id,
        title: `Leave Request ${status.toUpperCase()}`,
        message: `${reviewerName} has ${status} your leave request for ${targetRequest.start_date} to ${targetRequest.end_date}. Comment: "${finalComment}"`,
        type: 'leave',
        read: false,
      });
    } catch {
      // Graceful fallback
    }

    return updatedRecord;
  },
};
