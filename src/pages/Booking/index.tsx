
import { useState } from 'react';
import ServiceSelection, { type Service } from './ServiceSelection';
import DateTimeSelection from './DateTimeSelection';
import ClientForm from './ClientForm';
import Confirmation from './Confirmation';

export default function BookingPage() {
    const [step, setStep] = useState(0);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [appointmentData, setAppointmentData] = useState<{ id: string, clientName: string } | null>(null);

    const handleSelectService = (service: Service) => {
        setSelectedService(service);
        setStep(1);
        window.scrollTo(0, 0);
    };

    const handleSelectDate = (date: Date) => {
        setSelectedDate(date);
        setStep(2);
        window.scrollTo(0, 0);
    };

    const handleBookingSuccess = (appointmentId: string, clientName: string) => {
        setAppointmentData({ id: appointmentId, clientName });
        setStep(3);
        window.scrollTo(0, 0);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Progress Bar Simplificada */}
            <div className="flex justify-center mb-8 gap-2">
                {[0, 1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`h-2 rounded-full transition-all duration-300 ${s <= step ? 'w-8 bg-brand-gold' : 'w-2 bg-gray-200'}`}
                    />
                ))}
            </div>

            {step === 0 && (
                <ServiceSelection onSelect={handleSelectService} />
            )}

            {step === 1 && selectedService && (
                <DateTimeSelection
                    service={selectedService}
                    onSelect={handleSelectDate}
                    onBack={() => setStep(0)}
                />
            )}

            {step === 2 && selectedService && selectedDate && (
                <ClientForm
                    serviceId={selectedService.id}
                    startTime={selectedDate}
                    onSubmitSuccess={handleBookingSuccess}
                    onBack={() => setStep(1)}
                />
            )}

            {step === 3 && appointmentData && selectedService && selectedDate && (
                <Confirmation
                    appointmentId={appointmentData.id}
                    clientName={appointmentData.clientName}
                    service={selectedService}
                    startTime={selectedDate}
                />
            )}
        </div>
    );
}
