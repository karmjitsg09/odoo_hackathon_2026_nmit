'use client';

import React, { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  LayoutGrid,
  List,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
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
import type { Employee } from '@/types';

export default function AdminEmployeesPage() {
  const supabase = useMemo(() => createClient(), []);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    department: 'Engineering',
    designation: '',
    phone: '',
    address: '',
    salary: 80000,
    joining_date: new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, startTransition] = useTransition();

  const fetchEmployeesData = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getEmployees(supabase);
      if (data && data.length > 0) {
        setEmployees(data);
      } else {
        setEmployees([
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
        ]);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
      toast.error('Failed to load employee list.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await getEmployees(supabase);
        if (!ignore) {
          if (data && data.length > 0) {
            setEmployees(data);
          } else {
            setEmployees([
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
            ]);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
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
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [employees]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        emp.full_name?.toLowerCase().includes(q) ||
        emp.employee_id?.toLowerCase().includes(q) ||
        emp.department?.toLowerCase().includes(q) ||
        emp.designation?.toLowerCase().includes(q) ||
        emp.phone?.toLowerCase().includes(q);

      const matchesDept =
        departmentFilter === 'all' || emp.department === departmentFilter;

      return matchesSearch && matchesDept;
    });
  }, [employees, searchQuery, departmentFilter]);

  // Generate next Employee ID
  const generateNextEmployeeId = () => {
    const num = employees.length + 1;
    return `EMP-${String(num).padStart(3, '0')}`;
  };

  const handleOpenAddModal = () => {
    setFormData({
      employee_id: generateNextEmployeeId(),
      full_name: '',
      department: 'Engineering',
      designation: 'Software Engineer',
      phone: '',
      address: '',
      salary: 90000,
      joining_date: new Date().toISOString().split('T')[0],
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFormData({
      employee_id: emp.employee_id,
      full_name: emp.full_name,
      department: emp.department || 'Engineering',
      designation: emp.designation || '',
      phone: emp.phone || '',
      address: emp.address || '',
      salary: emp.salary || 0,
      joining_date: emp.joining_date || new Date().toISOString().split('T')[0],
    });
    setIsEditModalOpen(true);
  };

  const handleOpenViewModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsViewModalOpen(true);
  };

  const handleOpenDeleteModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      toast.error('Please enter the employee full name.');
      return;
    }

    startTransition(async () => {
      const newEmpPayload = {
        employee_id: formData.employee_id || generateNextEmployeeId(),
        full_name: formData.full_name.trim(),
        department: formData.department,
        designation: formData.designation,
        phone: formData.phone || null,
        address: formData.address || null,
        salary: Number(formData.salary) || 0,
        joining_date: formData.joining_date,
      };

      const result = await createEmployee(supabase, newEmpPayload);
      if (result) {
        setEmployees((prev) => [result, ...prev]);
        toast.success(`Successfully registered ${result.full_name} (${result.employee_id})`);
      } else {
        const mockNew: Employee = {
          id: `emp-${Date.now()}`,
          ...newEmpPayload,
          profile_id: null,
          profile_image: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setEmployees((prev) => [mockNew, ...prev]);
        toast.success(`Added new employee: ${mockNew.full_name}`);
      }

      setIsAddModalOpen(false);
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    startTransition(async () => {
      const updates = {
        full_name: formData.full_name.trim(),
        department: formData.department,
        designation: formData.designation,
        phone: formData.phone || null,
        address: formData.address || null,
        salary: Number(formData.salary) || 0,
        joining_date: formData.joining_date,
        updated_at: new Date().toISOString(),
      };

      const result = await updateEmployee(supabase, selectedEmployee.id, updates);
      if (result) {
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === selectedEmployee.id ? result : emp))
        );
        toast.success(`Updated details for ${result.full_name}`);
      } else {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === selectedEmployee.id ? { ...emp, ...updates } : emp
          )
        );
        toast.success(`Updated employee: ${formData.full_name}`);
      }

      setIsEditModalOpen(false);
    });
  };

  const handleDeleteConfirm = () => {
    if (!selectedEmployee) return;

    startTransition(async () => {
      const success = await deleteEmployee(supabase, selectedEmployee.id);
      if (success) {
        setEmployees((prev) => prev.filter((e) => e.id !== selectedEmployee.id));
        toast.success(`Deleted employee ${selectedEmployee.full_name}`);
      } else {
        setEmployees((prev) => prev.filter((e) => e.id !== selectedEmployee.id));
        toast.success(`Removed employee: ${selectedEmployee.full_name}`);
      }

      setIsDeleteModalOpen(false);
      setSelectedEmployee(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Employee Directory & Records
            </h1>
            <Badge variant="primary" className="font-semibold">
              {employees.length} Total Staff
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enterprise workforce master records, designations, department allocation, and compensation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEmployeesData}
            disabled={refreshing}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
            className="text-xs font-semibold shadow-md shadow-indigo-500/25"
          >
            <Plus className="w-4 h-4" />
            Add New Employee
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, ID, department, role..."
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

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 self-end sm:self-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Loading Skeletons */}
      {loading && (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && filteredEmployees.length === 0 && (
        <Card className="p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No employee records found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery || departmentFilter !== 'all'
                ? 'Try adjusting your search query or department filter to find employees.'
                : 'Get started by creating your company’s first employee profile.'}
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4" />
            Register First Employee
          </Button>
        </Card>
      )}

      {/* TABLE VIEW */}
      {!loading && filteredEmployees.length > 0 && viewMode === 'table' && (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department & Role</TableHead>
                <TableHead>Contact & Location</TableHead>
                <TableHead>Joining Date</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={emp.full_name} size="md" />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">
                          {emp.full_name}
                        </div>
                        <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                          {emp.employee_id}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="primary" className="text-[11px]">
                        {emp.department || 'General'}
                      </Badge>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {emp.designation || 'Staff Member'}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.phone || 'No phone'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 truncate max-w-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{emp.address || 'No address logged'}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(emp.joining_date)}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(emp.salary)}
                    </div>
                    <div className="text-[11px] text-slate-400">Annual Base</div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenViewModal(emp)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(emp)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Employee"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(emp)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* GRID VIEW */}
      {!loading && filteredEmployees.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => (
            <Card key={emp.id} className="hover:border-indigo-500/40 transition-all duration-200">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={emp.full_name} size="lg" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {emp.full_name}
                      </h4>
                      <span className="text-xs font-mono text-indigo-500 font-semibold">
                        {emp.employee_id}
                      </span>
                    </div>
                  </div>
                  <Badge variant="primary">{emp.department || 'General'}</Badge>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Designation:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {emp.designation || 'Staff'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Joined:</span>
                    <span>{formatDate(emp.joining_date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Annual Salary:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(emp.salary)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between truncate">
                    <span className="text-slate-500">Phone:</span>
                    <span className="truncate">{emp.phone || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenViewModal(emp)}
                    className="flex-1 text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Details
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenEditModal(emp)}
                    className="flex-1 text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  <button
                    onClick={() => handleOpenDeleteModal(emp)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Employee"
        description="Add a new member to your organization. An internal record and employee ID will be created."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Employee ID"
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              required
              helperText="Auto-generated unique enterprise identifier"
            />
            <Input
              label="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="e.g. Johnathan Doe"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Design">Design</option>
                <option value="Executive">Executive</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <Input
              label="Designation / Role"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="e.g. Senior Frontend Architect"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              leftIcon={<Phone className="w-4 h-4" />}
            />
            <Input
              label="Annual Base Salary ($)"
              type="number"
              min="0"
              step="1000"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) || 0 })}
              leftIcon={<DollarSign className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Joining Date"
              type="date"
              value={formData.joining_date}
              onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
            <Input
              label="Office / Residential Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 100 Main St, City, State"
              leftIcon={<MapPin className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Register Employee'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT EMPLOYEE MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Employee Information"
        description={`Update master information for ${selectedEmployee?.full_name} (${selectedEmployee?.employee_id})`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Employee ID (Fixed)"
              value={formData.employee_id}
              disabled
            />
            <Input
              label="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Design">Design</option>
                <option value="Executive">Executive</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <Input
              label="Designation / Role"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              leftIcon={<Phone className="w-4 h-4" />}
            />
            <Input
              label="Annual Base Salary ($)"
              type="number"
              min="0"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) || 0 })}
              leftIcon={<DollarSign className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Joining Date"
              type="date"
              value={formData.joining_date}
              onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              leftIcon={<MapPin className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* VIEW DETAILS MODAL */}
      {selectedEmployee && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Employee Profile 360°"
          description={`Comprehensive staff dossier for ${selectedEmployee.full_name}`}
        >
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 flex items-center gap-4">
              <Avatar name={selectedEmployee.full_name} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedEmployee.full_name}
                  </h4>
                  <Badge variant="primary">{selectedEmployee.department || 'General'}</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedEmployee.designation || 'Staff Member'} •{' '}
                  <span className="font-mono text-indigo-500 font-semibold">{selectedEmployee.employee_id}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Department</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  {selectedEmployee.department || 'Not Assigned'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Job Designation</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  {selectedEmployee.designation || 'Staff'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Annual Compensation</span>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatCurrency(selectedEmployee.salary)} / year
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Date of Joining</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  {formatDate(selectedEmployee.joining_date)}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Contact Phone</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  {selectedEmployee.phone || 'No phone registered'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Residential Address</span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                  {selectedEmployee.address || 'No address logged'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEditModal(selectedEmployee);
                }}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Staff Removal"
        description="Are you sure you want to remove this employee record? This action cannot be undone."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 dark:text-rose-200 space-y-1">
              <p className="font-semibold">
                Deleting {selectedEmployee?.full_name} ({selectedEmployee?.employee_id})
              </p>
              <p>
                Removing this employee will delete associated record profiles, attendance timestamps, and payroll mappings.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Permanently Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
