import React from 'react';
import { QuoteIcon } from './icons/UiIcons';

const recognitions = [
  'LL.M. em Direito Imobiliário – FGV',
  'Professor convidado no Instituto Brasileiro de Direito Imobiliário',
  'Membro da Comissão de Direito Urbanístico da OAB/PR',
  'Autor de artigos em periódicos especializados',
];

const values = [
  {
    title: 'Visão estratégica',
    description: 'Atuação preventiva com mapeamento detalhado de riscos e projeção de cenários.',
  },
  {
    title: 'Comunicação transparente',
    description: 'Relatórios periódicos, reuniões de alinhamento e acompanhamento em tempo real.',
  },
  {
    title: 'Atendimento humanizado',
    description: 'Equipe multidisciplinar focada em acolher e orientar cada família com empatia.',
  },
];

const Team: React.FC = () => {
  return (
    <section id="team" className="relative overflow-hidden bg-white py-24 fade-in-section">
      <div className="pointer-events-none absolute -top-24 left-10 h-56 w-56 rounded-full bg-[#B98F58]/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#0D1B2A]/10 blur-[140px]" />

      <div className="container mx-auto px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="relative overflow-hidden rounded-[32px] bg-[#0D1B2A] text-white shadow-[0_35px_70px_rgba(13,27,42,0.35)]">
            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80"
              alt="Advogado fundador do escritório"
              className="absolute inset-0 h-full w-full object-cover opacity-70"
              loading="lazy"
            />
            <div className="relative flex h-full flex-col justify-between p-8">
              <div className="space-y-6">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                  Fundador
                </span>
                <h3 className="text-3xl font-semibold uppercase tracking-[0.25em]">Dr. Ricardo Pavan</h3>
                <div className="flex items-start gap-4 text-white/90">
                  <QuoteIcon className="h-10 w-10 text-[#B98F58]" />
                  <p className="text-sm leading-relaxed sm:text-base">
                    "A advocacia de excelência nasce do diálogo atento e da antecipação de cenários. Nosso compromisso é ser o
                    parceiro jurídico que protege sonhos e transforma desafios em oportunidades de crescimento."
                  </p>
                </div>
              </div>
              <div className="mt-10 space-y-3 text-sm text-white/75">
                {recognitions.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg">
                      <i className="bi bi-award" aria-hidden="true" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold uppercase tracking-wider text-[#0D1B2A] sm:text-5xl">Conheça o Fundador</h2>
              <div className="mx-auto h-1 w-24 rounded-full bg-[#B98F58] lg:mx-0" />
              <p className="text-lg leading-relaxed text-slate-700">
                Com mais de 15 anos de experiência, Ricardo Pavan conduz a Pavan &amp; Associados com uma abordagem artesanal e
                estratégica. Atua em causas de alta complexidade, combinando visão empresarial e sensibilidade humana.
              </p>
              <p className="text-base leading-relaxed text-slate-600">
                Reconhecido por entregar resultados sustentáveis e construir relacionamentos duradouros, lidera uma equipe
                multidisciplinar comprometida em proteger o patrimônio e o legado de cada cliente.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {values.map((value) => (
                <div key={value.title} className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                  <h3 className="text-lg font-semibold text-[#0D1B2A]">{value.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{value.description}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full bg-[#0D1B2A] px-8 py-3 text-sm font-bold uppercase tracking-[0.25em] text-white shadow-[0_20px_40px_rgba(13,27,42,0.35)] transition-transform duration-300 hover:-translate-y-1 hover:bg-[#13263D]"
              >
                Agendar conversa estratégica
              </a>
              <span className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Atendimento presencial e online em todo o Brasil
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;