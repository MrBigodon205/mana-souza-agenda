-- Função segura para realizar agendamento sem travar no RLS
-- Ela roda como 'admin' (SECURITY DEFINER) para poder buscar/criar clientes livremente

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
SECURITY DEFINER -- IMPORTANTE: Ignora RLS
AS $$
DECLARE
    v_client_id uuid;
    v_appointment_id uuid;
BEGIN
    -- 1. Tenta achar o cliente pelo telefone
    SELECT id INTO v_client_id 
    FROM public.clients 
    WHERE phone = p_phone 
    LIMIT 1;
    
    -- 2. Se não existir, cria. Se existir, atualiza o nome.
    IF v_client_id IS NULL THEN
        INSERT INTO public.clients (full_name, phone, cpf, birth_date)
        VALUES (p_full_name, p_phone, p_cpf, p_birth_date)
        RETURNING id INTO v_client_id;
    ELSE
        UPDATE public.clients 
        SET full_name = p_full_name, cpf = COALESCE(p_cpf, cpf) -- Atualiza CPF se vier preenchido
        WHERE id = v_client_id;
    END IF;

    -- 3. Cria o agendamento
    INSERT INTO public.appointments (client_id, service_id, start_time, end_time, status)
    VALUES (v_client_id, p_service_id, p_start_time, p_end_time, 'pending')
    RETURNING id INTO v_appointment_id;

    RETURN v_appointment_id;
END;
$$;

-- Permite que qualquer um (anonimo) chame essa função
GRANT EXECUTE ON FUNCTION public.create_booking TO anon, authenticated, service_role;
