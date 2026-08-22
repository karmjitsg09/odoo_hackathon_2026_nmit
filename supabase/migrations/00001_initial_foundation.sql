-- Migration: 00001_initial_foundation.sql
-- Description: Creates initial tables, foreign keys, RLS policies, and triggers for Dayflow HRMS

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'hr', 'employee')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT UNIQUE NOT NULL,
  profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  department TEXT,
  designation TEXT,
  joining_date DATE DEFAULT CURRENT_DATE,
  profile_image TEXT,
  salary NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'on_leave')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- 4. Leave Requests Table
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('casual', 'sick', 'annual', 'unpaid', 'maternity', 'paternity')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  remarks TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Payroll Table
CREATE TABLE IF NOT EXISTS public.payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  basic_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  allowances NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  deductions NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  net_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  effective_date DATE NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('system', 'leave', 'payroll', 'attendance', 'announcement')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Helper Functions
CREATE OR REPLACE FUNCTION public.is_admin_or_hr()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'hr')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_current_employee_id()
RETURNS UUID AS $$
DECLARE
  emp_id UUID;
BEGIN
  SELECT id INTO emp_id FROM public.employees
  WHERE profile_id = auth.uid()
  LIMIT 1;
  RETURN emp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin_or_hr());
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin_or_hr());

-- Employees Policies
CREATE POLICY "employees_select_policy" ON public.employees FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "employees_manage_policy" ON public.employees FOR ALL TO authenticated
  USING (public.is_admin_or_hr());

-- Attendance Policies
CREATE POLICY "attendance_select_policy" ON public.attendance FOR SELECT TO authenticated
  USING (employee_id = public.get_current_employee_id() OR public.is_admin_or_hr());
CREATE POLICY "attendance_insert_policy" ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (employee_id = public.get_current_employee_id() OR public.is_admin_or_hr());
CREATE POLICY "attendance_admin_policy" ON public.attendance FOR UPDATE TO authenticated
  USING (public.is_admin_or_hr());

-- Leave Policies
CREATE POLICY "leave_select_policy" ON public.leave_requests FOR SELECT TO authenticated
  USING (employee_id = public.get_current_employee_id() OR public.is_admin_or_hr());
CREATE POLICY "leave_insert_policy" ON public.leave_requests FOR INSERT TO authenticated
  WITH CHECK (employee_id = public.get_current_employee_id() OR public.is_admin_or_hr());
CREATE POLICY "leave_update_policy" ON public.leave_requests FOR UPDATE TO authenticated
  USING (public.is_admin_or_hr() OR employee_id = public.get_current_employee_id());

-- Payroll Policies (Employee READ-ONLY, Admin ALL)
CREATE POLICY "payroll_select_policy" ON public.payroll FOR SELECT TO authenticated
  USING (employee_id = public.get_current_employee_id() OR public.is_admin_or_hr());
CREATE POLICY "payroll_manage_policy" ON public.payroll FOR ALL TO authenticated
  USING (public.is_admin_or_hr());

-- Notifications Policies
CREATE POLICY "notifications_select_policy" ON public.notifications FOR SELECT TO authenticated
  USING (employee_id = public.get_current_employee_id() OR public.is_admin_or_hr());
CREATE POLICY "notifications_update_policy" ON public.notifications FOR UPDATE TO authenticated
  USING (employee_id = public.get_current_employee_id() OR public.is_admin_or_hr());
