'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import EmployeeLeavePage from '@/app/employee/leave/page';
import AdminLeavePage from '@/app/admin/leave/page';

export default function LeavePage() {
  const { currentRole } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (currentRole === 'admin') {
      router.replace('/admin/leave');
    } else {
      router.replace('/employee/leave');
    }
  }, [currentRole, router]);

  return currentRole === 'admin' ? <AdminLeavePage /> : <EmployeeLeavePage />;
}
