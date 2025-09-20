import React from "react";
import { HomeIcon, UsersIcon } from "./icons/UiIcons";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  services: string[];
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, services }) => (
  <div className="group relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/95 p-10 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
    <div className="absolute inset-0 bg-gradient-to-br from-[#B98F58]/0 via-[#B98F58]/10 to-[#B98F58]/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
    <div className="relative flex h-full flex-col">
      <div className="flex items-center gap-5 text-left">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0D1B2A]/5 text-[#B98F58]">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-[#0D1B2A]">{title}</h3>
      </div>
      <ul className="mt-6 space-y-3 text-sm leading-relaxed text-gray-600">
        {services.map((service, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#B98F58]/15 text-[#B98F58]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 00-1.414 0L8.5 12.086 5.707 9.293a1 1 0 00-1.414 1.414l3.5 3.5a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span>{service}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 rounded-2xl border border-[#0D1B2A]/10 bg-[#0D1B2A]/5 p-4 text-xs uppercase tracking-widest text-[#0D1B2A]/60">
        Consultoria completa do diagnóstico ao pós-atendimento.
      </div>
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
    <section id="services" className="relative overflow-hidden bg-gray-50 py-24 fade-in-section">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        aria-hidden="true"
        style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(185,143,88,0.12), transparent 55%)' }}
      ></div>
      <div className="relative container mx-auto px-6">
        <div className="text-center">
          <span className="inline-flex items-center justify-center gap-2 rounded-full border border-[#B98F58]/40 bg-[#B98F58]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#0D1B2A]">
            Especialidades
          </span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-[#0D1B2A]">Nossas áreas de atuação</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Soluções personalizadas para resguardar seus ativos, simplificar negociações complexas e acelerar regularizações imobiliárias.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
          {servicesData.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-3xl border border-[#0D1B2A]/10 bg-white/70 px-6 py-8 text-center md:flex-row md:text-left">
          <div className="max-w-2xl text-[#0D1B2A]">
            <h3 className="text-2xl font-semibold">Não encontrou exatamente o que precisa?</h3>
            <p className="mt-2 text-sm text-[#0D1B2A]/70">
              Atuamos também com due diligence, disputas condominiais, regularização fundiária e consultoria preventiva para investidores.
            </p>
          </div>
          <a
            href="#contact"
            className="inline-flex items-center gap-3 rounded-full border border-[#B98F58]/60 bg-[#B98F58] px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a37d4b]"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-white" aria-hidden="true"></span>
            Fale com um especialista
          </a>
        </div>
      </div>
    </section>
  );
};

export default Services;