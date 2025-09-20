
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="sr-only">Nome</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nome"
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#B98F58] focus:ring-offset-2 focus:ring-offset-transparent transition"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#B98F58] focus:ring-offset-2 focus:ring-offset-transparent transition"
                        required
                    />
                </div>
            </div>
            <div>
                 <label htmlFor="phone" className="sr-only">Telefone</label>
                 <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Telefone (Opcional)"
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#B98F58] focus:ring-offset-2 focus:ring-offset-transparent transition"
                />
            </div>
            <div>
                <label htmlFor="message" className="sr-only">Mensagem</label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Mensagem"
                    rows={4}
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#B98F58] focus:ring-offset-2 focus:ring-offset-transparent transition"
                    required
                ></textarea>
            </div>
            <button
                type="submit"
                className="w-full rounded-full bg-[#B98F58] px-10 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_18px_32px_rgba(185,143,88,0.45)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#a37d4b] focus:outline-none focus:ring-2 focus:ring-[#B98F58] focus:ring-offset-2 focus:ring-offset-[#0D1B2A]/40 sm:w-auto"
            >
                Enviar Mensagem
            </button>
        </form>
    );
};

export default ContactForm;