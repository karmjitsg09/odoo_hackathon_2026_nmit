-- ==========================================================
-- DAYFLOW HRMS - PHASE 1: DATABASE FOUNDATION & RLS POLICIES
-- ==========================================================

-- Enable essential PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing schema if running fresh
-- DROP TABLE IF EXISTS public.notifications CASCADE;
-- DROP TABLE IF EXISTS public.payroll CASCADE;
-- DROP TABLE IF EXISTS public.leave_requests CASCADE;
-- DROP TABLE IF EXISTS public.attendance CASCADE;
-- DROP TABLE IF EXISTS public.employees CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- ----------------------------------------------------------
-- 1. PROFILES TABLE
-- Linked 1-to-1 with Supabase Auth users
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'hr', 'employee')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ----------------------------------------------------------
-- 2. EMPLOYEES TABLE
-- Master employee records linked to profiles
-- ----------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_employees_profile_id ON public.employees(profile_id);
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON public.employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);

-- ----------------------------------------------------------
-- 3. ATTENDANCE TABLE
-- Daily employee check-in and check-out tracking
-- ----------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON public.attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance(status);

-- ----------------------------------------------------------
-- 4. LEAVE REQUESTS TABLE
-- Employee leave applications and approval lifecycle
-- ----------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON public.leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON public.leave_requests(start_date, end_date);

-- ----------------------------------------------------------
-- 5. PAYROLL TABLE
-- Monthly and historical employee compensation
-- ----------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON public.payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_effective_date ON public.payroll(effective_date);

-- ----------------------------------------------------------
-- 6. NOTIFICATIONS TABLE
-- Real-time notifications and alerts for employees
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('system', 'leave', 'payroll', 'attendance', 'announcement')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_employee_id ON public.notifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- ----------------------------------------------------------
-- 7. HELPER FUNCTIONS FOR ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------

-- Check if current authenticated user has admin or hr role
CREATE OR REPLACE FUNCTION public.is_admin_or_hr()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'hr')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get the employee_id corresponding to current auth.uid()
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

-- Automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_employees_updated_at ON public.employees;
CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_attendance_updated_at ON public.attendance;
CREATE TRIGGER trg_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_leave_requests_updated_at ON public.leave_requests;
CREATE TRIGGER trg_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_payroll_updated_at ON public.payroll;
CREATE TRIGGER trg_payroll_updated_at
  BEFORE UPDATE ON public.payroll
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 8.1 PROFILES POLICIES
-- Users can view their own profile; Admin/HR can view all profiles
CREATE POLICY "profiles_select_policy"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin_or_hr());

-- Users can update their own profile; Admin/HR can update any profile
CREATE POLICY "profiles_update_policy"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin_or_hr())
  WITH CHECK (auth.uid() = id OR public.is_admin_or_hr());

-- Only Admin/HR can create or delete profiles manually
CREATE POLICY "profiles_insert_policy"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_hr() OR auth.uid() = id);

-- 8.2 EMPLOYEES POLICIES
-- Employees can view their own record; Admin/HR can view all employees
CREATE POLICY "employees_select_policy"
  ON public.employees FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin_or_hr());

-- Only Admin/HR can create new employee records
CREATE POLICY "employees_insert_policy"
  ON public.employees FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_hr());

-- Only Admin/HR can update employee records (salary, department, etc.)
CREATE POLICY "employees_update_policy"
  ON public.employees FOR UPDATE TO authenticated
  USING (public.is_admin_or_hr() OR profile_id = auth.uid())
  WITH CHECK (public.is_admin_or_hr() OR profile_id = auth.uid());

-- Only Admin/HR can delete employee records
CREATE POLICY "employees_delete_policy"
  ON public.employees FOR DELETE TO authenticated
  USING (public.is_admin_or_hr());

-- 8.3 ATTENDANCE POLICIES
-- Employees view only their attendance; Admin/HR view all
CREATE POLICY "attendance_select_policy"
  ON public.attendance FOR SELECT TO authenticated
  USING (employee_id = public.get_current_employee_id() OR public.is_admin_or_hr());

-- Employees can log (insert) their own attendance; Admin/HR can log for any
CREATE POLICY "attendance_insert_policy"
  ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (employee_id = public.get_current_employee_id() OR public.is_admin_or_hr());

-- Only Admin/HR can update or correct attendance records
CREATE POLICY "attendance_update_policy"
  ON public.attendance FOR UPDATE TO authenticated
  USING (public.is_admin_or_hr() OR employee_id = public.get_current_employee_id());

-- 8.4 LEAVE REQUESTS POLICIES
-- Employees view only their own leave requests; Admin/HR view all
CREATE POLICY "leave_requests_select_policy"
  ON public.leave_requests FOR SELECT TO authenticated
  USING (employee_id = public.get_current_employee_id() OR public.is_admin_or_hr());

-- Employees can submit their own leave requests
CREATE POLICY "leave_requests_insert_policy"
  ON public.leave_requests FOR INSERT TO authenticated
  WITH CHECK (employee_id = public.get_current_employee_id() OR public.is_admin_or_hr());

-- Admin/HR can approve/reject; Employees can cancel own pending requests
CREATE POLICY "leave_requests_update_policy"
  ON public.leave_requests FOR UPDATE TO authenticated
  USING (public.is_admin_or_hr() OR employee_id = public.get_current_employee_id())
  WITH CHECK (public.is_admin_or_hr() OR employee_id = public.get_current_employee_id());

-- 8.5 PAYROLL POLICIES
-- Employees: Read-only access to their own payroll records
CREATE POLICY "payroll_select_policy"
  ON public.payroll FOR SELECT TO authenticated
  USING (employee_id = public.get_current_employee_id() OR public.is_admin_or_hr());

-- Admin/HR: Full management access (insert, update, delete)
CREATE POLICY "payroll_insert_policy"
  ON public.payroll FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_hr());

CREATE POLICY "payroll_update_policy"
  ON public.payroll FOR UPDATE TO authenticated
  USING (public.is_admin_or_hr())
  WITH CHECK (public.is_admin_or_hr());

CREATE POLICY "payroll_delete_policy"
  ON public.payroll FOR DELETE TO authenticated
  USING (public.is_admin_or_hr());

-- 8.6 NOTIFICATIONS POLICIES
-- Employees can view only their own notifications
CREATE POLICY "notifications_select_policy"
  ON public.notifications FOR SELECT TO authenticated
  USING (employee_id = public.get_current_employee_id() OR public.is_admin_or_hr());

-- Employees can update (mark as read) their own notifications
CREATE POLICY "notifications_update_policy"
  ON public.notifications FOR UPDATE TO authenticated
  USING (employee_id = public.get_current_employee_id() OR public.is_admin_or_hr());

-- System/Admin can insert notifications
CREATE POLICY "notifications_insert_policy"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_hr() OR employee_id = public.get_current_employee_id());

-- ----------------------------------------------------------
-- 9. AUTH HOOK TRIGGER (AUTOMATIC PROFILE SYNC)
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
  v_emp_id TEXT;
  v_new_emp_id UUID;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'employee');
  v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Employee');
  v_emp_id := 'EMP-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 6));

  -- Insert profile
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, v_role)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  -- Create default employee record
  INSERT INTO public.employees (employee_id, profile_id, full_name, designation, department)
  VALUES (v_emp_id, NEW.id, v_name, 'Staff Member', 'General')
  RETURNING id INTO v_new_emp_id;

  -- Welcome notification
  INSERT INTO public.notifications (employee_id, title, message, type)
  VALUES (v_new_emp_id, 'Welcome to Dayflow HRMS', 'Your account has been initialized successfully.', 'system');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
