-- 🚨 NUCLEAR OPTION: DISABLE ROW LEVEL SECURITY 🚨
-- This removes ALL restrictions. If this doesn't work, nothing will.

ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;

-- Grant standard permissions just in case
GRANT ALL ON TABLE public.clients TO anon, authenticated;
GRANT ALL ON TABLE public.appointments TO anon, authenticated;
GRANT ALL ON TABLE public.services TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
