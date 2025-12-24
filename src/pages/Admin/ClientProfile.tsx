import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2, Save, FileText, History, User, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function ClientProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'anamnesis' | 'history'>('details');

    // Data states
    const [client, setClient] = useState<any>(null);
    const [anamnesis, setAnamnesis] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, [id]);

    async function fetchData() {
        if (!id) return;
        try {
            // 1. Fetch Client
            const { data: clientData, error: clientError } = await supabase
                .from('clients')
                .select('*')
                .eq('id', id)
                .single();

            if (clientError) throw clientError;
            setClient(clientData);

            // 2. Fetch Anamnesis
            const { data: anamnesisData } = await supabase
                .from('anamnesis')
                .select('*')
                .eq('client_id', id)
                .maybeSingle(); // Pode não existir ainda

            setAnamnesis(anamnesisData || {}); // Inicializa vazio se não tiver

            // 3. Fetch History
            const { data: appData } = await supabase
                .from('appointments')
                .select('*, services(*)')
                .eq('client_id', id)
                .order('start_time', { ascending: false });

            setAppointments(appData || []);

        } catch (error) {
            console.error(error);
            alert('Erro ao carregar dados do cliente');
        } finally {
            setLoading(false);
        }
    }

    const handleSaveDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('clients')
                .update({
                    full_name: client.full_name,
                    phone: client.phone,
                    cpf: client.cpf,
                    rg: client.rg,
                    birth_date: client.birth_date,
                    profession: client.profession,
                    address: client.address,
                    how_found_us: client.how_found_us
                })
                .eq('id', id);

            if (error) throw error;
            alert('Dados salvos com sucesso!');
        } catch (error) {
            alert('Erro ao salvar');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAnamnesis = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...anamnesis, client_id: id };

            // Upsert (Insert or Update)
            const { error } = await supabase
                .from('anamnesis')
                .upsert(payload)
                .select()
                .single();

            if (error) throw error;
            alert('Ficha de anamnese atualizada!');
        } catch (error) {
            alert('Erro ao salvar anamnese');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-gold" /></div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in pb-24">
            <button onClick={() => navigate('/admin/clients')} className="flex items-center text-gray-500 hover:text-brand-dark mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Lista
            </button>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-brand-dark">{client.full_name}</h1>
                    <p className="text-brand-muted">{client.phone}</p>
                </div>
                <div className="flex space-x-2 bg-white p-1 rounded-lg border border-gray-100 shadow-sm">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${activeTab === 'details' ? 'bg-brand-gold text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <User className="w-4 h-4 mr-2" /> Dados
                    </button>
                    <button
                        onClick={() => setActiveTab('anamnesis')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${activeTab === 'anamnesis' ? 'bg-brand-gold text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <FileText className="w-4 h-4 mr-2" /> Anamnese
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${activeTab === 'history' ? 'bg-brand-gold text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <History className="w-4 h-4 mr-2" /> Histórico
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center print:hidden"
                        title="Salvar como PDF / Imprimir"
                    >
                        <span className="mr-2">🖨️</span> Imprimir
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center print:hidden"
                        title="Salvar como PDF / Imprimir"
                    >
                        <span className="mr-2">🖨️</span> Imprimir / PDF
                    </button>
                </div>
            </div>

            {/* TAB: DADOS PESSOAIS */}
            {activeTab === 'details' && (
                <form onSubmit={handleSaveDetails} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Dados Pessoais</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                            <input type="text" className="input-field" value={client.full_name || ''} onChange={e => setClient({ ...client, full_name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Telefone</label>
                            <input type="text" className="input-field" value={client.phone || ''} onChange={e => setClient({ ...client, phone: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">CPF</label>
                            <input type="text" className="input-field" value={client.cpf || ''} onChange={e => setClient({ ...client, cpf: e.target.value })} placeholder="000.000.000-00" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">RG</label>
                            <input type="text" className="input-field" value={client.rg || ''} onChange={e => setClient({ ...client, rg: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                            <input type="date" className="input-field" value={client.birth_date || ''} onChange={e => setClient({ ...client, birth_date: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Profissão</label>
                            <input type="text" className="input-field" value={client.profession || ''} onChange={e => setClient({ ...client, profession: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Endereço Completo</label>
                            <input type="text" className="input-field" value={client.address || ''} onChange={e => setClient({ ...client, address: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Como conheceu?</label>
                            <input type="text" className="input-field" value={client.how_found_us || ''} onChange={e => setClient({ ...client, how_found_us: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={saving} className="btn-primary flex items-center">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            )}

            {/* TAB: ANAMNESE */}
            {activeTab === 'anamnesis' && (
                <form onSubmit={handleSaveAnamnesis} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Ficha de Anamnese (Lashes & Brows)</h2>

                    {/* Saúde Geral */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-brand-gold">Saúde Geral</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center space-x-2 border p-3 rounded hover:bg-gray-50">
                                <input type="checkbox" checked={anamnesis.pregnant || false} onChange={e => setAnamnesis({ ...anamnesis, pregnant: e.target.checked })} />
                                <span>Gestante?</span>
                            </label>
                            {anamnesis.pregnant && (
                                <input type="text" placeholder="Quantas semanas?" className="input-field" value={anamnesis.pregnant_weeks || ''} onChange={e => setAnamnesis({ ...anamnesis, pregnant_weeks: e.target.value })} />
                            )}
                            <label className="flex items-center space-x-2 border p-3 rounded hover:bg-gray-50">
                                <input type="checkbox" checked={anamnesis.breastfeeding || false} onChange={e => setAnamnesis({ ...anamnesis, breastfeeding: e.target.checked })} />
                                <span>Lactante?</span>
                            </label>
                            <label className="flex items-center space-x-2 border p-3 rounded hover:bg-gray-50">
                                <input type="checkbox" checked={anamnesis.oncology_treatment || false} onChange={e => setAnamnesis({ ...anamnesis, oncology_treatment: e.target.checked })} />
                                <span>Tratamento Oncológico?</span>
                            </label>
                            <label className="flex items-center space-x-2 border p-3 rounded hover:bg-gray-50">
                                <input type="checkbox" checked={anamnesis.thyroid_problems || false} onChange={e => setAnamnesis({ ...anamnesis, thyroid_problems: e.target.checked })} />
                                <span>Problemas de Tireóide?</span>
                            </label>
                        </div>
                    </div>

                    {/* Olhos e Pele */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-brand-gold">Olhos e Pele</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center space-x-2 border p-3 rounded hover:bg-gray-50">
                                <input type="checkbox" checked={anamnesis.recent_eye_procedure || false} onChange={e => setAnamnesis({ ...anamnesis, recent_eye_procedure: e.target.checked })} />
                                <span>Procedimento recente nos olhos?</span>
                            </label>
                            <label className="flex items-center space-x-2 border p-3 rounded hover:bg-gray-50">
                                <input type="checkbox" checked={anamnesis.eye_problems || false} onChange={e => setAnamnesis({ ...anamnesis, eye_problems: e.target.checked })} />
                                <span>Problema Ocular (Glaucoma/Blefarite)?</span>
                            </label>
                            <label className="flex items-center space-x-2 border p-3 rounded hover:bg-gray-50">
                                <input type="checkbox" checked={anamnesis.contact_lenses || false} onChange={e => setAnamnesis({ ...anamnesis, contact_lenses: e.target.checked })} />
                                <span>Usa Lentes de Contato?</span>
                            </label>
                            <label className="flex items-center space-x-2 border p-3 rounded hover:bg-gray-50">
                                <input type="checkbox" checked={anamnesis.oily_skin || false} onChange={e => setAnamnesis({ ...anamnesis, oily_skin: e.target.checked })} />
                                <span>Pele Oleosa?</span>
                            </label>
                            <label className="flex items-center space-x-2 border p-3 rounded hover:bg-gray-50">
                                <input type="checkbox" checked={anamnesis.skin_sensitivity || false} onChange={e => setAnamnesis({ ...anamnesis, skin_sensitivity: e.target.checked })} />
                                <span>Sensibilidade na Pele?</span>
                            </label>
                        </div>
                    </div>

                    {/* Alergias */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-brand-gold">Alergias</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center space-x-2 border p-3 rounded hover:bg-gray-50">
                                <input type="checkbox" checked={anamnesis.allergies || false} onChange={e => setAnamnesis({ ...anamnesis, allergies: e.target.checked })} />
                                <span>Alergia Geral (Esmalte/Cosméticos)?</span>
                            </label>
                            <label className="flex items-center space-x-2 border p-3 rounded hover:bg-gray-50">
                                <input type="checkbox" checked={anamnesis.allergy_henna || false} onChange={e => setAnamnesis({ ...anamnesis, allergy_henna: e.target.checked })} />
                                <span>Alergia a Henna?</span>
                            </label>
                            <label className="flex items-center space-x-2 border p-3 rounded hover:bg-gray-50">
                                <input type="checkbox" checked={anamnesis.allergy_lead || false} onChange={e => setAnamnesis({ ...anamnesis, allergy_lead: e.target.checked })} />
                                <span>Alergia a Chumbo?</span>
                            </label>
                        </div>
                        <textarea
                            className="input-field mt-2"
                            placeholder="Detalhes das alergias..."
                            value={anamnesis.allergies_details || ''}
                            onChange={e => setAnamnesis({ ...anamnesis, allergies_details: e.target.value })}
                        />
                    </div>

                    {/* Sobrancelhas / Cabelo */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-brand-gold">Detalhes Sobrancelha</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center space-x-2 border p-3 rounded hover:bg-gray-50">
                                <input type="checkbox" checked={anamnesis.hair_loss || false} onChange={e => setAnamnesis({ ...anamnesis, hair_loss: e.target.checked })} />
                                <span>Queda de Cabelo/Pelos?</span>
                            </label>
                            {anamnesis.hair_loss && (
                                <select className="input-field" value={anamnesis.hair_loss_degree || ''} onChange={e => setAnamnesis({ ...anamnesis, hair_loss_degree: e.target.value })}>
                                    <option value="">Grau da queda...</option>
                                    <option value="pouco">Pouco</option>
                                    <option value="regular">Regular</option>
                                    <option value="bastante">Bastante</option>
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Hábito de Dormir */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-brand-gold">Hábitos</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">Dorme de lado?</label>
                            <select className="input-field" value={anamnesis.sleep_side || ''} onChange={e => setAnamnesis({ ...anamnesis, sleep_side: e.target.value })}>
                                <option value="nao">Não, dorme de barriga pra cima</option>
                                <option value="direito">Lado Direito</option>
                                <option value="esquerdo">Lado Esquerdo</option>
                                <option value="brucos">De bruços</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded text-xs text-gray-500 text-justify border border-gray-100">
                        <strong>TERMO DE RESPONSABILIDADE:</strong> Confirmo a veracidade das informações por mim prestadas e me comprometo a seguir as recomendações apresentadas.
                        <div className="mt-2 pt-2 border-t border-gray-200 text-brand-dark font-bold flex items-center">
                            ✅ Termo LGPD Aceito em: {client?.lgpd_accepted_at ? format(new Date(client.lgpd_accepted_at), 'dd/MM/yyyy às HH:mm') : 'Pendente (Cliente Antigo)'}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={saving} className="btn-primary flex items-center">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Salvar Ficha
                        </button>
                    </div>

                </form>
            )}

            {activeTab === 'history' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800">Histórico de Agendamentos</h2>
                    {appointments.length === 0 ? (
                        <p className="text-gray-500">Nenhum agendamento encontrado.</p>
                    ) : (
                        appointments.map(app => (
                            <div key={app.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-brand-dark">{app.services?.name}</p>
                                    <p className="text-sm text-gray-500">{format(new Date(app.start_time), 'dd/MM/yyyy HH:mm')}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${app.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    app.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {app.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}

        </div>
    );
}
