'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import {
  CreditCard,
  Plus,
  FileText,
  DollarSign,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { PayrollRecord } from '@/lib/types';
import { toast } from 'sonner';

export default function PayrollPage() {
  const {
    payrollRecords,
    currentUser,
    currentRole,
    generatePayrollBatch,
    updatePayrollStatus,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  const displayRecords = payrollRecords.filter((r) => {
    const isRoleMatch = currentRole === 'admin' ? true : r.user_id === currentUser.id;
    const isMonthMatch = !selectedMonth || r.month === selectedMonth;
    return isRoleMatch && isMonthMatch;
  });

  const totalMonthlyPayroll = displayRecords.reduce((acc, r) => acc + r.net_salary, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Payroll & Payslips
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {currentRole === 'admin'
              ? 'Manage monthly workforce compensation, process salary batches, and review itemized payslips'
              : 'View your monthly compensation details, net pay breakdown, and official payslips'}
          </p>
        </div>

        {currentRole === 'admin' && (
          <Button
            variant="primary"
            onClick={() => generatePayrollBatch(selectedMonth)}
            className="font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Generate Batch Payroll ({selectedMonth})
          </Button>
        )}
      </div>

      {/* Hero Overview */}
      <Card className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-purple-500/20 text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">
              {selectedMonth} Compensation Summary
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              ${totalMonthlyPayroll.toLocaleString()} USD
            </h2>
            <p className="text-xs text-purple-200 mt-1">
              Total Net Salary Disbursement across {displayRecords.length} record(s)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none"
            />
          </div>
        </div>
      </Card>

      {/* Payroll Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">
              {currentRole === 'admin' ? 'Monthly Payroll Statements' : 'Your Payslip History'}
            </CardTitle>
            <CardDescription>Itemized base salary, allowances, deductions, and payment status</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                  {currentRole === 'admin' && <th className="py-3 px-4">Employee</th>}
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Base Salary</th>
                  <th className="py-3 px-4">Allowances</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Salary</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-500">
                      No payroll statements found for {selectedMonth}.
                    </td>
                  </tr>
                ) : (
                  displayRecords.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      {currentRole === 'admin' && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar src={pay.user_avatar} name={pay.user_name || 'Employee'} size="sm" />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{pay.user_name}</p>
                              <p className="text-[10px] text-slate-400">{pay.user_department}</p>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="py-3 px-4 font-semibold">{pay.month}</td>
                      <td className="py-3 px-4">${pay.base_salary.toLocaleString()}</td>
                      <td className="py-3 px-4 text-emerald-600 font-medium">+${pay.allowances.toLocaleString()}</td>
                      <td className="py-3 px-4 text-rose-500 font-medium">-${pay.deductions.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                        ${pay.net_salary.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {currentRole === 'admin' ? (
                          <select
                            value={pay.payment_status}
                            onChange={(e) => updatePayrollStatus(pay.id, e.target.value as any)}
                            className="px-2 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                          >
                            <option value="pending">Pending</option>
                            <option value="processed">Processed</option>
                            <option value="paid">Paid</option>
                          </select>
                        ) : (
                          <Badge
                            variant={
                              pay.payment_status === 'paid'
                                ? 'success'
                                : pay.payment_status === 'processed'
                                ? 'secondary'
                                : 'warning'
                            }
                            className="capitalize"
                          >
                            {pay.payment_status}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPayslip(pay)}
                          className="text-xs text-indigo-600 dark:text-indigo-400"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Payslip
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Official Payslip View Modal */}
      <Modal
        isOpen={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        title="Official Salary Statement / Payslip"
        description={`Payslip reference statement for ${selectedPayslip?.month}`}
      >
        {selectedPayslip && (
          <div className="space-y-6">
            {/* Printable Payslip Sheet */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-6 text-slate-900 dark:text-slate-100">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <span className="text-xl font-extrabold tracking-tight">Dayflow HRMS</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">100 Innovation Way, San Francisco, CA</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-xs uppercase">
                    Payslip Statement
                  </Badge>
                  <p className="text-xs font-mono text-slate-400 mt-1">REF: #{selectedPayslip.id}</p>
                </div>
              </div>

              {/* Employee & Pay Period Details */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl">
                <div>
                  <p className="text-slate-500 font-medium">Employee Name:</p>
                  <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{selectedPayslip.user_name}</p>
                  <p className="text-slate-400">{selectedPayslip.user_job_title} ({selectedPayslip.user_department})</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 font-medium">Pay Period:</p>
                  <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{selectedPayslip.month}</p>
                  <p className="text-slate-400">Payment Status: <span className="uppercase font-semibold text-emerald-600">{selectedPayslip.payment_status}</span></p>
                </div>
              </div>

              {/* Itemized Calculation */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold uppercase text-slate-500 tracking-wider">Salary Breakdown</h4>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800">
                  <div className="py-2.5 flex justify-between">
                    <span>Base Monthly Salary</span>
                    <span className="font-semibold">${selectedPayslip.base_salary.toLocaleString()} USD</span>
                  </div>
                  <div className="py-2.5 flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>HRA & Special Allowances</span>
                    <span className="font-semibold">+${selectedPayslip.allowances.toLocaleString()} USD</span>
                  </div>
                  <div className="py-2.5 flex justify-between text-rose-500">
                    <span>Tax & Statutory Deductions</span>
                    <span className="font-semibold">-${selectedPayslip.deductions.toLocaleString()} USD</span>
                  </div>
                </div>

                <div className="pt-3 flex justify-between items-center text-sm font-extrabold bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-xl">
                  <span>Net Salary Payable</span>
                  <span className="text-indigo-600 dark:text-indigo-400 text-lg">
                    ${selectedPayslip.net_salary.toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </Button>
              <Button type="button" variant="primary" onClick={() => setSelectedPayslip(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
