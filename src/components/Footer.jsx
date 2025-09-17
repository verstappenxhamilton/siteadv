import React, { useMemo, useState } from 'react';
import { InstagramIcon, TwitterIcon, WhatsappIcon } from './icons/Icons.jsx';

const SocialLinks = () => {
  const items = useMemo(
    () => [
      { href: 'https://wa.me/1234567890', label: 'Whatsapp', icon: <WhatsappIcon className="w-5 h-5" /> },
      { href: 'https://twitter.com/pavan', label: 'Twitter', icon: <TwitterIcon className="w-5 h-5" /> },
      { href: 'https://instagram.com/pavan', label: 'Instagram', icon: <InstagramIcon className="w-5 h-5" /> },
    ],
    [],
  );

  return (
    <div className="flex items-center space-x-4">
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          className="text-gray-400 hover:text-[#B98F58] transition-colors"
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
};

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState({ message: '', type: '' });

  const updateStatus = (message, type) => setStatus({ message, type });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    updateStatus('Enviando...', 'info');

    try {
      const response = await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar mensagem');
      }

      updateStatus('Mensagem enviada com sucesso!', 'success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Erro ao enviar contato', error);
      updateStatus('Erro ao enviar. Tente novamente.', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="sr-only">
            Nome
          </label>
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
          <label htmlFor="email" className="sr-only">
            Email
          </label>
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
        <label htmlFor="phone" className="sr-only">
          Telefone
        </label>
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
        <label htmlFor="message" className="sr-only">
          Mensagem
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Mensagem"
          rows={4}
          className="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-[#B98F58] transition-colors"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto px-8 py-3 bg-[#B98F58] text-white font-bold uppercase rounded-sm hover:bg-[#a37d4b] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[#B98F58]"
      >
        Enviar Mensagem
      </button>
      {status.message && (
        <p
          className={`text-sm ${
            status.type === 'success'
              ? 'text-emerald-300'
              : status.type === 'error'
              ? 'text-red-300'
              : 'text-gray-200'
          }`}
        >
          {status.message}
        </p>
      )}
    </form>
  );
};

const Footer = () => (
  <footer id="contact" className="bg-[#0D1B2A] text-white fade-in-section">
    <div className="container mx-auto px-6 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        <div>
          <h2 className="text-4xl font-bold mb-2 uppercase">Entre em Contato</h2>
          <div className="w-20 h-1 bg-[#B98F58] my-4" />
          <p className="text-gray-400 mb-8 max-w-lg">
            Tem alguma dúvida ou precisa de uma consulta? Preencha o formulário ao lado ou utilize um de nossos canais de
            atendimento. Nossa equipe está pronta para ajudar.
          </p>
          <div className="space-y-4 text-lg">
            <div className="flex items-center space-x-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#B98F58]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <a href="tel:+43574301234" className="tracking-wider hover:text-[#B98F58] transition-colors">
                43 57430 1234
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#B98F58]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <a href="mailto:contato@pavan.adv.br" className="hover:text-[#B98F58] transition-colors">
                contato@pavan.adv.br
              </a>
            </div>
          </div>
        </div>
        <ContactForm />
      </div>
    </div>
    <div className="bg-black bg-opacity-30 py-6">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm">
        <p className="text-gray-400 mb-4 md:mb-0">
          © {new Date().getFullYear()} Pavan &amp; Associados. Todos os direitos reservados.
        </p>
        <div className="flex items-center space-x-6">
          <SocialLinks />
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
