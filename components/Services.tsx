import React from "react";
import type { HomeThemeOption } from "../types/home-theme";

interface ServiceCardProps {
  title: string;
  services: string[];
}

const servicesData: ServiceCardProps[] = [
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

const ModernServiceCard: React.FC<ServiceCardProps> = ({ title, services }) => (
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

const Services: React.FC<{ theme: HomeThemeOption }> = ({ theme }) => {
  if (theme === "legacy") {
    return (
      <section id="services" className="bg-gray-50 py-20 fade-in-section">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold uppercase tracking-wide text-gray-800">Nossas Áreas de Atuação</h2>
            <div className="mx-auto mt-4 h-1 w-20 bg-[#B98F58]" />
            <p className="mt-4 text-lg text-gray-600">Oferecemos consultoria especializada para proteger e valorizar o seu patrimônio.</p>
          </div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {servicesData.map((service, index) => (
              <article
                key={index}
                className="flex h-full flex-col rounded-xl border border-gray-200/70 bg-white/95 p-8 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <header className="border-b border-gray-200 pb-4">
                  <h3 className="text-2xl font-semibold text-[#0D1B2A]">{service.title}</h3>
                </header>
                <ul className="mt-6 space-y-3 text-gray-600">
                  {service.services.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <span className="mt-2 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#B98F58]" aria-hidden="true" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
            <ModernServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
