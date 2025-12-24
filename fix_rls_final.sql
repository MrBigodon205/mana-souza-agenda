-- 1. Grant base permissions (in case they were missing)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.clients TO anon, authenticated;
GRANT ALL ON TABLE public.appointments TO anon, authenticated;
GRANT ALL ON TABLE public.services TO anon, authenticated;

-- 2. Enable RLS (just to be safe)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 3. Drop ALL existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Allow public insert clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow public read appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public Select Clients" ON public.clients;
DROP POLICY IF EXISTS "Public Insert Clients" ON public.clients;
DROP POLICY IF EXISTS "Public Update Clients" ON public.clients;
DROP POLICY IF EXISTS "Public Select Appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public Insert Appointments" ON public.appointments;

-- 4. Create FULL Public Access Policies (Clients)
CREATE POLICY "Public Select Clients" 
ON public.clients FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Public Insert Clients" 
ON public.clients FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Public Update Clients" 
ON public.clients FOR UPDATE 
TO anon, authenticated 
USING (true);

-- 5. Create FULL Public Access Policies (Appointments)
CREATE POLICY "Public Select Appointments" 
ON public.appointments FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Public Insert Appointments" 
ON public.appointments FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 6. Ensure Services are readable
CREATE POLICY "Public Select Services" 
ON public.services FOR SELECT 
TO anon, authenticated 
USING (true);
