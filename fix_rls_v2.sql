-- 1. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public insert clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow public read appointments" ON public.appointments;

-- 2. Re-create policies for CLIENTS
CREATE POLICY "Allow public insert clients" 
ON public.clients 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- 3. Re-create policies for APPOINTMENTS
CREATE POLICY "Allow public insert appointments" 
ON public.appointments 
FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Allow public read appointments" 
ON public.appointments 
FOR SELECT 
TO anon 
USING (true);

-- 4. Enable RLS (just to be sure)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
