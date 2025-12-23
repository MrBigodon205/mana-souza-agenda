-- FUNÇÃO DE AGENDAMENTO COM TRAVA DE HORÁRIO (EVITAR DUPLICIDADE)
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
    -- 0. Verificar conflito de horário
    -- Consideramos conflito qualquer agendamento que não esteja cancelado ('cancelled')
    -- e que se sobreponha ao horário solicitado.
    SELECT COUNT(*) INTO v_conflict_count
    FROM public.appointments
    WHERE status != 'cancelled'
    AND (
        (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
    );

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Horário indisponível! Já existe um agendamento neste período.';
    END IF;

    -- 1. Upsert Client (Find by phone)
    SELECT id INTO v_client_id FROM public.clients WHERE phone = p_phone LIMIT 1;
    
    IF v_client_id IS NULL THEN
        INSERT INTO public.clients (full_name, phone, cpf, birth_date, lgpd_accepted_at)
        VALUES (p_full_name, p_phone, p_cpf, p_birth_date, now()) 
        RETURNING id INTO v_client_id;
    ELSE
        UPDATE public.clients 
        SET full_name = p_full_name, 
            cpf = COALESCE(p_cpf, cpf),
            birth_date = COALESCE(p_birth_date, birth_date),
            lgpd_accepted_at = COALESCE(lgpd_accepted_at, now()) 
        WHERE id = v_client_id;
    END IF;

    -- 2. Create Appointment
    INSERT INTO public.appointments (client_id, service_id, start_time, end_time, status)
    VALUES (v_client_id, p_service_id, p_start_time, p_end_time, 'pending')
    RETURNING id INTO v_appointment_id;

    RETURN v_appointment_id;
END;
$$;
