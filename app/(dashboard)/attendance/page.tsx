'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import EmployeeAttendancePage from '@/app/employee/attendance/page';
import AdminAttendancePage from '@/app/admin/attendance/page';

export default function AttendancePage() {
  const { currentRole } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (currentRole === 'admin') {
      router.replace('/admin/attendance');
    } else {
      router.replace('/employee/attendance');
    }
  }, [currentRole, router]);

  return currentRole === 'admin' ? <AdminAttendancePage /> : <EmployeeAttendancePage />;
}
