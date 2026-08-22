import React from 'react';
import { PlaceholderPage } from '@/components/shared/placeholder-page';

export default function EmployeeDashboardPage() {
  return (
    <PlaceholderPage
      title="Employee Dashboard"
      description="Personal workspace summary, attendance status, upcoming leaves, and recent payroll slips."
      moduleName="Employee Dashboard"
      targetRole="employee"
      targetPhase="Phase 2"
      databaseTable="employees"
      alternateRoleUrl="/admin/dashboard"
      alternateRoleLabel="Go to Admin Dashboard"
      suggestedFeatures={[
        'Daily check-in / check-out quick action widget',
        'Summary cards: Total hours logged, leave balance remaining, upcoming company holidays',
        'Recent activity feed and announcements',
        'Latest payslip preview with download option',
      ]}
    />
  );
}
