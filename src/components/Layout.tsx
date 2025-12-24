
import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="min-h-screen bg-brand-light flex flex-col font-sans text-brand-dark">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="font-serif text-2xl font-bold text-brand-gold">
                        Mana Souza
                        <span className="text-xs block font-sans text-brand-muted font-normal tracking-widest text-center">BEAUTY</span>
                    </div>
                    <Link to="/login" className="text-xs text-gray-300 hover:text-brand-gold transition-colors">
                        Área Restrita
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-brand-dark text-white py-8 mt-auto">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="font-serif text-xl text-brand-gold mb-2">Jarlene Pereira Souza</p>
                    <p className="text-sm text-gray-400 mb-4">Cílios • Sobrancelhas • Maquiagem</p>
                    <p className="text-xs text-gray-600">© {new Date().getFullYear()} Mana Souza Agenda. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
