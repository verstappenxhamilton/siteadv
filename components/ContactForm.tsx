
import React, { useState } from 'react';

const ContactForm: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would handle form submission here (e.g., send to an API)
        console.log('Form submitted:', formData);
        alert('Mensagem enviada com sucesso! (Simulação)');
        setFormData({ name: '', email: '', phone: '', message: '' });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-white">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="flex flex-col text-xs uppercase tracking-[0.3em] text-white/70">
                    Nome completo
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Como devemos chamá-lo?"
                        className="mt-2 w-full rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-sm font-medium text-[#0D1B2A] placeholder:text-[#0D1B2A]/50 focus:border-[#B98F58] focus:outline-none focus:ring-2 focus:ring-[#B98F58]/50"
                        required
                    />
                </label>
                <label className="flex flex-col text-xs uppercase tracking-[0.3em] text-white/70">
                    Email
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Para enviarmos os próximos passos"
                        className="mt-2 w-full rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-sm font-medium text-[#0D1B2A] placeholder:text-[#0D1B2A]/50 focus:border-[#B98F58] focus:outline-none focus:ring-2 focus:ring-[#B98F58]/50"
                        required
                    />
                </label>
            </div>
            <label className="flex flex-col text-xs uppercase tracking-[0.3em] text-white/70">
                Telefone (opcional)
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Preferimos falar por onde?"
                    className="mt-2 w-full rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-sm font-medium text-[#0D1B2A] placeholder:text-[#0D1B2A]/50 focus:border-[#B98F58] focus:outline-none focus:ring-2 focus:ring-[#B98F58]/50"
                />
            </label>
            <label className="flex flex-col text-xs uppercase tracking-[0.3em] text-white/70">
                Resuma o seu caso
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Conte com quem está envolvido, prazos e objetivos."
                    rows={5}
                    className="mt-2 w-full rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-sm font-medium text-[#0D1B2A] placeholder:text-[#0D1B2A]/50 focus:border-[#B98F58] focus:outline-none focus:ring-2 focus:ring-[#B98F58]/50"
                    required
                ></textarea>
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Seus dados são utilizados apenas para o atendimento jurídico.
                </span>
                <button
                    type="submit"
                    className="inline-flex items-center gap-3 rounded-full border border-[#B98F58]/70 bg-[#B98F58] px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a37d4b] focus:outline-none focus:ring-2 focus:ring-[#B98F58]/70"
                >
                    <span className="inline-block h-2 w-2 rounded-full bg-white" aria-hidden="true"></span>
                    Enviar mensagem
                </button>
            </div>
        </form>
    );
};

export default ContactForm;