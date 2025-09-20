import React from 'react';
import { BriefcaseIcon, GavelHouseIcon, HandshakeIcon } from './icons/UiIcons';

const Highlights: React.FC = () => {
  const pillars = [
    {
      title: 'Visão 360º do direito imobiliário',
      description:
        'Analisamos o negócio, os documentos e os impactos fiscais para oferecer soluções estratégicas, não apenas respostas jurídicas.',
      icon: <GavelHouseIcon className="h-12 w-12" />, 
    },
    {
      title: 'Tradição e inovação trabalhando juntas',
      description:
        'Tecnologia para acelerar levantamentos e uma equipe que acompanha o cliente pessoalmente em cada etapa do processo.',
      icon: <BriefcaseIcon className="h-12 w-12" />, 
    },
    {
      title: 'Relacionamentos que geram segurança',
      description:
        'Empatia, transparência e comunicação proativa para que você entenda cada decisão antes de executá-la.',
      icon: <HandshakeIcon className="h-12 w-12" />, 
    },
  ];

  const metrics = [
    { value: '72h', label: 'Tempo médio para diagnóstico inicial' },
    { value: '92%', label: 'Acordos firmados sem litígio prolongado' },
    { value: '+35M', label: 'Patrimônio preservado para clientes' },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-20 fade-in-section">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at top left, rgba(185,143,88,0.08), transparent 55%), radial-gradient(circle at bottom right, rgba(15,27,42,0.08), transparent 45%)',
        }}
      ></div>
      <div className="relative container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center justify-center gap-2 rounded-full border border-[#B98F58]/30 bg-[#B98F58]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#0D1B2A]">
            Por que escolher a Neiva
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#0D1B2A] md:text-4xl">
            Um escritório boutique comprometido com resultados tangíveis
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Atuamos lado a lado com investidores, incorporadoras e famílias para conduzir negociações, prevenir litígios e resolver impasses complexos com segurança.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white/90 p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#B98F58]/0 via-[#B98F58]/5 to-[#B98F58]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <div className="relative flex flex-col gap-5 text-left">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0D1B2A]/5 text-[#B98F58]">
                  {pillar.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#0D1B2A]">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{pillar.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-stretch">
          <div className="rounded-3xl border border-[#0D1B2A]/10 bg-[#0D1B2A]/5 p-8 text-[#0D1B2A]">
            <h3 className="text-2xl font-semibold">Diagnóstico jurídico conduzido por especialistas</h3>
            <p className="mt-3 text-sm text-[#0D1B2A]/80">
              Antes de qualquer ação, entregamos um panorama completo dos riscos e caminhos possíveis. Você sabe exatamente o que esperar, quais documentos serão necessários e qual será o impacto em seu patrimônio.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[#0D1B2A]/80">
              {['Checklist documental personalizado', 'Linha do tempo do processo com responsáveis definidos', 'Previsão de custos e indicadores de sucesso'].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#B98F58]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L8.5 12.086 5.707 9.293a1 1 0 00-1.414 1.414l3.5 3.5a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h4 className="text-xs font-semibold uppercase tracking-[0.45em] text-[#B98F58]">Impacto real</h4>
            <div className="mt-6 grid gap-6">
              {metrics.map((metric) => (
                <div key={metric.value} className="rounded-2xl border border-[#B98F58]/20 bg-[#B98F58]/5 p-5 text-center">
                  <p className="text-3xl font-bold text-[#0D1B2A]">{metric.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-[#0D1B2A]/60">{metric.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-gray-600">
              Acompanhamos cada indicador de desempenho para aperfeiçoar continuamente nossa atuação e entregar previsibilidade aos clientes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Highlights;
