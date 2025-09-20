import React from "react";
import { BriefcaseIcon, HomeIcon, UsersIcon } from "./icons/UiIcons";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  services: string[];
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, services }) => (
  <div className="group relative transform transition-transform duration-300 hover:-translate-y-2">
    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#B98F58]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
    <div className="relative flex h-full flex-col rounded-xl border border-gray-200/70 bg-white/95 p-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 text-[#B98F58] transition-colors duration-300 group-hover:text-[#0D1B2A]">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-[#0D1B2A]">{title}</h3>
      </div>
      <ul className="mt-3 text-gray-600 list-disc list-inside text-left">
        {services.map((service, index) => (
          <li key={index}>{service}</li>
        ))}
      </ul>
    </div>
  </div>
);

const Services: React.FC = () => {
  const servicesData = [
    {
      icon: <HomeIcon className="h-12 w-12" />,
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
      icon: <UsersIcon className="h-12 w-12" />,
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
    <section id="services" className="bg-gray-50 py-24 fade-in-section">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold uppercase tracking-wider text-gray-800">Nossas Áreas de Atuação</h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#B98F58]"></div>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Oferecemos soluções jurídicas especializadas para proteger e valorizar o que é mais importante para você.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
          {servicesData.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;