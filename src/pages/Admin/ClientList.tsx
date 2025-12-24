
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, User, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClientList() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    async function fetchClients() {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('full_name');

        if (error) console.error(error);
        setClients(data || []);
        setLoading(false);
    }

    const filteredClients = clients.filter(client =>
        client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm)
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-serif text-brand-dark">Meus Clientes</h1>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                    className="flex-1 outline-none text-sm"
                    placeholder="Buscar por nome ou telefone..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Carregando...</div>
                ) : filteredClients.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">Nenhum cliente encontrado.</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-medium text-gray-600">Nome</th>
                                <th className="p-4 font-medium text-gray-600">Telefone</th>
                                <th className="p-4 font-medium text-gray-600">CPF</th>
                                <th className="p-4 font-medium text-gray-600">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredClients.map(client => (
                                <tr key={client.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium text-brand-dark flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-brand-pink/20 text-brand-gold flex items-center justify-center">
                                            <User className="w-4 h-4" />
                                        </div>
                                        {client.full_name}
                                    </td>
                                    <td className="p-4 text-gray-600">{client.phone}</td>
                                    <td className="p-4 text-gray-600">{client.cpf || '-'}</td>
                                    <td className="p-4 flex items-center gap-2">
                                        <Link to={`/admin/clients/${client.id}`} className="text-brand-gold hover:underline font-medium">
                                            Abrir Ficha
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                if (!confirm(`Tem certeza que deseja excluir ${client.full_name}? Essa ação não pode ser desfeita.`)) return;
                                                const { error } = await supabase.from('clients').delete().eq('id', client.id);
                                                if (error) {
                                                    alert('Erro ao excluir. Verifique se existem agendamentos vinculados.');
                                                    console.error(error);
                                                } else {
                                                    fetchClients();
                                                }
                                            }}
                                            className="p-1 text-red-400 hover:bg-red-50 rounded"
                                            title="Excluir Cliente"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
