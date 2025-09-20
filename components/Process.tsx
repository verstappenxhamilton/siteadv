import React from 'react';

const Process: React.FC = () => {
  const steps = [
    {
      title: 'Briefing estratégico',
      description:
        'Entendimento profundo do caso, levantamento de documentos e análise inicial de riscos e oportunidades.',
      detail: 'Reuniões remotas ou presenciais, com ata compartilhada em até 24 horas.',
    },
    {
      title: 'Plano jurídico personalizado',
      description:
        'Definição dos caminhos legais, cronograma de atividades e mapeamento de responsabilidades de cada parte envolvida.',
      detail: 'Você recebe um roadmap com marcos, prazos e indicadores de acompanhamento.',
    },
    {
      title: 'Execução com reporting contínuo',
      description:
        'Implementamos o plano, negociamos com partes interessadas e comunicamos atualizações de forma ativa.',
      detail: 'Atualizações semanais, reuniões de checkpoint e canal direto com a equipe.',
    },
    {
      title: 'Encerramento e prevenção',
      description:
        'Formalização das etapas finais, documentação organizada e orientações preventivas para situações futuras.',
      detail: 'Dossiê digital entregue ao cliente e recomendações para manutenção da segurança jurídica.',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#0D1B2A] py-24 text-white fade-in-section">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(185,143,88,0.35), transparent 50%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.12), transparent 55%)',
        }}
      ></div>
      <div className="relative container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
            Nosso método
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">
            Transparência do primeiro contato ao encerramento do caso
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Acompanhamos você em cada etapa, com comunicação clara e decisões sustentadas por dados e experiência.
          </p>
        </div>
        <ol className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative flex h-full flex-col justify-between rounded-3xl border border-white/20 bg-white/5 p-8 backdrop-blur transition-transform duration-300 hover:-translate-y-2"
            >
              <div>
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.4em] text-[#B98F58]">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#B98F58]/15 text-base font-bold text-[#B98F58]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  Etapa
                </div>
                <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">{step.description}</p>
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs uppercase tracking-widest text-white/60">
                {step.detail}
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-16 flex flex-col items-center justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 px-8 py-8 text-center lg:flex-row lg:text-left">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-semibold text-white">Pronto para uma análise cuidadosa do seu caso?</h3>
            <p className="mt-2 text-sm text-white/70">
              Nossa equipe responde em até uma hora útil e encaminha os próximos passos com segurança.
            </p>
          </div>
          <a
            href="#contact"
            className="inline-flex items-center gap-3 rounded-full border border-[#B98F58]/60 bg-[#B98F58] px-8 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-[0_12px_30px_rgba(185,143,88,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a37d4b]"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-white" aria-hidden="true"></span>
            Conversar com o escritório
          </a>
        </div>
      </div>
    </section>
  );
};

export default Process;
