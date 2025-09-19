import React from "react";

const Team: React.FC = () => {
  return (
    <section id="team" className="home-team fade-in-section">
      <div className="container">
        <div className="home-team__layout">
          <div className="home-team__photo-wrapper">
            <div className="home-team__photo-border" aria-hidden="true" />
            <img
              src="https://picsum.photos/seed/lawyer1/500/600"
              alt="Dr. Ricardo Pavan"
              className="home-team__photo"
            />
          </div>
          <div className="home-team__content">
            <span className="home-section-heading__eyebrow">sobre o fundador</span>
            <h2 className="home-section-heading__title">Conheça o especialista por trás da banca</h2>
            <p className="home-team__subtitle">Dr. Ricardo Pavan</p>
            <p className="home-team__text">
              Com mais de 15 anos de experiência e uma paixão incansável pela justiça, Dr. Ricardo Pavan fundou o escritório com
              a missão de oferecer uma advocacia acessível, transparente e altamente eficaz.
            </p>
            <p className="home-team__text">
              Especializado em direito imobiliário e sucessório, ele lidera uma equipe dedicada a proteger o patrimônio de seus
              clientes, traduzindo complexidades legais em estratégias claras e seguras.
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
