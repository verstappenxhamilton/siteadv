import React from 'react';
import ContactForm from './ContactForm';
import { SocialIconsList } from './icons/SocialIcons';

const Contact: React.FC = () => {
  return (
    <div className="contact-container">
      <h2 className="section-title">Entre em Contato</h2>
      <p className="section-subtitle">
        Pronto para dar o próximo passo? Envie-nos uma mensagem e nossa equipe responderá em breve.
      </p>
      <div className="contact-content-wrapper">
        <div className="contact-info">
          <h3 className="contact-info-title">Informações de Contato</h3>
          <p>Tem alguma dúvida ou precisa de uma consulta? Utilize um de nossos canais de atendimento.</p>
          <div className="contact-details">
            <div className="contact-detail-item">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#B98F58]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <span>43 57430 1234</span>
            </div>
            <div className="contact-detail-item">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#B98F58]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <span>contato@pavan.adv.br</span>
            </div>
          </div>
          <div className="contact-socials">
            <h4 className="contact-socials-title">Siga-nos</h4>
            <SocialIconsList />
          </div>
        </div>
        <div className="contact-form-container">
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default Contact;
