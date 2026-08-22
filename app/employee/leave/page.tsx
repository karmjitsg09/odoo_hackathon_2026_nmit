import React from 'react';
import { PlaceholderPage } from '@/components/shared/placeholder-page';

export default function EmployeeLeavePage() {
  return (
    <PlaceholderPage
      title="My Leave Requests"
      description="Apply for leave, track request statuses, and monitor remaining leave balances."
      moduleName="Leave Requests"
      targetRole="employee"
      targetPhase="Phase 2"
      databaseTable="leave_requests"
      alternateRoleUrl="/admin/leave"
      alternateRoleLabel="View Admin Leave Approvals"
      suggestedFeatures={[
        'Leave Application Form (Type: Casual, Sick, Annual, Unpaid; Dates; Remarks)',
        'Live Leave Balances widget with progress meters',
        'Request History table with status badges (Pending, Approved, Rejected)',
        'Option to withdraw/cancel pending requests',
      ]}
    />
  );
}
