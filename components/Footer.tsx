import React from "react";
import type { HomeThemeOption } from "../types/home-theme";
import ContactForm from "./ContactForm";
import { SocialIconsList } from "./icons/SocialIcons";

type FooterProps = {
  theme: HomeThemeOption;
};

const Footer: React.FC<FooterProps> = ({ theme }) => {
  if (theme === "legacy") {
    return (
      <footer id="contact" className="bg-[#0D1B2A] text-white fade-in-section">
        <div className="container mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-4xl font-bold mb-2 uppercase">Entre em Contato</h2>
              <div className="w-20 h-1 bg-[#B98F58] my-4" />
              <p className="text-gray-400 mb-8 max-w-lg">
                Tem alguma dúvida ou precisa de uma consulta? Preencha o formulário ao lado ou utilize um de nossos canais de atendimento. Nossa equipe está pronta para ajudar.
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:contato@pavan.adv.br" className="hover:text-[#B98F58] transition-colors">
                    contato@pavan.adv.br
                  </a>
                </div>
              </div>
            </div>
            <div>
              <ContactForm theme={theme} />
            </div>
          </div>
        </div>
        <div className="bg-black bg-opacity-30 py-6">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-400 mb-4 md:mb-0">&copy; {new Date().getFullYear()} Pavan &amp; Associados. Todos os direitos reservados.</p>
            <div className="flex items-center space-x-6">
              <SocialIconsList />
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer id="contact" className="site-footer fade-in-section">
      <div className="container site-footer__primary">
        <div className="site-footer__grid">
          <div className="site-footer__info">
            <span className="home-section-heading__eyebrow">contato</span>
            <h2 className="site-footer__title">Pronto para falar com um especialista?</h2>
            <p className="site-footer__description">
              Preencha o formulário ou escolha um dos canais abaixo. Nossa equipe jurídica está pronta para orientar o seu caso com agilidade e discrição.
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
            <ContactForm theme={theme} />
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
