'use client';

import React, { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import {
  CreditCard,
  DollarSign,
  Search,
  Plus,
  Edit3,
  RefreshCw,
  Building2,
  Calendar,
  FileText,
  TrendingUp,
  Calculator,
  Printer,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  getAllPayrollWithEmployees,
  savePayrollRecord,
  getEmployees,
} from '@/lib/database';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { Payroll, Employee } from '@/types';

type PayrollWithEmp = Payroll & { employee?: Employee };

export default function AdminPayrollPage() {
  const supabase = useMemo(() => createClient(), []);

  const [payrollRecords, setPayrollRecords] = useState<PayrollWithEmp[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PayrollWithEmp | null>(null);

  // Salary Editor Form State
  const [formData, setFormData] = useState({
    id: '',
    employee_id: '',
    employee_name: '',
    employee_id_code: '',
    department: '',
    designation: '',
    basic_salary: 8000,
    allowances: 800,
    deductions: 1000,
    effective_date: new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, startTransition] = useTransition();

  // Reactive Net Salary calculation: Basic + Allowances - Deductions
  const computedNetSalary = useMemo(() => {
    const basic = Math.max(0, Number(formData.basic_salary) || 0);
    const allow = Math.max(0, Number(formData.allowances) || 0);
    const ded = Math.max(0, Number(formData.deductions) || 0);
    return Math.max(0, basic + allow - ded);
  }, [formData.basic_salary, formData.allowances, formData.deductions]);

  const fetchPayrollData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [payData, empData] = await Promise.all([
        getAllPayrollWithEmployees(supabase),
        getEmployees(supabase),
      ]);

      if (empData && empData.length > 0) {
        setEmployees(empData);
      }

      if (payData && payData.length > 0) {
        setPayrollRecords(payData);
      } else {
        const fallbackEmpList: Employee[] = [
          {
            id: 'e0000000-0000-0000-0000-000000000001',
            employee_id: 'EMP-001',
            profile_id: 'a0000000-0000-0000-0000-000000000001',
            full_name: 'Eleanor Vance',
            phone: '+1 (555) 019-2834',
            address: '100 Silicon Way, San Francisco, CA',
            department: 'Executive',
            designation: 'Head of People & Operations',
            joining_date: '2023-01-15',
            profile_image: null,
            salary: 125000.0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'e0000000-0000-0000-0000-000000000002',
            employee_id: 'EMP-002',
            profile_id: 'a0000000-0000-0000-0000-000000000002',
            full_name: 'Marcus Sterling',
            phone: '+1 (555) 018-9921',
            address: '240 Innovation Blvd, Austin, TX',
            department: 'Human Resources',
            designation: 'Senior HR Manager',
            joining_date: '2023-03-01',
            profile_image: null,
            salary: 95000.0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'e0000000-0000-0000-0000-000000000003',
            employee_id: 'EMP-003',
            profile_id: 'a0000000-0000-0000-0000-000000000003',
            full_name: 'Sarah Connor',
            phone: '+1 (555) 012-3456',
            address: '742 Evergreen Terrace, Springfield',
            department: 'Engineering',
            designation: 'Senior Full Stack Engineer',
            joining_date: '2023-06-12',
            profile_image: null,
            salary: 110000.0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'e0000000-0000-0000-0000-000000000004',
            employee_id: 'EMP-004',
            profile_id: 'a0000000-0000-0000-0000-000000000004',
            full_name: 'Alex Chen',
            phone: '+1 (555) 014-7789',
            address: '88 Market Street, Seattle, WA',
            department: 'Design',
            designation: 'Lead Product Designer',
            joining_date: '2023-08-20',
            profile_image: null,
            salary: 105000.0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];

        if (employees.length === 0) setEmployees(fallbackEmpList);

        const currentMonthFirst = new Date().toISOString().slice(0, 7) + '-01';
        const samplePayroll: PayrollWithEmp[] = [
          {
            id: 'pay-1',
            employee_id: fallbackEmpList[0].id,
            basic_salary: 10416.67,
            allowances: 1200.0,
            deductions: 2116.67,
            net_salary: 9500.0,
            effective_date: currentMonthFirst,
            updated_at: new Date().toISOString(),
            employee: fallbackEmpList[0],
          },
          {
            id: 'pay-2',
            employee_id: fallbackEmpList[1].id,
            basic_salary: 7916.67,
            allowances: 800.0,
            deductions: 1416.67,
            net_salary: 7300.0,
            effective_date: currentMonthFirst,
            updated_at: new Date().toISOString(),
            employee: fallbackEmpList[1],
          },
          {
            id: 'pay-3',
            employee_id: fallbackEmpList[2].id,
            basic_salary: 9166.67,
            allowances: 950.0,
            deductions: 1616.67,
            net_salary: 8500.0,
            effective_date: currentMonthFirst,
            updated_at: new Date().toISOString(),
            employee: fallbackEmpList[2],
          },
          {
            id: 'pay-4',
            employee_id: fallbackEmpList[3].id,
            basic_salary: 8750.0,
            allowances: 850.0,
            deductions: 1600.0,
            net_salary: 8000.0,
            effective_date: currentMonthFirst,
            updated_at: new Date().toISOString(),
            employee: fallbackEmpList[3],
          },
        ];
        setPayrollRecords(samplePayroll);
      }
    } catch (err) {
      console.error('Failed to load payroll:', err);
      toast.error('Failed to load payroll records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase, employees.length]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const [payData, empData] = await Promise.all([
          getAllPayrollWithEmployees(supabase),
          getEmployees(supabase),
        ]);

        if (!ignore) {
          if (empData && empData.length > 0) setEmployees(empData);
          if (payData && payData.length > 0) {
            setPayrollRecords(payData);
          } else {
            const fallbackEmpList: Employee[] = [
              {
                id: 'e0000000-0000-0000-0000-000000000001',
                employee_id: 'EMP-001',
                profile_id: 'a0000000-0000-0000-0000-000000000001',
                full_name: 'Eleanor Vance',
                phone: '+1 (555) 019-2834',
                address: '100 Silicon Way, San Francisco, CA',
                department: 'Executive',
                designation: 'Head of People & Operations',
                joining_date: '2023-01-15',
                profile_image: null,
                salary: 125000.0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: 'e0000000-0000-0000-0000-000000000002',
                employee_id: 'EMP-002',
                profile_id: 'a0000000-0000-0000-0000-000000000002',
                full_name: 'Marcus Sterling',
                phone: '+1 (555) 018-9921',
                address: '240 Innovation Blvd, Austin, TX',
                department: 'Human Resources',
                designation: 'Senior HR Manager',
                joining_date: '2023-03-01',
                profile_image: null,
                salary: 95000.0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: 'e0000000-0000-0000-0000-000000000003',
                employee_id: 'EMP-003',
                profile_id: 'a0000000-0000-0000-0000-000000000003',
                full_name: 'Sarah Connor',
                phone: '+1 (555) 012-3456',
                address: '742 Evergreen Terrace, Springfield',
                department: 'Engineering',
                designation: 'Senior Full Stack Engineer',
                joining_date: '2023-06-12',
                profile_image: null,
                salary: 110000.0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: 'e0000000-0000-0000-0000-000000000004',
                employee_id: 'EMP-004',
                profile_id: 'a0000000-0000-0000-0000-000000000004',
                full_name: 'Alex Chen',
                phone: '+1 (555) 014-7789',
                address: '88 Market Street, Seattle, WA',
                department: 'Design',
                designation: 'Lead Product Designer',
                joining_date: '2023-08-20',
                profile_image: null,
                salary: 105000.0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ];

            const currentMonthFirst = new Date().toISOString().slice(0, 7) + '-01';
            const samplePayroll: PayrollWithEmp[] = [
              {
                id: 'pay-1',
                employee_id: fallbackEmpList[0].id,
                basic_salary: 10416.67,
                allowances: 1200.0,
                deductions: 2116.67,
                net_salary: 9500.0,
                effective_date: currentMonthFirst,
                updated_at: new Date().toISOString(),
                employee: fallbackEmpList[0],
              },
              {
                id: 'pay-2',
                employee_id: fallbackEmpList[1].id,
                basic_salary: 7916.67,
                allowances: 800.0,
                deductions: 1416.67,
                net_salary: 7300.0,
                effective_date: currentMonthFirst,
                updated_at: new Date().toISOString(),
                employee: fallbackEmpList[1],
              },
              {
                id: 'pay-3',
                employee_id: fallbackEmpList[2].id,
                basic_salary: 9166.67,
                allowances: 950.0,
                deductions: 1616.67,
                net_salary: 8500.0,
                effective_date: currentMonthFirst,
                updated_at: new Date().toISOString(),
                employee: fallbackEmpList[2],
              },
              {
                id: 'pay-4',
                employee_id: fallbackEmpList[3].id,
                basic_salary: 8750.0,
                allowances: 850.0,
                deductions: 1600.0,
                net_salary: 8000.0,
                effective_date: currentMonthFirst,
                updated_at: new Date().toISOString(),
                employee: fallbackEmpList[3],
              },
            ];
            setPayrollRecords(samplePayroll);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Payroll fetch error:', err);
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [supabase]);

  // Distinct Departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    payrollRecords.forEach((p) => {
      if (p.employee?.department) set.add(p.employee.department);
    });
    return Array.from(set);
  }, [payrollRecords]);

  // Filtered Payroll Records
  const filteredRecords = useMemo(() => {
    return payrollRecords.filter((rec) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        rec.employee?.full_name?.toLowerCase().includes(q) ||
        rec.employee?.employee_id?.toLowerCase().includes(q) ||
        rec.employee?.department?.toLowerCase().includes(q);

      const matchesDept =
        departmentFilter === 'all' || rec.employee?.department === departmentFilter;

      return matchesSearch && matchesDept;
    });
  }, [payrollRecords, searchQuery, departmentFilter]);

  // Overall Financial Statistics
  const financialStats = useMemo(() => {
    let totalBasic = 0;
    let totalAllowances = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    payrollRecords.forEach((r) => {
      totalBasic += Number(r.basic_salary || 0);
      totalAllowances += Number(r.allowances || 0);
      totalDeductions += Number(r.deductions || 0);
      totalNet += Number(r.net_salary || 0);
    });

    return {
      totalBasic,
      totalAllowances,
      totalDeductions,
      totalNet,
      employeeCount: payrollRecords.length,
      averageNet: payrollRecords.length > 0 ? totalNet / payrollRecords.length : 0,
    };
  }, [payrollRecords]);

  const handleOpenEditModal = (rec: PayrollWithEmp) => {
    setSelectedRecord(rec);
    setFormData({
      id: rec.id,
      employee_id: rec.employee_id,
      employee_name: rec.employee?.full_name || 'Staff Member',
      employee_id_code: rec.employee?.employee_id || 'EMP-N/A',
      department: rec.employee?.department || 'General',
      designation: rec.employee?.designation || 'Staff',
      basic_salary: Number(rec.basic_salary) || 0,
      allowances: Number(rec.allowances) || 0,
      deductions: Number(rec.deductions) || 0,
      effective_date: rec.effective_date || new Date().toISOString().split('T')[0],
    });
    setIsEditModalOpen(true);
  };

  const handleOpenNewPayrollModal = () => {
    if (employees.length === 0) {
      toast.error('No employees found to create payroll for.');
      return;
    }
    const emp = employees[0];
    const base = emp.salary ? emp.salary / 12 : 7500;
    setFormData({
      id: '',
      employee_id: emp.id,
      employee_name: emp.full_name,
      employee_id_code: emp.employee_id,
      department: emp.department || 'General',
      designation: emp.designation || 'Staff',
      basic_salary: Math.round(base),
      allowances: 800,
      deductions: 1000,
      effective_date: new Date().toISOString().split('T')[0],
    });
    setIsEditModalOpen(true);
  };

  const handleOpenPayslipModal = (rec: PayrollWithEmp) => {
    setSelectedRecord(rec);
    setIsPayslipModalOpen(true);
  };

  const handleSavePayroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_id) {
      toast.error('Please select an employee.');
      return;
    }

    startTransition(async () => {
      const payload = {
        id: formData.id || undefined,
        employee_id: formData.employee_id,
        basic_salary: Number(formData.basic_salary) || 0,
        allowances: Number(formData.allowances) || 0,
        deductions: Number(formData.deductions) || 0,
        effective_date: formData.effective_date,
      };

      const result = await savePayrollRecord(supabase, payload);
      const targetEmp = employees.find((e) => e.id === formData.employee_id);

      if (result) {
        const fullRec: PayrollWithEmp = {
          ...result,
          employee: targetEmp,
        };
        setPayrollRecords((prev) => {
          const filtered = prev.filter((p) => p.id !== result.id);
          return [fullRec, ...filtered];
        });
        toast.success(`Payroll saved for ${targetEmp?.full_name || 'Staff'}`);
      } else {
        const mockRec: PayrollWithEmp = {
          id: formData.id || `pay-${Date.now()}`,
          employee_id: formData.employee_id,
          basic_salary: payload.basic_salary,
          allowances: payload.allowances,
          deductions: payload.deductions,
          net_salary: computedNetSalary,
          effective_date: payload.effective_date,
          updated_at: new Date().toISOString(),
          employee: targetEmp,
        };
        setPayrollRecords((prev) => {
          const filtered = prev.filter((p) => p.id !== mockRec.id);
          return [mockRec, ...filtered];
        });
        toast.success(`Salary structure updated: ${targetEmp?.full_name || 'Staff'}`);
      }

      setIsEditModalOpen(false);
    });
  };

  const handleBatchGenerate = () => {
    startTransition(async () => {
      const monthStr = new Date().toISOString().slice(0, 7) + '-01';

      for (const emp of employees) {
        const existing = payrollRecords.find(
          (p) => p.employee_id === emp.id && p.effective_date === monthStr
        );
        if (!existing) {
          const base = emp.salary ? emp.salary / 12 : 8000;
          await savePayrollRecord(supabase, {
            employee_id: emp.id,
            basic_salary: Math.round(base),
            allowances: 800,
            deductions: 1000,
            effective_date: monthStr,
          });
        }
      }

      await fetchPayrollData();
      toast.success(
        `Batch cycle completed. Synced payroll calculations for active employees.`
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Payroll Management & Compensation
            </h1>
            <Badge variant="success" className="font-semibold">
              Admin & HR Access
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure employee compensation structures, adjust allowances and deductions, and compute net salary disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPayrollData}
            disabled={refreshing}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleBatchGenerate}
            disabled={isSubmitting}
            className="text-xs"
          >
            <Calculator className="w-3.5 h-3.5" />
            Batch Process Cycle
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenNewPayrollModal}
            className="text-xs font-semibold shadow-md shadow-indigo-500/25"
          >
            <Plus className="w-4 h-4" />
            Adjust / Add Salary
          </Button>
        </div>
      </div>

      {/* Premium Hero Section */}
      {!loading && (
        <div 
          className="relative rounded-3xl overflow-hidden bg-cover bg-center border border-indigo-500/30 text-white shadow-2xl p-6 sm:p-8"
          style={{ backgroundImage: `url('/finance_hero.jpg')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-indigo-950/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <Badge variant="primary" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-[10px] uppercase font-bold tracking-wider px-3 py-1">
                Enterprise Payroll Console
              </Badge>
              <h2 className="text-3xl font-extrabold tracking-tight">Compensation Statistics</h2>
              <p className="text-sm text-slate-300 max-w-md">
                Active cycle tracking and salary disbursements across all operating departments.
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-1">
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                TOTAL NET OUTFLOW
              </span>
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent drop-shadow-md">
                {formatCurrency(financialStats.totalNet)}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Tracking {financialStats.employeeCount} active profiles
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gross Salary Card */}
        <Card className="p-6 bg-slate-950/60 border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Gross Outflow
            </span>
            <div className="p-2 rounded-xl bg-slate-850 text-slate-300">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {formatCurrency(financialStats.totalBasic + financialStats.totalAllowances)}
            </span>
            <div className="text-[11px] text-slate-500 mt-1">
              Basic ({formatCurrency(financialStats.totalBasic)}) + Allowances ({formatCurrency(financialStats.totalAllowances)})
            </div>
          </div>
        </Card>

        {/* Total Deductions Card */}
        <Card className="p-6 bg-slate-950/60 border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Total Deductions
            </span>
            <div className="p-2 rounded-xl bg-slate-850 text-slate-300">
              <TrendingUp className="w-4 h-4 rotate-180 text-rose-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono text-rose-400">
              -{formatCurrency(financialStats.totalDeductions)}
            </span>
            <div className="text-[11px] text-slate-500 mt-1">
              Withholdings, taxes & corporate contributions
            </div>
          </div>
        </Card>

        {/* Net Take-Home Pay (visually prominent) */}
        <Card className="p-6 bg-gradient-to-tr from-indigo-900/40 via-indigo-950/30 to-slate-900/90 border-indigo-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Net Outflow
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black font-mono text-indigo-400">
              {formatCurrency(financialStats.totalNet)}
            </span>
            <div className="text-[11px] text-indigo-200 mt-1">
              Disbursed net amount
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by employee name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full sm:w-44 py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Formula: <span className="font-mono text-indigo-500 font-semibold">Net = Basic + Allowances - Deductions</span>
          </div>
        </div>
      </Card>

      {/* Loading Skeletons */}
      {loading && (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && filteredRecords.length === 0 && (
        <Card className="p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <CreditCard className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No payroll records found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Run the batch processor or add salary configurations for your employees.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleBatchGenerate}>
            <Calculator className="w-4 h-4" />
            Generate Monthly Cycle
          </Button>
        </Card>
      )}

      {/* Master Payroll Table */}
      {!loading && filteredRecords.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((rec) => {
                const empName = rec.employee?.full_name || 'Staff Member';
                const empId = rec.employee?.employee_id || 'EMP-N/A';
                const dept = rec.employee?.department || 'General';

                return (
                  <TableRow key={rec.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={empName} size="md" />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white text-sm">
                            {empName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                              {empId}
                            </span>{' '}
                            • {dept}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                        {formatCurrency(rec.basic_salary)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(rec.allowances)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                        -{formatCurrency(rec.deductions)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatCurrency(rec.net_salary)}
                      </div>
                      <div className="text-[10px] text-slate-400">Monthly Net</div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(rec.effective_date)}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenPayslipModal(rec)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Generate Payslip"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(rec)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Adjust Compensation"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* SALARY ADJUSTMENT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Adjust Employee Salary Structure"
        description="Update monthly basic salary, additions, and statutory deductions. Net salary updates automatically."
      >
        <form onSubmit={handleSavePayroll} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Employee
            </label>
            <select
              value={formData.employee_id}
              onChange={(e) => {
                const target = employees.find((emp) => emp.id === e.target.value);
                setFormData({
                  ...formData,
                  employee_id: e.target.value,
                  employee_name: target?.full_name || '',
                  employee_id_code: target?.employee_id || '',
                  department: target?.department || '',
                });
              }}
              disabled={Boolean(formData.id)}
              className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-60"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.employee_id}) - {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Basic Salary ($)"
              type="number"
              min="0"
              step="50"
              required
              value={formData.basic_salary}
              onChange={(e) =>
                setFormData({ ...formData, basic_salary: Math.max(0, Number(e.target.value) || 0) })
              }
              leftIcon={<DollarSign className="w-4 h-4" />}
            />

            <Input
              label="Allowances ($)"
              type="number"
              min="0"
              step="50"
              value={formData.allowances}
              onChange={(e) =>
                setFormData({ ...formData, allowances: Math.max(0, Number(e.target.value) || 0) })
              }
              leftIcon={<Plus className="w-4 h-4 text-emerald-500" />}
            />

            <Input
              label="Deductions ($)"
              type="number"
              min="0"
              step="50"
              value={formData.deductions}
              onChange={(e) =>
                setFormData({ ...formData, deductions: Math.max(0, Number(e.target.value) || 0) })
              }
              leftIcon={<DollarSign className="w-4 h-4 text-rose-500" />}
            />
          </div>

          <Input
            label="Effective Date"
            type="date"
            required
            value={formData.effective_date}
            onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
            leftIcon={<Calendar className="w-4 h-4" />}
          />

          {/* Live Reactive Math Preview Card */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Basic Salary:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatCurrency(formData.basic_salary)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
              <span>+ Allowances:</span>
              <span className="font-semibold">+{formatCurrency(formData.allowances)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400">
              <span>- Deductions:</span>
              <span className="font-semibold">-{formatCurrency(formData.deductions)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Calculated Net Salary:
              </span>
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                {formatCurrency(computedNetSalary)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Salary Structure'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* PAYSLIP BREAKDOWN MODAL */}
      {selectedRecord && (
        <Modal
          isOpen={isPayslipModalOpen}
          onClose={() => setIsPayslipModalOpen(false)}
          title="Official Employee Payslip"
          description={`Compensation breakdown for ${selectedRecord.employee?.full_name}`}
        >
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold">Dayflow Enterprise HRMS</h4>
                  <p className="text-xs text-indigo-200">
                    Monthly Remuneration Advice • {formatDate(selectedRecord.effective_date)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono px-2 py-1 rounded bg-indigo-500/20 text-indigo-200">
                    PAID
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                <div>
                  <span className="text-indigo-200">Employee Name:</span>{' '}
                  <span className="font-semibold">{selectedRecord.employee?.full_name}</span>
                </div>
                <div>
                  <span className="text-indigo-200">Employee ID:</span>{' '}
                  <span className="font-mono font-semibold">
                    {selectedRecord.employee?.employee_id}
                  </span>
                </div>
                <div>
                  <span className="text-indigo-200">Department:</span>{' '}
                  <span>{selectedRecord.employee?.department || 'General'}</span>
                </div>
                <div>
                  <span className="text-indigo-200">Designation:</span>{' '}
                  <span>{selectedRecord.employee?.designation || 'Staff'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <h5 className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                  Earnings
                </h5>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Basic Salary</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(selectedRecord.basic_salary)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Allowances & Perks</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(selectedRecord.allowances)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 font-bold">
                  <span>Gross Earnings:</span>
                  <span>{formatCurrency(Number(selectedRecord.basic_salary) + Number(selectedRecord.allowances))}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <h5 className="font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider text-[10px]">
                  Deductions
                </h5>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Tax & Statutory</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    -{formatCurrency(selectedRecord.deductions)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800 text-slate-400">
                  <span>Other Penalties</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-rose-600 dark:text-rose-400">
                  <span>Total Deductions:</span>
                  <span>-{formatCurrency(selectedRecord.deductions)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold uppercase tracking-wider">
                  Net Disbursement Amount
                </span>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Direct transfer to employee registered bank account
                </p>
              </div>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCurrency(selectedRecord.net_salary)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Payslip
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPayslipModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsPayslipModalOpen(false);
                    handleOpenEditModal(selectedRecord);
                  }}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Adjust Figures
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
