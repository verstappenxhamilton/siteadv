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
        console.log('Form submitted:', formData);
        alert('Mensagem enviada com sucesso! (Simulação)');
        setFormData({ name: '', email: '', phone: '', message: '' });
    };

    return (
        <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nome" required />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
            </div>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Telefone (Opcional)" />
            <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Sua mensagem" rows={5} required></textarea>
            <button type="submit" className="form-submit-button">Enviar Mensagem</button>
        </form>
    );
};

export default ContactForm;