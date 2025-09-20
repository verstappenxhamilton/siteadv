import React from 'react';

const Team: React.FC = () => {
  return (
    <section id="team" className="relative overflow-hidden bg-white py-24 fade-in-section">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
        style={{ backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(185,143,88,0.12), transparent 55%)' }}
      ></div>
      <div className="relative container mx-auto px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="order-2 space-y-8 text-center lg:order-1 lg:text-left">
            <span className="inline-flex items-center justify-center gap-2 rounded-full border border-[#B98F58]/30 bg-[#B98F58]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#0D1B2A]">
              Fundador
            </span>
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-[#0D1B2A]">Dr. Ricardo Pavan</h2>
              <p className="mt-2 text-sm uppercase tracking-[0.4em] text-[#B98F58]">OAB/SP 245.337 • Mestre em Direito Imobiliário</p>
            </div>
            <p className="text-lg leading-relaxed text-gray-600">
              Desde 2008, o Dr. Ricardo conduz operações imobiliárias de alta complexidade, resolve disputas envolvendo patrimônio familiar e estrutura planejamentos sucessórios sob medida para famílias e empresas.
            </p>
            <p className="leading-relaxed text-gray-600">
              Sua atuação reúne precisão técnica e visão de negócios, garantindo que cada decisão jurídica seja tomada com clareza, estratégia e diálogo constante com o cliente.
            </p>
            <blockquote className="rounded-3xl border border-[#0D1B2A]/10 bg-[#0D1B2A]/5 p-6 text-left text-sm italic text-[#0D1B2A]">
              "Confiança nasce da transparência. Meu papel é traduzir o jurídico em caminhos seguros para que você tome decisões com tranquilidade."
            </blockquote>
            <div className="flex flex-col items-center gap-4 text-sm uppercase tracking-widest text-[#0D1B2A]/70 lg:flex-row lg:items-center">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0D1B2A] text-white">15+</span>
                <span>Anos em direito imobiliário e sucessório</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#B98F58]/15 text-[#B98F58]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5a12.083 12.083 0 01-6.16-10.922L12 14z" />
                  </svg>
                </span>
                <span>Mais de 400 casos conduzidos pessoalmente</span>
              </div>
            </div>
            <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="#contact"
                className="inline-flex items-center gap-3 rounded-full border border-[#0D1B2A] bg-[#0D1B2A] px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#162b45]"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-white" aria-hidden="true"></span>
                Agendar reunião
              </a>
              <a
                href="mailto:ricardo@pavan.adv.br"
                className="inline-flex items-center gap-2 rounded-full border border-[#0D1B2A]/40 px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#0D1B2A] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0D1B2A]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#B98F58]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" />
                </svg>
                ricardo@pavan.adv.br
              </a>
            </div>
          </div>
          <div className="order-1 overflow-hidden rounded-[32px] border border-[#0D1B2A]/10 bg-white shadow-xl lg:order-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#0D1B2A]/10 to-[#0D1B2A]/30"></div>
              <img
                src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=1000&q=80"
                alt="Retrato do Dr. Ricardo Pavan"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-6 left-6 rounded-2xl bg-white/90 p-5 text-left shadow-lg backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#B98F58]">Formação</p>
                <p className="mt-2 text-sm font-semibold text-[#0D1B2A]">FGV Direito SP</p>
                <p className="text-xs text-[#0D1B2A]/60">Especialização em Direito Imobiliário e Negócios</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;