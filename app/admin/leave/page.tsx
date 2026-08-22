import React from 'react';
import { PlaceholderPage } from '@/components/shared/placeholder-page';

export default function AdminLeavePage() {
  return (
    <PlaceholderPage
      title="Leave Requests & Approvals"
      description="Review submitted leave applications, approve or reject with comments, and track company leave metrics."
      moduleName="Leave Administration"
      targetRole="admin"
      targetPhase="Phase 2"
      databaseTable="leave_requests"
      alternateRoleUrl="/employee/leave"
      alternateRoleLabel="View Employee Leave View"
      suggestedFeatures={[
        'Pending leave applications queue with employee details and reason',
        'One-click Approve and Reject modal with optional admin comments',
        'Company leave calendar timeline (who is off today / next week)',
        'Automatic leave balance deductions upon approval',
      ]}
    />
  );
}
