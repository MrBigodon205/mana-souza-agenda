import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Debug() {
    const [status, setStatus] = useState('Testing...');
    const [details, setDetails] = useState<any>(null);
    const url = import.meta.env.VITE_SUPABASE_URL;

    useEffect(() => {
        async function testConnection() {
            try {
                // 1. Test Read
                const { error: readError } = await supabase.from('services').select('count', { count: 'exact', head: true });

                // 2. Test Write (Client) - Random to check RLS vs Duplicate
                const randomPhone = '719' + Math.floor(Math.random() * 10000000).toString();
                const { error: writeError } = await supabase.from('clients').insert({
                    full_name: 'Debug Test ' + randomPhone,
                    phone: randomPhone
                });

                if (readError) {
                    setStatus('READ ERROR');
                    setDetails({ readError });
                } else if (writeError) {
                    setStatus('WRITE ERROR (Likely RLS)');
                    setDetails({ writeError });
                } else {
                    setStatus('SUCCESS! Connection & Permissions Working');
                    setDetails({ message: 'Insert successful (row added)' });
                }
            } catch (err) {
                setStatus('CRITICAL FAILURE');
                setDetails(err);
            }
        }
        testConnection();
    }, []);

    return (
        <div className="p-10 font-mono text-sm max-w-2xl mx-auto mt-20 bg-gray-100 rounded-lg">
            <h1 className="text-xl font-bold mb-4">Supabase Connection Debugger</h1>

            <div className="mb-6">
                <p className="font-bold text-gray-500">Connected Project URL:</p>
                <code className="bg-white p-2 block mt-1 border border-gray-300 rounded">
                    {url || 'UNDEFINED (Check .env)'}
                </code>
                <p className="text-xs text-gray-400 mt-1">
                    Verify if this matches your Supabase Dashboard URL.
                </p>
            </div>

            <div className={`p-4 rounded border ${status.includes('SUCCESS') ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
                <p className="font-bold mb-2">Status: {status}</p>
                <pre className="whitespace-pre-wrap text-xs bg-white/50 p-2 rounded">
                    {JSON.stringify(details, null, 2)}
                </pre>
            </div>
        </div>
    );
}
