-- Allow anonymous users (public) to insert into clients table (for booking)
CREATE POLICY "Allow public insert clients" 
ON public.clients 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Allow anonymous users to view their own client data (optional, but good for confirmation)
-- Note: Limiting this is hard without auth, so standard practice for public bookings 
-- is often just INSERT permission, or strict lookup by some ID returned.
-- For now, just INSERT is critical.

-- Allow anonymous users to insert into appointments
CREATE POLICY "Allow public insert appointments" 
ON public.appointments 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow anonymous users to SELECT appointments to check availability (read-only)
-- This might already exist, but ensuring it ensures the calendar works for anon users
CREATE POLICY "Allow public read appointments" 
ON public.appointments 
FOR SELECT 
TO anon 
USING (true);

-- Allow anonymous users to SELECT services (already likely true, but ensuring)
CREATE POLICY "Allow public read services" 
ON public.services 
FOR SELECT 
TO anon 
USING (true);
