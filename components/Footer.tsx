import React from "react";
import ContactForm from "./ContactForm";
import { SocialIconsList } from "./icons/SocialIcons";

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="site-footer fade-in-section">
      <div className="container site-footer__primary">
        <div className="site-footer__grid">
          <div className="site-footer__info">
            <span className="home-section-heading__eyebrow">contato</span>
            <h2 className="site-footer__title">Pronto para falar com um especialista?</h2>
            <p className="site-footer__description">
              Preencha o formulário ou escolha um dos canais abaixo. Nossa equipe jurídica está pronta para orientar o seu caso
              com agilidade e discrição.
            </p>
            <div className="site-footer__channels">
              <a href="tel:+43574301234" className="site-footer__channel">
                <span className="site-footer__channel-icon" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.6}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </span>
                <span className="site-footer__channel-text">43 57430 1234</span>
              </a>
              <a href="mailto:contato@pavan.adv.br" className="site-footer__channel">
                <span className="site-footer__channel-icon" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.6}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <span className="site-footer__channel-text">contato@pavan.adv.br</span>
              </a>
            </div>
          </div>
          <div className="site-footer__form">
            <ContactForm />
          </div>
        </div>
      </div>
      <div className="site-footer__bottom">
        <div className="container site-footer__bottom-inner">
          <p className="site-footer__copyright">&copy; {new Date().getFullYear()} Pavan &amp; Associados. Todos os direitos reservados.</p>
          <div className="site-footer__social">
            <SocialIconsList />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
