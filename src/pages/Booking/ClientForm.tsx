
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useForm } from 'react-hook-form';
import { Loader2, User, Phone, Calendar } from 'lucide-react';

interface ClientFormData {
    fullName: string;
    phone: string;
    birthDate?: string;
    cpf?: string;
    terms: boolean;
}

interface ClientFormProps {
    onSubmitSuccess: (appointmentId: string, clientName: string) => void;
    serviceId: string;
    startTime: Date;
    onBack: () => void;
}

export default function ClientForm({ onSubmitSuccess, serviceId, startTime, onBack }: ClientFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<ClientFormData>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const onSubmit = async (data: ClientFormData) => {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            // Calcular horário de término (estimado 1h por enquanto ou via prop se tivesse)
            const duration = 60; // Poderiamos buscar do serviço, mas vamos simplificar por hora
            const endTime = new Date(startTime.getTime() + duration * 60000);

            // CHAMADA SEGURA VIA RPC (Função no Banco de Dados)
            // Isso evita erro de permissão (RLS) e duplicidade de CPF/Telefone
            const { data: appointmentId, error } = await supabase.rpc('create_booking', {
                p_full_name: data.fullName,
                p_phone: data.phone,
                p_cpf: data.cpf || null,
                p_birth_date: data.birthDate || null,
                p_service_id: serviceId,
                p_start_time: startTime.toISOString(),
                p_end_time: endTime.toISOString()
            });

            if (error) throw error;

            if (!appointmentId) throw new Error('Falha ao obter ID do agendamento');

            onSubmitSuccess(appointmentId, data.fullName);

        } catch (err: any) {
            console.error('Erro no agendamento:', err);
            setSubmitError('Erro ao agendar. Tente novamente ou chame no WhatsApp.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-md mx-auto">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-serif text-brand-dark">Seus Dados</h2>
                <p className="text-brand-muted text-sm">Para confirmarmos seu horário</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center"><User className="w-4 h-4 mr-1" /> Nome Completo</label>
                    <input
                        {...register('fullName', { required: 'Nome é obrigatório' })}
                        className="input-field"
                        placeholder="Ex: Maria Silva"
                    />
                    {errors.fullName && <span className="text-xs text-red-500">{errors.fullName.message}</span>}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center"><Phone className="w-4 h-4 mr-1" /> WhatsApp (com DDD)</label>
                    <input
                        {...register('phone', { required: 'Telefone é obrigatório' })}
                        className="input-field"
                        placeholder="Ex: 71999999999"
                    />
                    {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">CPF (Opcional)</label>
                        <input
                            {...register('cpf')}
                            className="input-field"
                            placeholder="000.000.000-00"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center"><Calendar className="w-4 h-4 mr-1" /> Nascimento</label>
                        <input
                            type="date"
                            {...register('birthDate')}
                            className="input-field"
                        />
                    </div>
                </div>

                {submitError && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                        {submitError}
                    </div>
                )}

                <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex-1 btn-secondary text-sm py-2"
                        disabled={isSubmitting}
                    >
                        Voltar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] btn-primary flex items-center justify-center"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalizar Agendamento'}
                    </button>
                </div>

                <div className="flex items-start gap-2 pt-2">
                    <input
                        type="checkbox"
                        id="terms"
                        {...register('terms', { required: 'Você precisa aceitar os termos' })}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                    />
                    <label htmlFor="terms" className="text-xs text-gray-500 text-justify leading-relaxed">
                        Concordo que meus dados (Nome/Telefone) sejam armazenados para fins de agendamento e comunicação sobre meus serviços, conforme a LGPD.
                    </label>
                </div>
                {errors.terms && <span className="text-xs text-red-500 block text-center">{errors.terms.message}</span>}

                <p className="text-xs text-brand-muted text-center italic border-t border-gray-100 pt-3 mt-2">
                    Política de Cancelamento: Avise com 24h de antecedência.
                </p>
            </form>
        </div>
    );
}
