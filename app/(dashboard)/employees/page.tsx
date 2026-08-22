'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/app-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { Search, Plus, Mail, Phone, MapPin, Calendar, Briefcase, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function EmployeesPage() {
  const { profiles, currentRole, addEmployee } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newEmp, setNewEmp] = useState({
    full_name: '',
    email: '',
    department: 'Engineering',
    job_title: 'Software Engineer',
    role: 'employee' as 'employee' | 'admin',
    phone: '+1 (555) 123-4567',
    address: 'San Francisco, CA',
    emergency_contact_name: 'Emergency Contact',
    emergency_contact_phone: '+1 (555) 987-6543',
  });

  const departments = ['All', 'Engineering', 'Design', 'Product', 'Human Resources'];

  const filteredEmployees = profiles.filter((emp) => {
    const matchesSearch =
      emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.job_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEmployee({
      ...newEmp,
      avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      date_of_joining: new Date().toISOString().split('T')[0],
    });
    setIsAddModalOpen(false);
    setNewEmp({
      full_name: '',
      email: '',
      department: 'Engineering',
      job_title: 'Software Engineer',
      role: 'employee',
      phone: '+1 (555) 123-4567',
      address: 'San Francisco, CA',
      emergency_contact_name: 'Emergency Contact',
      emergency_contact_phone: '+1 (555) 987-6543',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Employee Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View and manage all workforce profiles across organization departments
          </p>
        </div>

        {currentRole === 'admin' && (
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="font-semibold text-xs sm:text-sm">
            <Plus className="w-4 h-4" />
            Add New Employee
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDept === dept
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </Card>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => (
          <Card key={emp.id} className="group hover:border-indigo-500/40 transition-all duration-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={emp.avatar_url} name={emp.full_name} size="lg" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {emp.full_name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {emp.job_title}
                  </p>
                </div>
              </div>
              <Badge variant={emp.role === 'admin' ? 'secondary' : 'neutral'} className="text-[10px]">
                {emp.role === 'admin' ? 'HR Admin' : 'Employee'}
              </Badge>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{emp.department} Department</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{emp.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{emp.phone || '+1 (555) 234-5678'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link href={`/employees/${emp.id}`}>
                <Button variant="ghost" size="sm" className="text-xs text-indigo-600 dark:text-indigo-400">
                  View Full Profile
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        description="Register a new employee profile in the system."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Full Name</label>
            <input
              type="text"
              required
              placeholder="Full Name"
              value={newEmp.full_name}
              onChange={(e) => setNewEmp({ ...newEmp, full_name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Work Email</label>
            <input
              type="email"
              required
              placeholder="employee@dayflow.hr"
              value={newEmp.email}
              onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Department</label>
              <select
                value={newEmp.department}
                onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Job Title</label>
              <input
                type="text"
                required
                value={newEmp.job_title}
                onChange={(e) => setNewEmp({ ...newEmp, job_title: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Role</label>
            <select
              value={newEmp.role}
              onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value as any })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="employee">Standard Employee</option>
              <option value="admin">Admin / HR Officer</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
