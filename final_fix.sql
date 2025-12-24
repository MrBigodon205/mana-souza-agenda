-- SCRIPT DE CORREÇÃO GERAL FINAL
-- RODE ESTE SCRIPT COMPLETO NO SUPABASE PARA CORRIGIR TODOS OS ERROS

-- 1. GARANTIR TABELA DE CLIENTES ATUALIZADA
ALTER TABLE clients ADD COLUMN IF NOT EXISTS cpf text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rg text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS birth_date date;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS profession text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email text; 
ALTER TABLE clients ADD COLUMN IF NOT EXISTS how_found_us text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lgpd_accepted_at timestamptz;

-- 2. GARANTIR TABELA DE ANAMNESE (CORRIGE ERRO AO SALVAR)
CREATE TABLE IF NOT EXISTS anamnesis (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    updated_at timestamptz DEFAULT now(),
    pregnant boolean DEFAULT false, 
    pregnant_weeks text, 
    breastfeeding boolean DEFAULT false, 
    oncology_treatment boolean DEFAULT false, 
    allergies boolean DEFAULT false,
    allergies_details text, 
    wearing_mascara boolean DEFAULT false,
    recent_eye_procedure boolean DEFAULT false,
    sleep_side text, 
    thyroid_problems boolean DEFAULT false,
    eye_problems boolean DEFAULT false,
    contact_lenses boolean DEFAULT false,
    allergy_henna boolean DEFAULT false,
    allergy_lead boolean DEFAULT false, 
    hair_loss boolean DEFAULT false, 
    hair_loss_degree text, 
    skin_sensitivity boolean DEFAULT false, 
    oily_skin boolean DEFAULT false, 
    other_problems boolean DEFAULT false,
    other_problems_details text,
    term_accepted boolean GENERATED ALWAYS AS (true) STORED 
);

-- Permissões da Anamnese
ALTER TABLE anamnesis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access anamnesis" ON anamnesis;
CREATE POLICY "Admin full access anamnesis" ON anamnesis FOR ALL USING (auth.role() = 'authenticated');

-- 3. GARANTIR TABELA DE GASTOS
CREATE TABLE IF NOT EXISTS expenses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id),
    title text NOT NULL,
    amount decimal(10,2) NOT NULL,
    category text, 
    expense_date date DEFAULT CURRENT_DATE
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access expenses" ON expenses;
CREATE POLICY "Admin full access expenses" ON expenses FOR ALL USING (auth.role() = 'authenticated');

-- 4. FUNÇÃO DE AGENDAMENTO COM BLOQUEIO DE HORÁRIO
CREATE OR REPLACE FUNCTION public.create_booking(
    p_full_name text,
    p_phone text,
    p_cpf text,
    p_birth_date date,
    p_service_id uuid,
    p_start_time timestamptz,
    p_end_time timestamptz
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_id uuid;
    v_appointment_id uuid;
    v_conflict_count int;
BEGIN
    -- Verifica se já existe agendamento CONFIRMADO ou PENDENTE no horário (ignora cancelados)
    SELECT COUNT(*) INTO v_conflict_count
    FROM public.appointments
    WHERE status != 'cancelled'
    AND ((start_time, end_time) OVERLAPS (p_start_time, p_end_time));

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Horário indisponível! Já existe agendamento.';
    END IF;

    SELECT id INTO v_client_id FROM public.clients WHERE phone = p_phone LIMIT 1;
    
    IF v_client_id IS NULL THEN
        INSERT INTO public.clients (full_name, phone, cpf, birth_date, lgpd_accepted_at)
        VALUES (p_full_name, p_phone, p_cpf, p_birth_date, now()) RETURNING id INTO v_client_id;
    ELSE
        UPDATE public.clients SET full_name = p_full_name, cpf = COALESCE(p_cpf, cpf), lgpd_accepted_at = COALESCE(lgpd_accepted_at, now()) WHERE id = v_client_id;
    END IF;

    INSERT INTO public.appointments (client_id, service_id, start_time, end_time, status)
    VALUES (v_client_id, p_service_id, p_start_time, p_end_time, 'pending')
    RETURNING id INTO v_appointment_id;

    RETURN v_appointment_id;
END;
$$;
