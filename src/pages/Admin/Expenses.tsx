import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ChevronLeft, Plus, Trash, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Expenses() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: 'Material' });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        // 1. Despesas
        const { data: expData } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
        // 2. Receitas (Agendamentos Confirmados)
        const { data: revData } = await supabase.from('appointments').select('*, services(price)').eq('status', 'confirmed');

        setExpenses(expData || []);
        setAppointments(revData || []);
        setLoading(false);
    }

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExpense.title || !newExpense.amount) return;

        const { error } = await supabase.from('expenses').insert({
            title: newExpense.title,
            amount: parseFloat(newExpense.amount),
            category: newExpense.category,
            expense_date: new Date().toISOString()
        });

        if (error) {
            console.error(error);
            alert('Erro ao salvar despesa');
        } else {
            setNewExpense({ title: '', amount: '', category: 'Material' });
            fetchData();
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('Excluir despesa?')) return;
        await supabase.from('expenses').delete().eq('id', id);
        fetchData();
    };

    // Cálculos
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalRevenue = appointments.reduce((acc, curr) => acc + (curr.services?.price || 0), 0);
    const profit = totalRevenue - totalExpenses;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <h1 className="text-3xl font-serif text-brand-dark">Controle Financeiro</h1>
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 text-sm font-medium">Receita Total</h3>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 text-sm font-medium">Despesas</h3>
                        <TrendingDown className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpenses)}
                    </p>
                </div>
                <div className={`bg-white p-6 rounded-xl shadow-sm border border-l-4 ${profit >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 text-sm font-medium">Lucro Líquido</h3>
                        <DollarSign className="w-5 h-5 text-brand-gold" />
                    </div>
                    <p className={`text-2xl font-bold ${profit >= 0 ? 'text-brand-dark' : 'text-red-500'}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(profit)}
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Formulário de Despesa */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <h2 className="text-lg font-bold text-brand-dark mb-4 border-b pb-2">Nova Despesa</h2>
                    <form onSubmit={handleAddExpense} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Descrição</label>
                            <input
                                className="input-field"
                                placeholder="Ex: Conta de Luz, Material..."
                                value={newExpense.title}
                                onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Valor (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input-field"
                                    placeholder="0,00"
                                    value={newExpense.amount}
                                    onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Categoria</label>
                                <select
                                    className="input-field"
                                    value={newExpense.category}
                                    onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                >
                                    <option>Material</option>
                                    <option>Aluguel</option>
                                    <option>Energia/Água</option>
                                    <option>Marketing</option>
                                    <option>Outros</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn-primary w-full flex justify-center items-center">
                            <Plus className="w-4 h-4 mr-2" /> Adicionar Gasto
                        </button>
                    </form>
                </div>

                {/* Lista de Despesas */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-brand-dark mb-4 border-b pb-2">Histórico de Gastos</h2>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {expenses.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-4">Nenhuma despesa lançada.</p>
                        ) : expenses.map(exp => (
                            <div key={exp.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group">
                                <div>
                                    <p className="font-medium text-gray-800">{exp.title}</p>
                                    <p className="text-xs text-gray-500">{format(new Date(exp.created_at), 'dd/MM/yy')} • {exp.category}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-red-500">
                                        - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(exp.amount)}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteExpense(exp.id)}
                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
