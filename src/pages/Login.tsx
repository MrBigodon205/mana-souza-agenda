
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2 } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/admin/dashboard');
        } catch (err: any) {
            setError('Erro ao entrar. Verifique suas credenciais.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-sm w-full animate-fade-in">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-brand-gold/10 rounded-full mb-4">
                        <Lock className="w-6 h-6 text-brand-gold" />
                    </div>
                    <h1 className="text-2xl font-serif text-brand-dark">Acesso Restrito</h1>
                    <p className="text-sm text-brand-muted">Área exclusiva para profissionais</p>
                </div>

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="manajps85@gmail.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="flex-1 btn-primary flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
