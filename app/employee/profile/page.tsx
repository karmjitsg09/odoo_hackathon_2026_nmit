import React from 'react';
import { PlaceholderPage } from '@/components/shared/placeholder-page';

export default function EmployeeProfilePage() {
  return (
    <PlaceholderPage
      title="Employee Profile"
      description="Personal information, designation, department, contact details, and emergency contacts."
      moduleName="Employee Profile"
      targetRole="employee"
      targetPhase="Phase 2"
      databaseTable="employees"
      suggestedFeatures={[
        'View personal and organizational info (Designation, Department, Joining Date)',
        'Edit contact info (Phone, Address, Emergency Contact)',
        'Avatar / Profile photo upload with Supabase Storage',
        'Read-only view of employee ID and organizational role',
      ]}
    />
  );
}
