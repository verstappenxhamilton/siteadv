import React from "react";
import type { HomeThemeOption } from "../types/home-theme";

type TeamProps = {
  theme: HomeThemeOption;
};

const TEAM_PHOTO = "https://picsum.photos/seed/lawyer1/500/600";

const Team: React.FC<TeamProps> = ({ theme }) => {
  if (theme === "legacy") {
    return (
      <section id="team" className="py-20 bg-white fade-in-section">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/3">
              <div className="relative">
                <div className="absolute -top-3 -left-3 w-full h-full border-2 border-[#B98F58] rounded-lg z-0" />
                <img src={TEAM_PHOTO} alt="Dr. Ricardo Pavan" className="relative w-full h-auto rounded-lg shadow-2xl z-10" />
              </div>
            </div>
            <div className="md:w-2/3 md:pl-10">
              <h2 className="text-4xl font-bold text-gray-800 uppercase tracking-wide">Conheça o Fundador</h2>
              <div className="w-20 h-1 bg-[#B98F58] my-4" />
              <h3 className="text-2xl font-semibold text-[#B98F58] mb-4">Dr. Ricardo Pavan</h3>
              <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                Com mais de 15 anos de experiência e uma paixão incansável pela justiça, Dr. Ricardo Pavan fundou a Pavan &amp; Associados com a missão de oferecer uma advocacia acessível, transparente e altamente eficaz.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Especializado em direito imobiliário e sucessório, ele lidera uma equipe dedicada a proteger os interesses e o patrimônio de seus clientes, transformando complexidades legais em soluções claras e seguras.
              </p>
              <a
                href="#contact"
                className="inline-block px-6 py-3 border border-[#0D1B2A] text-[#0D1B2A] font-bold uppercase rounded-sm hover:bg-[#0D1B2A] hover:text-white transition-colors duration-300"
              >
                Fale com um Especialista
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="team" className="home-team fade-in-section">
      <div className="container">
        <div className="home-team__layout">
          <div className="home-team__photo-wrapper">
            <div className="home-team__photo-border" aria-hidden="true" />
            <img src={TEAM_PHOTO} alt="Dr. Ricardo Pavan" className="home-team__photo" />
          </div>
          <div className="home-team__content">
            <span className="home-section-heading__eyebrow">sobre o fundador</span>
            <h2 className="home-section-heading__title">Conheça o especialista por trás da banca</h2>
            <p className="home-team__subtitle">Dr. Ricardo Pavan</p>
            <p className="home-team__text">
              Com mais de 15 anos de experiência e uma paixão incansável pela justiça, Dr. Ricardo Pavan fundou o escritório com a missão de oferecer uma advocacia acessível, transparente e altamente eficaz.
            </p>
            <p className="home-team__text">
              Especializado em direito imobiliário e sucessório, ele lidera uma equipe dedicada a proteger o patrimônio de seus clientes, traduzindo complexidades legais em estratégias claras e seguras.
            </p>
            <a href="#contact" className="home-team__cta">
              Fale com um especialista
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
