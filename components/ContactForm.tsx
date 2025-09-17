
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
                        className="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-[#B98F58] transition-colors"
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
                        className="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-[#B98F58] transition-colors"
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
                    className="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-[#B98F58] transition-colors"
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
                    className="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-[#B98F58] transition-colors"
                    required
                ></textarea>
            </div>
            <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-[#B98F58] text-white font-bold uppercase rounded-sm hover:bg-[#a37d4b] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[#B98F58]"
            >
                Enviar Mensagem
            </button>
        </form>
    );
};

export default ContactForm;