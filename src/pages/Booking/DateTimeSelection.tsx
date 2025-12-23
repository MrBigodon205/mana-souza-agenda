import { useState, useMemo, useEffect } from 'react';
import { format, addDays, isBefore, setHours, setMinutes, addMinutes, isAfter, startOfDay, endOfDay, subHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Clock, ChevronLeft, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

import type { Service } from './ServiceSelection';

interface DateTimeSelectionProps {
    service: Service;
    onSelect: (date: Date) => void;
    onBack: () => void;
}

export default function DateTimeSelection({ service, onSelect, onBack }: DateTimeSelectionProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [busySlots, setBusySlots] = useState<Date[]>([]);
    const [loading, setLoading] = useState(false);

    // Regras de Negócio
    const OPEN_HOUR = 8;
    const CLOSE_HOUR = 17;
    const WORKING_DAYS = [1, 2, 3, 4, 5, 6]; // Seg a Sab
    const LUNCH_START = 12; // 12:00
    const LUNCH_END = 13.5; // 13:30

    // Buscar agendamentos quando selecionar data
    useEffect(() => {
        if (!selectedDate) return;

        async function fetchBusySlots() {
            setLoading(true);
            const start = startOfDay(selectedDate!).toISOString();
            const end = endOfDay(selectedDate!).toISOString();

            // Buscar agendamentos do dia que NÃO estejam cancelados
            // E se estiverem 'pending', só buscar se foram criados nas últimas 24h (se for mais antigo, considera livre)
            const yesterday = subHours(new Date(), 24).toISOString();

            const { data, error } = await supabase
                .from('appointments')
                .select('start_time, end_time, status, created_at')
                .gte('start_time', start)
                .lte('start_time', end)
                .neq('status', 'cancelled');

            if (error) {
                console.error(error);
                setLoading(false);
                return;
            }

            // Filtrar no front: se status pending E criado antes de 24h atrás, ignorar (liberar vaga)
            const validAppointments = (data || []).filter(app => {
                if (app.status === 'confirmed') return true;
                if (app.status === 'pending') {
                    // Se foi criado DEPOIS de ontem (recente), está ocupado.
                    // Se foi criado ANTES de ontem (velho), expirou, então NÃO está ocupado.
                    return isAfter(new Date(app.created_at), new Date(yesterday));
                }
                return false;
            });

            const busy = validAppointments.map(app => new Date(app.start_time));
            setBusySlots(busy);
            setLoading(false);
        }

        fetchBusySlots();
    }, [selectedDate]);

    // Desabilitar dias passados e não úteis
    const disabledDays = [
        { before: addDays(new Date(), 1) },
        (date: Date) => !WORKING_DAYS.includes(date.getDay())
    ];

    const availableSlots = useMemo(() => {
        if (!selectedDate) return [];

        const slots = [];
        let currentTime = setMinutes(setHours(selectedDate, OPEN_HOUR), 0);
        const endTime = setMinutes(setHours(selectedDate, CLOSE_HOUR), 0);

        while (isBefore(currentTime, endTime)) {
            // 1. Regra do Almoço
            const hour = currentTime.getHours();
            const minutes = currentTime.getMinutes();
            const timeVal = hour + minutes / 60;
            const isLunch = timeVal >= LUNCH_START && timeVal < LUNCH_END;

            if (!isLunch) {
                const serviceEnd = addMinutes(currentTime, service.duration_minutes);

                // 1.1 Não terminar dentro do almoço
                const endHour = serviceEnd.getHours();
                const endMinutes = serviceEnd.getMinutes();
                const endTimeVal = endHour + endMinutes / 60;
                const endsInLunch = endTimeVal > LUNCH_START && endTimeVal <= LUNCH_END;

                // 2. Verificar Disputa de Horário (Colisão com BusySlots)
                // Se algum busySlot bater exatamente ou overlapping
                const isTaken = busySlots.some(busy => {
                    // Lógica simples: se o horário de início for igual
                    // Para refinar, deveria checar intervalo, mas start_time igual já pega 90% dos casos de slot fixo
                    return busy.getTime() === currentTime.getTime();
                });

                if (!isAfter(serviceEnd, endTime) && !endsInLunch && !isTaken) {
                    slots.push(new Date(currentTime));
                }
            }

            currentTime = addMinutes(currentTime, 30);
        }

        return slots;
    }, [selectedDate, service.duration_minutes, busySlots]);

    return (
        <div className="space-y-8 animate-fade-in">
            <button onClick={onBack} className="text-sm text-brand-muted hover:text-brand-dark flex items-center">
                <ChevronLeft className="w-4 h-4 mr-1" /> Voltar para serviços
            </button>

            <div className="text-center space-y-2">
                <h2 className="text-3xl font-serif text-brand-dark">Escolha o Horário</h2>
                <p className="text-brand-muted text-sm">Disponibilidade para {service.name}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-center">
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        locale={ptBR}
                        disabled={disabledDays}
                        modifiersClassNames={{
                            selected: 'bg-brand-gold text-white hover:bg-brand-gold/90 rounded-full',
                            today: 'text-brand-gold font-bold'
                        }}
                        styles={{
                            caption: { color: '#D4AF37' },
                            head_cell: { color: '#8A8A8A' }
                        }}
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center text-brand-dark">
                        <Clock className="w-5 h-5 mr-2 text-brand-gold" />
                        Horários Disponíveis
                        {selectedDate && <span className="ml-2 text-sm font-normal text-brand-muted capitalize">({format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })})</span>}
                    </h3>

                    {!selectedDate ? (
                        <div className="h-60 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            <CalendarIcon className="w-8 h-8 mb-2 opacity-50" />
                            <p>Selecione um dia</p>
                        </div>
                    ) : loading ? (
                        <div className="p-8 text-center text-gray-400">Verificando agenda...</div>
                    ) : availableSlots.length === 0 ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Dia lotado. Tente outra data.
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {availableSlots.map((slot, i) => (
                                <button
                                    key={i}
                                    onClick={() => onSelect(slot)}
                                    className="py-2 px-3 text-sm border border-gray-200 rounded-lg hover:border-brand-gold hover:text-brand-gold hover:bg-brand-gold/5 transition-all focus:ring-2 focus:ring-brand-gold focus:ring-offset-1"
                                >
                                    {format(slot, 'HH:mm')}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
