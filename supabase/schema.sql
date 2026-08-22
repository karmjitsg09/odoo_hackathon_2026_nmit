-- ==========================================================
-- DAYFLOW HRMS - SUPABASE POSTGRESQL DATABASE SCHEMA & SEED
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------
-- 1. PROFILES TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')) DEFAULT 'employee',
  job_title TEXT DEFAULT 'Software Engineer',
  department TEXT DEFAULT 'Engineering',
  phone TEXT,
  address TEXT,
  date_of_joining DATE DEFAULT CURRENT_DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 2. ATTENDANCE TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  work_hours NUMERIC(4, 2) DEFAULT 0,
  status TEXT CHECK (status IN ('present', 'late', 'half_day', 'absent')) DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ----------------------------------------------------------
-- 3. LEAVE REQUESTS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('casual', 'sick', 'annual', 'unpaid')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC(4, 1) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  review_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 4. LEAVE BALANCES TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  casual_leave NUMERIC(4, 1) DEFAULT 12.0,
  sick_leave NUMERIC(4, 1) DEFAULT 10.0,
  annual_leave NUMERIC(4, 1) DEFAULT 15.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, year)
);

-- ----------------------------------------------------------
-- 5. PAYROLL TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: YYYY-MM
  base_salary NUMERIC(10, 2) NOT NULL,
  allowances NUMERIC(10, 2) DEFAULT 0.0,
  deductions NUMERIC(10, 2) DEFAULT 0.0,
  net_salary NUMERIC(10, 2) NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('pending', 'processed', 'paid')) DEFAULT 'pending',
  payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- ----------------------------------------------------------
-- 6. NOTIFICATIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('leave', 'payroll', 'attendance', 'system')) DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated users can read profiles; admins edit all; users edit own contact fields
CREATE POLICY "Public profiles viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile contact info"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Attendance: Employees view/insert own; Admins full access
CREATE POLICY "Users can view own attendance"
  ON public.attendance FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can insert own attendance"
  ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update attendance"
  ON public.attendance FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Leave Requests: Users view/insert own; Admins view all and update status
CREATE POLICY "Users can view own leave requests"
  ON public.leave_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can apply for leave"
  ON public.leave_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update leave requests"
  ON public.leave_requests FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Payroll: Users view own; Admins full access
CREATE POLICY "Users view own payroll"
  ON public.payroll FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins manage payroll"
  ON public.payroll FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Notifications: Users view/update own notifications
CREATE POLICY "Users manage own notifications"
  ON public.notifications FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------
-- AUTOMATED USER CREATION TRIGGER
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Employee'),
    COALESCE(new.raw_user_meta_data->>'role', 'employee')
  );

  INSERT INTO public.leave_balances (user_id, year)
  VALUES (new.id, EXTRACT(YEAR FROM CURRENT_DATE));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
