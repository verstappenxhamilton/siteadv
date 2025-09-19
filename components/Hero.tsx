import React from "react";
import { WhatsappIcon } from "./icons/SocialIcons";

const Hero: React.FC = () => {
  return (
    <section className="home-hero fade-in-section">
      <div className="home-hero__background" aria-hidden="true">
        <div
          className="home-hero__image"
          style={{ backgroundImage: "url(https://picsum.photos/seed/law-office/1920/1080)" }}
        />
        <div className="home-hero__overlay" />
      </div>
      <div className="home-hero__content container">
        <div className="home-hero__inner">
          <div className="home-hero__headline">
            <h1 className="home-hero__title">NEIVA & ASSOCIADOS</h1>
            <div className="home-hero__divider" />
            <p className="home-hero__subtitle">Advocacia Imobiliária e Inventários</p>
            <p className="home-hero__description">Soluções jurídicas completas para o seu patrimônio</p>
          </div>
          <div className="home-hero__actions">
            <a href="#contact" className="home-hero__primary-button">
              <span className="home-hero__primary-indicator" aria-hidden="true" />
              Agende sua consulta gratuita
            </a>
            <a
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="home-hero__secondary-button"
            >
              <span className="home-hero__secondary-icon">
                <WhatsappIcon className="home-hero__secondary-icon-graphic" />
              </span>
              Fale pelo WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
