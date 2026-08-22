import React from 'react';
import { PlaceholderPage } from '@/components/shared/placeholder-page';

export default function AdminDashboardPage() {
  return (
    <PlaceholderPage
      title="HR & Admin Dashboard"
      description="Company-wide workforce overview, live attendance metrics, pending approvals, and payroll expenditure."
      moduleName="Admin Dashboard & Analytics"
      targetRole="admin"
      targetPhase="Phase 2"
      databaseTable="employees"
      alternateRoleUrl="/employee/dashboard"
      alternateRoleLabel="Go to Employee Dashboard"
      suggestedFeatures={[
        'Real-time KPI metrics cards (Total Staff, Present Today, On Leave, Pending Approvals)',
        'Attendance rate gauge and department attendance distribution charts',
        'Quick action buttons: Register Employee, Run Payroll, Broadcast Announcement',
        'Recent leave requests awaiting approval table',
      ]}
    />
  );
}
