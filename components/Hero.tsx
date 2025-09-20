import React from "react";
import { WhatsappIcon } from "./icons/SocialIcons";

const Hero: React.FC = () => {
  return (
    <section className="relative isolate flex min-h-screen items-center overflow-hidden bg-[#0A1624] text-white">
      <div className="absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1523294587484-bae6cc870010?auto=format&fit=crop&w=1600&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#050b13]/90 via-[#0D1B2A]/85 to-[#1E3250]/70"></div>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(185,143,88,0.35), transparent 55%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.12), transparent 45%)",
          }}
        ></div>
      </div>
      <div className="relative container mx-auto px-6 pb-24 pt-40">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
              Direito imobiliário & sucessório
            </span>
            <div className="space-y-6">
              <h1 className="text-4xl font-extrabold leading-tight md:text-6xl lg:text-7xl">
                Protegemos o seu patrimônio com estratégia, precisão e proximidade humana.
              </h1>
              <p className="max-w-2xl text-lg text-gray-200 md:text-xl">
                Com mais de 15 anos de experiência, transformamos desafios em soluções jurídicas seguras para famílias,
                investidores e empresas que atuam no mercado imobiliário.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#contact"
                className="inline-flex items-center gap-3 rounded-full border border-[#B98F58]/80 bg-[#B98F58] px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_12px_35px_rgba(185,143,88,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a37d4b] hover:shadow-[0_20px_40px_rgba(185,143,88,0.4)] md:text-base"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-white" aria-hidden="true"></span>
                Agende uma consulta
              </a>
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/15 px-8 py-3 text-sm font-semibold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25 md:text-base"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]/25">
                  <WhatsappIcon className="h-4 w-4 text-[#25D366]" />
                </span>
                Fale pelo WhatsApp
              </a>
            </div>
            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              {["+480 processos resolvidos", "Equipe multidisciplinar", "Atendimento nacional"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-5 text-sm font-medium tracking-wide text-white/90 backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2 text-xs font-semibold uppercase tracking-widest text-white/70">
              {["Inventários ágeis", "Regularização de imóveis", "Soluções preventivas", "Atendimento humanizado"].map((tag) => (
                <span key={tag} className="rounded-full border border-white/15 bg-white/5 px-4 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-10 right-6 hidden lg:block">
              <div className="rounded-full border border-white/20 bg-white/10 px-6 py-2 text-xs uppercase tracking-[0.3em] text-white/70 backdrop-blur">
                Atendimento premium
              </div>
            </div>
            <div className="rounded-[32px] border border-white/20 bg-white/10 p-8 backdrop-blur">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.4em] text-[#B98F58]">Como ajudamos</span>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Cada caso começa com um diagnóstico detalhado</h2>
                  <p className="mt-2 text-sm text-white/70">
                    Avaliamos documentos, riscos e oportunidades para entregar um plano jurídico sólido antes de qualquer
                    ação.
                  </p>
                </div>
                <ul className="space-y-4 text-sm text-white/80">
                  {[
                    'Mapeamento de riscos patrimoniais e contratuais',
                    'Estratégias de proteção preventiva e contenciosa',
                    'Representação próxima ao cliente e linguagem clara',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#B98F58]/20 text-[#B98F58]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 00-1.414 0L8.5 12.086 5.707 9.293a1 1 0 00-1.414 1.414l3.5 3.5a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-5 text-sm text-white/80">
                  <p className="font-semibold text-white">Atendimento dedicado</p>
                  <p className="mt-1 leading-relaxed text-white/70">
                    Um advogado especialista acompanha você desde o primeiro contato até a conclusão do caso.
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs uppercase tracking-widest text-white/70">
                    <a
                      href="mailto:contato@pavan.adv.br"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 hover:border-[#B98F58]/50 hover:text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-[#B98F58]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8"
                        />
                      </svg>
                      contato@pavan.adv.br
                    </a>
                    <a
                      href="tel:+43574301234"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 hover:border-[#B98F58]/50 hover:text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-[#B98F58]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13A11.042 11.042 0 0014.52 15.52l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      43 57430 1234
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;