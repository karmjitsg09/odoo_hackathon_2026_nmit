import React from 'react';
import { PlaceholderPage } from '@/components/shared/placeholder-page';

export default function EmployeePayrollPage() {
  return (
    <PlaceholderPage
      title="My Payroll & Compensation"
      description="View salary slips, breakdowns of basic pay, allowances, deductions, and net salary."
      moduleName="Payroll (Read-Only for Employees)"
      targetRole="employee"
      targetPhase="Phase 2"
      databaseTable="payroll"
      alternateRoleUrl="/admin/payroll"
      alternateRoleLabel="View Admin Payroll Management"
      suggestedFeatures={[
        'Monthly payslip summary cards (Basic Salary, Allowances, Deductions, Net Salary)',
        'Historical payslips list with download / print preview',
        'Year-to-date earnings and tax breakdown',
        'Payment status indicator (Pending, Processed, Paid)',
      ]}
    />
  );
}
