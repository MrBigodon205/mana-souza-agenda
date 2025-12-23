-- 1. Update Clients Table (Dados Pessoais)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS rg text,
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS profession text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS email text, 
ADD COLUMN IF NOT EXISTS how_found_us text,
ADD COLUMN IF NOT EXISTS lgpd_accepted_at timestamptz; -- DATA DO ACEITE DO TERMO

-- 2. Create/Update Anamnesis Table
CREATE TABLE IF NOT EXISTS anamnesis (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    updated_at timestamptz DEFAULT now(),
    
    -- --- COMUM ---
    pregnant boolean DEFAULT false, 
    pregnant_weeks text, 
    breastfeeding boolean DEFAULT false, 
    oncology_treatment boolean DEFAULT false, 
    
    allergies boolean DEFAULT false,
    allergies_details text, 
    
    -- --- CÍLIOS ---
    wearing_mascara boolean DEFAULT false,
    recent_eye_procedure boolean DEFAULT false,
    sleep_side text, 
    thyroid_problems boolean DEFAULT false,
    eye_problems boolean DEFAULT false,
    contact_lenses boolean DEFAULT false,
    
    -- --- SOBRANCELHAS ---
    allergy_henna boolean DEFAULT false,
    allergy_lead boolean DEFAULT false, 
    hair_loss boolean DEFAULT false, 
    hair_loss_degree text, 
    skin_sensitivity boolean DEFAULT false, 
    
    -- --- GERAL ---
    oily_skin boolean DEFAULT false, 
    other_problems boolean DEFAULT false,
    other_problems_details text,
    
    -- O termo é lido da tabela clients (lgpd_accepted_at)
    term_accepted boolean GENERATED ALWAYS AS (true) STORED 
);

-- RLS
ALTER TABLE anamnesis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access anamnesis" ON anamnesis FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Anon read access anamnesis" ON anamnesis FOR SELECT USING (true); -- Caso precise ler

-- 3. Procedure Records
CREATE TABLE IF NOT EXISTS procedure_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    appointment_id uuid REFERENCES appointments(id),
    created_at timestamptz DEFAULT now(),
    procedure_date date DEFAULT CURRENT_DATE,
    type text, -- 'lashes' ou 'brows'
    
    -- --- CÍLIOS ---
    technique text,
    mapping text,
    lash_brand text,
    thickness text,
    curvature text,
    glue text,
    
    -- --- SOBRANCELHAS ---
    brow_technique text,
    color_applied text, 
    measurements jsonb, 
    
    -- --- FINANCEIRO ---
    return_date_1 date,
    return_date_2 date,
    return_date_3 date,
    application_value decimal(10,2),
    maintenance_value decimal(10,2),
    
    observations text
);

ALTER TABLE procedure_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access procedures" ON procedure_records FOR ALL USING (auth.role() = 'authenticated');

-- 4. Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id),
    title text NOT NULL,
    amount decimal(10,2) NOT NULL,
    category text, 
    expense_date date DEFAULT CURRENT_DATE
);


-- 5. Update Booking RPC to include LGPD Timestamp
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
BEGIN
    -- 1. Upsert Client (Find by phone)
    SELECT id INTO v_client_id FROM public.clients WHERE phone = p_phone LIMIT 1;
    
    IF v_client_id IS NULL THEN
        INSERT INTO public.clients (full_name, phone, cpf, birth_date, lgpd_accepted_at)
        VALUES (p_full_name, p_phone, p_cpf, p_birth_date, now()) -- Grava data atual como aceite
        RETURNING id INTO v_client_id;
    ELSE
        UPDATE public.clients 
        SET full_name = p_full_name, 
            cpf = COALESCE(p_cpf, cpf),
            birth_date = COALESCE(p_birth_date, birth_date),
            lgpd_accepted_at = COALESCE(lgpd_accepted_at, now()) -- Só atualiza se for nulo
        WHERE id = v_client_id;
    END IF;

    -- 2. Create Appointment
    INSERT INTO public.appointments (client_id, service_id, start_time, end_time, status)
    VALUES (v_client_id, p_service_id, p_start_time, p_end_time, 'pending')
    RETURNING id INTO v_appointment_id;

    RETURN v_appointment_id;
END;
$$;

