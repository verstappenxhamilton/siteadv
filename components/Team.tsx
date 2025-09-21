import React from 'react';

const Team: React.FC = () => {
  return (
    <div className="team-container">
      <h2 className="section-title">Conheça o Fundador</h2>
      <p className="section-subtitle">
        Liderança, experiência e dedicação a serviço da justiça.
      </p>
      <div className="team-content-wrapper">
        <div className="team-image-container">
          {/* Placeholder for the founder's image */}
          <img 
            src="https://placehold.co/400x400/1a1a1a/D4AF37?text=Dr.+Ricardo+Pavan"
            alt="Dr. Ricardo Pavan" 
            className="team-image"
          />
        </div>
        <div className="team-text-container">
          <h3 className="team-name">Dr. Ricardo Pavan</h3>
          <p className="team-description">
            Com mais de 15 anos de experiência e uma paixão incansável pela justiça, Dr. Ricardo Pavan fundou a Pavan & Associados com a missão de oferecer uma advocacia acessível, transparente e altamente eficaz.
          </p>
          <p className="team-description">
            Especializado em direito imobiliário e sucessório, ele lidera uma equipe dedicada a proteger os interesses e o patrimônio de seus clientes, transformando complexidades legais em soluções claras e seguras.
          </p>
          <a href="#contact" className="team-cta-button">
            Conheça nossa história
          </a>
        </div>
      </div>
    </div>
  );
};

export default Team;
