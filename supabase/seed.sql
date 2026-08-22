-- Dayflow HRMS - Development Seed Data
-- For testing queries and Phase 1 routes

-- Sample Profiles (Note: In live auth, these link to auth.users.ids)
INSERT INTO public.profiles (id, email, role)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'admin@dayflow.hr', 'admin'),
  ('a0000000-0000-0000-0000-000000000002', 'hr@dayflow.hr', 'hr'),
  ('a0000000-0000-0000-0000-000000000003', 'sarah.connor@dayflow.hr', 'employee'),
  ('a0000000-0000-0000-0000-000000000004', 'alex.chen@dayflow.hr', 'employee')
ON CONFLICT (id) DO NOTHING;

-- Sample Employees
INSERT INTO public.employees (id, employee_id, profile_id, full_name, phone, address, department, designation, joining_date, salary)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'EMP-001', 'a0000000-0000-0000-0000-000000000001', 'Eleanor Vance', '+1 (555) 019-2834', '100 Silicon Way, San Francisco, CA', 'Executive', 'Head of People & Operations', '2023-01-15', 125000.00),
  ('e0000000-0000-0000-0000-000000000002', 'EMP-002', 'a0000000-0000-0000-0000-000000000002', 'Marcus Sterling', '+1 (555) 018-9921', '240 Innovation Blvd, Austin, TX', 'Human Resources', 'Senior HR Manager', '2023-03-01', 95000.00),
  ('e0000000-0000-0000-0000-000000000003', 'EMP-003', 'a0000000-0000-0000-0000-000000000003', 'Sarah Connor', '+1 (555) 012-3456', '742 Evergreen Terrace, Springfield', 'Engineering', 'Senior Full Stack Engineer', '2023-06-12', 110000.00),
  ('e0000000-0000-0000-0000-000000000004', 'EMP-004', 'a0000000-0000-0000-0000-000000000004', 'Alex Chen', '+1 (555) 014-7789', '88 Market Street, Seattle, WA', 'Design', 'Lead Product Designer', '2023-08-20', 105000.00)
ON CONFLICT (id) DO NOTHING;

-- Sample Attendance
INSERT INTO public.attendance (id, employee_id, date, check_in, check_out, status)
VALUES
  (gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', CURRENT_DATE, NOW() - INTERVAL '4 hours', NULL, 'present'),
  (gen_random_uuid(), 'e0000000-0000-0000-0000-000000000004', CURRENT_DATE, NOW() - INTERVAL '3 hours 30 minutes', NULL, 'present')
ON CONFLICT DO NOTHING;

-- Sample Leave Requests
INSERT INTO public.leave_requests (id, employee_id, leave_type, start_date, end_date, remarks, status)
VALUES
  (gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', 'annual', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '10 days', 'Family vacation', 'pending')
ON CONFLICT DO NOTHING;

-- Sample Payroll
INSERT INTO public.payroll (id, employee_id, basic_salary, allowances, deductions, net_salary, effective_date)
VALUES
  (gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', 9166.67, 800.00, 1966.67, 8000.00, DATE_TRUNC('month', CURRENT_DATE)::DATE),
  (gen_random_uuid(), 'e0000000-0000-0000-0000-000000000004', 8750.00, 750.00, 1800.00, 7700.00, DATE_TRUNC('month', CURRENT_DATE)::DATE)
ON CONFLICT DO NOTHING;
