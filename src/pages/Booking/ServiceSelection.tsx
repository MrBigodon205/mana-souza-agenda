
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export type Service = {
    id: string;
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    category: string;
};

interface ServiceSelectionProps {
    onSelect: (service: Service) => void;
}

export default function ServiceSelection({ onSelect }: ServiceSelectionProps) {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchServices() {
            try {
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .order('category')
                    .order('price');

                if (error) throw error;
                setServices(data || []);
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchServices();
    }, []);

    const categories = Array.from(new Set(services.map(s => s.category)));

    if (loading) return <div className="text-center py-10 font-serif text-brand-muted">Carregando serviços...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-serif text-brand-dark">Escolha seu Procedimento</h2>
                <p className="text-brand-muted text-sm">Selecione o serviço ideal para realçar sua beleza</p>
            </div>

            <div className="space-y-8">
                {categories.map(category => (
                    <div key={category} className="space-y-4">
                        <h3 className="text-xl font-serif text-brand-gold border-b border-brand-pink/30 pb-2 uppercase tracking-wider text-sm">
                            {category}
                        </h3>

                        <div className="grid gap-4 md:grid-cols-2">
                            {services.filter(s => s.category === category).map(service => (
                                <div
                                    key={service.id}
                                    onClick={() => setSelectedId(service.id)}
                                    className={clsx(
                                        "relative group cursor-pointer p-5 rounded-xl border transition-all duration-300",
                                        selectedId === service.id
                                            ? "border-brand-gold bg-white shadow-lg ring-1 ring-brand-gold"
                                            : "border-gray-100 bg-white hover:border-brand-pink hover:shadow-md"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-brand-dark pr-4">{service.name}</h4>
                                        {selectedId === service.id && (
                                            <CheckCircle2 className="w-5 h-5 text-brand-gold absolute top-4 right-4" />
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 h-10">{service.description || 'Procedimento realizado com técnicas avançadas.'}</p>

                                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50">
                                        <div className="flex items-center text-xs text-brand-muted font-medium">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {service.duration_minutes} min
                                        </div>
                                        <span className="text-brand-dark font-bold">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                                        </span>
                                    </div>

                                    {selectedId === service.id && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelect(service);
                                            }}
                                            className="mt-4 w-full bg-brand-gold text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center hover:bg-yellow-600 transition-colors"
                                        >
                                            Agendar <ChevronRight className="w-4 h-4 ml-1" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
