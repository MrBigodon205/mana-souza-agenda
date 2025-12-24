
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { LogOut, Calendar, Users, DollarSign, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
    }, []);

    async function fetchAppointments() {
        try {
            // Buscar agendamentos (filtro simples por enquanto, poderia ser apenas "hoje")
            const { data, error } = await supabase
                .from('appointments')
                .select(`
            id,
            start_time,
            status,
            clients (full_name, phone),
            services (name, price)
        `)
                .order('start_time', { ascending: true });

            if (error) throw error;
            setAppointments(data || []);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // Mostrar todos os agendamentos (para facilitar o teste)
    const todaysAppointments = appointments;
    const totalRevenue = appointments.filter(a => a.status === 'confirmed').reduce((acc, curr) => acc + (curr.services?.price || 0), 0);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-brand-dark">Painel da Profissional</h1>
                    <p className="text-brand-muted">Bem-vinda, Mana!</p>
                </div>
                <button onClick={handleLogout} className="text-sm text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg flex items-center transition-colors">
                    <LogOut className="w-4 h-4 mr-2" /> Sair
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 text-sm font-medium">Agendamentos Hoje</h3>
                        <Calendar className="w-5 h-5 text-brand-gold" />
                    </div>
                    <p className="text-3xl font-bold text-brand-dark">{todaysAppointments.length}</p>
                </div>

                <Link to="/admin/financial" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-brand-gold transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 text-sm font-medium group-hover:text-brand-gold">Financeiro</h3>
                        <DollarSign className="w-5 h-5 text-green-500 group-hover:text-brand-gold" />
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-3xl font-bold text-brand-dark">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                        </p>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-gold" />
                    </div>
                </Link>

                <Link to="/admin/clients" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-brand-gold transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 text-sm font-medium group-hover:text-brand-gold">Total Clientes</h3>
                        <Users className="w-5 h-5 text-brand-pink group-hover:text-brand-gold" />
                    </div>
                    {/* Placeholder stat */}
                    <div className="flex items-center justify-between">
                        <p className="text-3xl font-bold text-brand-dark">-</p>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-gold" />
                    </div>
                </Link>
            </div>

            {/* Schedule */}
            <h2 className="text-xl font-serif text-brand-dark mb-4">Todos os Agendamentos</h2>

            {loading ? (
                <div className="text-center py-10">Carregando...</div>
            ) : todaysAppointments.length === 0 ? (
                <div className="bg-white p-10 rounded-xl text-center border border-dashed border-gray-200 text-gray-400">
                    Nenhum agendamento para hoje. Aproveite para descansar! 🌸
                </div>
            ) : (
                <>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 text-sm text-blue-800 flex items-start">
                        <div className="mr-3 mt-0.5">ℹ️</div>
                        <div>
                            <strong>Como confirmar pagamentos:</strong>
                            <ol className="list-decimal ml-4 mt-1 space-y-1 text-blue-700">
                                <li>A cliente envia o comprovante pelo WhatsApp.</li>
                                <li>Você confere se o dinheiro caiu na sua conta (Infinity/Pix).</li>
                                <li>Clica no botão verde <strong>"Confirmar ($)"</strong> abaixo para atualizar o faturamento.</li>
                            </ol>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 font-medium text-gray-600">Horário</th>
                                        <th className="p-4 font-medium text-gray-600">Cliente</th>
                                        <th className="p-4 font-medium text-gray-600">Serviço</th>
                                        <th className="p-4 font-medium text-gray-600">Status</th>
                                        <th className="p-4 font-medium text-gray-600">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {todaysAppointments.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-bold text-brand-dark">
                                                {format(new Date(app.start_time), "dd/MM 'às' HH:mm")}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium">{app.clients?.full_name}</div>
                                                <div className="text-xs text-gray-400">{app.clients?.phone}</div>
                                            </td>
                                            <td className="p-4 text-gray-600">{app.services?.name}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${app.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {app.status === 'pending' ? 'Pendente' : app.status === 'confirmed' ? 'Confirmado' : app.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {app.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm('O cliente realizou o pagamento? Confirmar agendamento?')) return;
                                                                setLoading(true);
                                                                await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', app.id);
                                                                fetchAppointments();
                                                            }}
                                                            className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-xs font-bold transition-colors"
                                                        >
                                                            Confirmar ($)
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm('Cancelar este agendamento por falta de pagamento?')) return;
                                                                setLoading(true);
                                                                await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', app.id);
                                                                fetchAppointments();
                                                            }}
                                                            className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded text-xs transition-colors"
                                                            title="Cancelar por falta de pagamento"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                )}
                                                {app.status === 'confirmed' && (
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm('Tem certeza que deseja cancelar este agendamento CONFIRMADO?\nIsso irá liberar o horário na agenda.')) return;
                                                            setLoading(true);
                                                            await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', app.id);
                                                            fetchAppointments();
                                                        }}
                                                        className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded text-xs transition-colors"
                                                    >
                                                        Cancelar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
