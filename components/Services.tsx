import React from "react";
import { BriefcaseIcon, HomeIcon, UsersIcon } from "./icons/UiIcons";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  summary: string;
  services: string[];
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, summary, services }) => (
  <div className="group relative h-full">
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#B98F58]/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative flex h-full flex-col justify-between rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.12)] transition-all duration-300 group-hover:-translate-y-2">
      <div>
        <div className="mb-6 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D1B2A]/10 text-[#0D1B2A] transition-colors duration-300 group-hover:bg-[#0D1B2A] group-hover:text-white">
            {icon}
          </span>
          <h3 className="text-xl font-semibold text-[#0D1B2A]">{title}</h3>
        </div>
        <p className="text-sm text-slate-600 sm:text-base">{summary}</p>
        <ul className="mt-6 space-y-3 text-sm text-slate-600">
          {services.map((service, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#B98F58]" aria-hidden="true" />
              <span>{service}</span>
            </li>
          ))}
        </ul>
      </div>
      <a
        href="#contact"
        className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#0D1B2A] transition-colors duration-300 hover:text-[#B98F58]"
      >
        <span>Falar com um especialista</span>
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="M13 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  </div>
);

const Services: React.FC = () => {
  const servicesData = [
    {
      icon: <HomeIcon className="h-10 w-10" />,
      title: "Direito Imobiliário",
      summary:
        "Cuidamos de cada etapa da jornada imobiliária – da negociação contratual à defesa em litígios complexos – garantindo previsibilidade jurídica e segurança patrimonial.",
      services: [
        "Elaboração e revisão de contratos de compra e venda de imóveis;",
        "Análise jurídica e regularização de escrituras e registros imobiliários;",
        "Consultoria e acompanhamento em financiamentos e operações imobiliárias;",
        "Assessoria em contratos de locação (residenciais e comerciais);",
        "Usucapião judicial e extrajudicial;",
        "Averbação de construções e retificações de matrícula;",
        "Assessoria em incorporação imobiliária e loteamentos;",
        "Contencioso imobiliário: ações possessórias, reivindicatórias, adjudicação compulsória e despejo;",
        "Regularização de imóveis perante cartórios e órgãos públicos.",
      ],
    },
    {
      icon: <UsersIcon className="h-10 w-10" />,
      title: "Inventários e Sucessões",
      summary:
        "Conduzimos inventários judiciais e extrajudiciais com visão estratégica e acolhimento, preservando vínculos familiares e a integridade do patrimônio herdado.",
      services: [
        "Abertura de inventário judicial e extrajudicial;",
        "Planejamento sucessório para proteção patrimonial;",
        "Assessoria em partilha de bens (consensual e litigiosa);",
        "Habilitação de herdeiros e resolução de conflitos familiares;",
        "Elaboração de testamentos e orientações para sua execução;",
        "Assessoria em sobrepartilha e arrolamento sumário;",
        "Regularização de bens herdados junto a cartórios e registros públicos;",
        "Consultoria em doações e antecipações de legítima;",
        "Defesas em ações de anulação ou nulidade de partilhas.",
      ],
    },
    {
      icon: <BriefcaseIcon className="h-10 w-10" />,
      title: "Consultoria Empresarial",
      summary:
        "Suporte contínuo para incorporadoras, loteadoras e empresas do mercado imobiliário com foco em mitigação de riscos, governança e expansão sustentável.",
      services: [
        "Auditoria jurídica para aquisição de ativos imobiliários;",
        "Estruturação de SPEs, consórcios e parcerias estratégicas;",
        "Due diligence completa para operações societárias;",
        "Modelagem de contratos built-to-suit e sale & leaseback;",
        "Gestão de passivos e recuperação de créditos imobiliários;",
        "Representação em arbitragens e disputas empresariais complexas.",
      ],
    },
  ];

  return (
    <section id="services" className="relative overflow-hidden bg-slate-50 py-24 fade-in-section">
      <div className="pointer-events-none absolute -top-28 right-24 hidden h-64 w-64 rounded-full bg-[#B98F58]/10 blur-3xl lg:block" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#0D1B2A]/5 blur-3xl" />

      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center justify-center rounded-full bg-[#0D1B2A]/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#0D1B2A]">
            Especialidades
          </span>
          <h2 className="mt-6 text-4xl font-bold uppercase tracking-wider text-[#0D1B2A] sm:text-5xl">
            Nossas Áreas de Atuação
          </h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#B98F58]" />
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Oferecemos soluções jurídicas especializadas para proteger e valorizar o que é mais importante para você.
            Transformamos burocracias em estratégias objetivas, com acompanhamento próximo em cada etapa do processo.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-3">
          {servicesData.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>

        <div className="mt-20">
          <div className="relative overflow-hidden rounded-3xl bg-[#0D1B2A] px-8 py-12 text-white shadow-[0_40px_80px_rgba(13,27,42,0.45)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(185,143,88,0.35),_transparent_60%)]" aria-hidden="true" />
            <div className="relative grid gap-8 lg:grid-cols-[2fr_1fr] lg:items-center">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold uppercase tracking-[0.25em]">Diagnóstico Personalizado</h3>
                <p className="text-base text-white/80">
                  Agende uma reunião estratégica para mapear riscos, oportunidades e definir o plano jurídico ideal para o seu
                  patrimônio. Em 48 horas você recebe um roadmap completo de atuação.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#0D1B2A] transition-colors duration-300 hover:bg-[#B98F58] hover:text-white"
                >
                  Solicitar contato
                </a>
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white/10"
                >
                  <i className="bi bi-whatsapp" aria-hidden="true" /> Atendimento imediato
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;