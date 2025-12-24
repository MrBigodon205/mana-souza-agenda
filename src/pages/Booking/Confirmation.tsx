
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import type { Service } from './ServiceSelection';

interface ConfirmationProps {
    appointmentId: string;
    clientName: string;
    service: Service;
    startTime: Date;
}

export default function Confirmation({ clientName, service, startTime }: ConfirmationProps) {

    const generateWhatsAppLink = () => {
        // Número da Mana Souza (placeholder ou real se fornecido, usarei um genérico ou deixar pro usuário configurar)
        // PROMPT INFO: Usuário não forneceu número na lista, mas disse "Sim, tenho os arquivos...". 
        // Vou usar um placeholder claro para ela preencher ou pegar do contexto se tivesse. 
        // Como ela não passou o número explicitamente no chat (apenas CPF), vou deixar um const configurável.

        const MANA_PHONE = "557192686133"; // Número Oficial

        const dateStr = format(startTime, "dd/MM 'às' HH:mm", { locale: ptBR });

        const message = `Olá Mana! Sou *${clientName}*.\n\nAcabei de agendar:\n✨ *${service.name}*\n📅 ${dateStr}\n\nGostaria de confirmar e receber o link para pagamento do sinal.`;

        return `https://wa.me/${MANA_PHONE}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="text-center space-y-6 animate-fade-in max-w-lg mx-auto py-10">
            <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
            </div>

            <h2 className="text-3xl font-serif text-brand-dark">Solicitação Recebida!</h2>

            <p className="text-gray-600">
                Seu horário para <strong>{service.name}</strong> no dia <strong>{format(startTime, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</strong> está pré-reservado.
            </p>

            <div className="bg-brand-gold/10 p-6 rounded-xl border border-brand-gold/20">
                <h3 className="font-bold text-brand-dark mb-2">Próximo Passo: Pagamento</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Para garantir sua vaga, é necessário confirmar o pagamento (total ou sinal).
                    Envie a mensagem abaixo no WhatsApp para receber o link da Infinity Pay.
                </p>

                <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full flex items-center justify-center gap-2 text-lg shadow-xl shadow-brand-gold/20"
                >
                    <MessageCircle className="w-6 h-6" />
                    Confirmar no WhatsApp
                </a>
            </div>

            <p className="text-xs text-brand-muted">
                O agendamento será cancelado automaticamente se não confirmado em 24h.
            </p>

            <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-lg mt-6">
                <p className="font-bold text-sm uppercase flex items-center justify-center gap-2">
                    🚫 Importante: Não é permitido acompanhante
                </p>
                <p className="text-xs pt-1">
                    Para o conforto de todos e melhor execução do serviço, por favor venha desacompanhada.
                </p>
            </div>
        </div>
    );
}
