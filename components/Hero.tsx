import React from "react";
import { WhatsappIcon } from "./icons/SocialIcons";
import { GavelHouseIcon, WillTreeIcon, HandshakeIcon } from "./icons/UiIcons";

const heroHighlights = [
  {
    title: "Regularização completa",
    description: "Gestão estratégica de contratos e registros para blindar seu patrimônio imobiliário.",
    icon: <GavelHouseIcon className="h-6 w-6" />,
  },
  {
    title: "Inventários humanizados",
    description: "Processos sucessórios conduzidos com celeridade, empatia e comunicação transparente.",
    icon: <WillTreeIcon className="h-6 w-6" />,
  },
  {
    title: "Atendimento próximo",
    description: "Equipe disponível em todo o Brasil com foco em soluções customizadas para cada família.",
    icon: <HandshakeIcon className="h-6 w-6" />,
  },
];

const heroStats = [
  { value: "1.200+", label: "casos imobiliários concluídos" },
  { value: "15 anos", label: "de experiência dedicada" },
  { value: "98%", label: "dos clientes indicariam o escritório" },
];

const Hero: React.FC = () => {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-gray-900 text-white">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://github.com/verstappenxhamilton/siteadv/blob/adv2.8/public/images/regularizacao-de-imoveis.png?raw=true)",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#05090F]/95 via-[#0D1B2A]/80 to-[#13263D]/70" />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-black/70 via-transparent to-transparent" />
        <div className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-[#B98F58]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-[#25D366]/10 blur-[120px]" />
      </div>

      <div className="relative container mx-auto px-6 py-24">
        <div className="mx-auto max-w-5xl space-y-10 text-center lg:text-left">
          <div className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/80 backdrop-blur-sm lg:justify-start">
            <span className="h-2 w-2 rounded-full bg-[#B98F58]" aria-hidden="true" />
            Referência em Direito Imobiliário
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold uppercase tracking-[0.3em] sm:text-5xl md:text-6xl lg:text-7xl">
              NEIVA & ASSOCIADOS
            </h1>
            <div className="mx-auto h-1 w-28 bg-[#B98F58] lg:mx-0" />
            <p className="text-lg text-white/90 sm:text-xl md:text-2xl">
              Escritório boutique especializado em advocacia imobiliária, inventários e sucessões.
            </p>
            <p className="text-base text-white/70 sm:text-lg">
              Estruturamos estratégias jurídicas sob medida para assegurar segurança patrimonial, prevenir litígios e acelerar
              decisões em momentos sensíveis para sua família ou empresa.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <a
              href="#contact"
              className="inline-flex items-center gap-3 rounded-full border border-[#B98F58]/80 bg-[#B98F58] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] shadow-[0_10px_35px_rgba(185,143,88,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a37d4b] hover:shadow-[0_20px_42px_rgba(185,143,88,0.5)] md:text-base"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-white" aria-hidden="true" />
              Agende sua Consulta Gratuita
            </a>
            <a
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/15 px-8 py-3 text-sm font-semibold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25 md:text-base"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]/20">
                <WhatsappIcon className="h-4 w-4 text-[#25D366]" />
              </span>
              Fale pelo WhatsApp
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {heroHighlights.map((highlight) => (
              <div
                key={highlight.title}
                className="flex items-start gap-4 rounded-3xl border border-white/15 bg-white/10 p-5 text-left shadow-[0_20px_45px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/15"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D1B2A]/70 text-[#B98F58]">
                  {highlight.icon}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-white sm:text-lg">{highlight.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-center backdrop-blur">
                <div className="text-3xl font-bold text-white sm:text-4xl">{stat.value}</div>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;