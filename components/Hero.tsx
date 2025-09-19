import React from "react";
import type { HomeThemeOption } from "../types/home-theme";
import { WhatsappIcon } from "./icons/SocialIcons";

type HeroProps = {
  theme: HomeThemeOption;
};

const HERO_IMAGE = "https://picsum.photos/seed/law-office/1920/1080";

const Hero: React.FC<HeroProps> = ({ theme }) => {
  if (theme === "legacy") {
    return (
      <section className="relative min-h-screen overflow-hidden bg-gray-900 text-white flex items-center fade-in-section">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMAGE})` }} aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        </div>
        <div className="relative container mx-auto px-6 py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold uppercase tracking-[0.35em]">
                NEIVA & ASSOCIADOS
              </h1>
              <div className="w-24 h-1 bg-[#B98F58] mx-auto" />
              <p className="text-xl md:text-2xl font-light">Advocacia Imobiliária e Inventários</p>
              <p className="text-lg md:text-xl text-gray-300">Soluções Jurídicas Completas para Seu Patrimônio</p>
            </div>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="#contact"
                className="inline-flex items-center gap-3 rounded-full border border-[#B98F58]/80 bg-[#B98F58] px-8 py-3 text-sm md:text-base font-semibold uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(185,143,88,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a37d4b] hover:shadow-[0_18px_36px_rgba(185,143,88,0.45)]"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-white" aria-hidden="true" />
                Agende sua Consulta Gratuita
              </a>
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/15 px-8 py-3 text-sm md:text-base font-semibold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]/20">
                  <WhatsappIcon className="h-4 w-4 text-[#25D366]" />
                </span>
                Fale pelo WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="home-hero fade-in-section">
      <div className="home-hero__background" aria-hidden="true">
        <div className="home-hero__image" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
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
