import React from "react";

interface ServiceCardProps {
  title: string;
  services: string[];
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, services }) => (
  <article className="flex h-full flex-col rounded-xl border border-gray-200/70 bg-white/95 p-8 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
    <header className="border-b border-gray-200 pb-4">
      <h3 className="text-2xl font-semibold text-[#0D1B2A]">{title}</h3>
    </header>
    <ul className="mt-6 space-y-3 text-gray-600">
      {services.map((service, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="mt-2 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#B98F58]" aria-hidden="true"></span>
          <span className="leading-relaxed">{service}</span>
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
    <section id="services" className="bg-gray-50 py-20 fade-in-section">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold uppercase tracking-wide text-gray-800">Nossas Áreas de Atuação</h2>
          <div className="mx-auto mt-4 h-1 w-20 bg-[#B98F58]"></div>
          <p className="mt-4 text-lg text-gray-600">Oferecemos consultoria especializada para proteger e valorizar o seu patrimônio.</p>
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {servicesData.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;