import React from "react";

interface ServiceCardProps {
  title: string;
  services: string[];
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, services }) => (
  <article className="home-services__card">
    <header className="home-services__card-header">
      <h3 className="home-services__card-title">{title}</h3>
    </header>
    <ul className="home-services__list">
      {services.map((service, index) => (
        <li key={index} className="home-services__item">
          <span className="home-services__bullet" aria-hidden="true" />
          <span className="home-services__item-text">{service}</span>
        </li>
      ))}
    </ul>
  </article>
);

const Services: React.FC = () => {
  const servicesData = [
    {
      title: "Direito Imobiliário",
      services: [
        "Elaboração e revisão de contratos de compra e venda de imóveis;",
        "Análise jurídica e regularização de escrituras e registros imobiliários;",
        "Consultoria e acompanhamento em financiamentos e operações imobiliárias;",
        "Assessoria em contratos de locação (residenciais e comerciais);",
        "Usucapião judicial e extrajudicial;",
        "Averbação de construções e retificações de matrícula;",
        "Assessoria em incorporação imobiliária e loteamentos;",
        "Contencioso imobiliário: ações possessórias, reivindicatórias, adjudicação compulsória e despejo;",
        "Regularização de imóveis perante cartórios e órgãos públicos."
      ]
    },
    {
      title: "Inventários e Sucessões",
      services: [
        "Abertura de inventário judicial e extrajudicial;",
        "Planejamento sucessório para proteção patrimonial;",
        "Assessoria em partilha de bens (consensual e litigiosa);",
        "Habilitação de herdeiros e resolução de conflitos familiares;",
        "Elaboração de testamentos e orientações para sua execução;",
        "Assessoria em sobrepartilha e arrolamento sumário;",
        "Regularização de bens herdados junto a cartórios e registros públicos;",
        "Consultoria em doações e antecipações de legítima;",
        "Defesas em ações de anulação ou nulidade de partilhas."
      ]
    }
  ];

  return (
    <section id="services" className="home-services fade-in-section">
      <div className="container">
        <div className="home-section-heading">
          <span className="home-section-heading__eyebrow">expertise jurídica</span>
          <h2 className="home-section-heading__title">Nossas áreas de atuação</h2>
          <p className="home-section-heading__description">
            Oferecemos consultoria especializada para proteger e valorizar o seu patrimônio com segurança e precisão técnica.
          </p>
        </div>
        <div className="home-services__grid">
          {servicesData.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
