import React from "react";
import { WhatsappIcon } from "./icons/SocialIcons";

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gray-900 text-white flex items-center">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(https://github.com/verstappenxhamilton/siteadv/blob/adv2.8/public/images/regularizacao-de-imoveis.png?raw=true)` }}
          aria-hidden="true"
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
      </div>
      <div className="relative container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold uppercase tracking-[0.35em]">NEIVA & ASSOCIADOS</h1>
            <div className="w-24 h-1 bg-[#B98F58] mx-auto"></div>
            <p className="text-xl md:text-2xl font-light">Advocacia Imobiliária e Inventários</p>
            <p className="text-lg md:text-xl text-gray-300">­</p>
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="#contact"
              className="inline-flex items-center gap-3 rounded-full border border-[#B98F58]/80 bg-[#B98F58] px-8 py-3 text-sm md:text-base font-semibold uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(185,143,88,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a37d4b] hover:shadow-[0_18px_36px_rgba(185,143,88,0.45)]"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-white" aria-hidden="true"></span>
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
};

export default Hero;