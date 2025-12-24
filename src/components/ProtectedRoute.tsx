
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-gold" /></div>;
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
