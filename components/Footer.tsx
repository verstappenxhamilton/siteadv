
import React from 'react';
import ContactForm from './ContactForm';
import { SocialIconsList } from './icons/SocialIcons';

const contactBadges = [
  'Consultoria personalizada',
  'Relatórios em até 48h',
  'Confidencialidade absoluta',
];

const quickInfo = [
  {
    icon: 'bi-geo-alt',
    label: 'Endereço',
    value: 'Rua XV de Novembro, 123 - Centro, Curitiba/PR',
  },
  {
    icon: 'bi-clock-history',
    label: 'Horário de atendimento',
    value: 'Segunda a sexta, 8h às 19h',
  },
  {
    icon: 'bi-laptop',
    label: 'Formatos',
    value: 'Consultas presenciais e online para todo o Brasil',
  },
];

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="relative overflow-hidden bg-[#0D1B2A] text-white fade-in-section">
      <div className="pointer-events-none absolute -top-20 right-10 h-64 w-64 rounded-full bg-[#B98F58]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#25D366]/10 blur-[140px]" />

      <div className="container relative mx-auto px-6 py-20">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[minmax(0,1.2fr)_1fr]">
          <div className="space-y-10">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                Contato
              </span>
              <h2 className="mt-6 text-4xl font-bold uppercase tracking-[0.25em] sm:text-5xl">Converse com nossa equipe</h2>
              <div className="mt-4 h-1 w-20 bg-[#B98F58]" />
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70">
                Conte com especialistas para mapear riscos, alinhar expectativas e traçar a estratégia jurídica ideal. Escolha o
                canal preferido ou preencha o formulário para receber um retorno personalizado.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {contactBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.25em] text-white/80"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="space-y-5 text-sm sm:text-base">
              <div className="flex flex-col gap-4">
                <a href="tel:+43574301234" className="flex items-center gap-3 text-lg font-semibold tracking-[0.25em] text-white transition-colors hover:text-[#B98F58]">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#B98F58]">
                    <i className="bi bi-telephone" aria-hidden="true" />
                  </span>
                  43 57430 1234
                </a>
                <a href="mailto:contato@pavan.adv.br" className="flex items-center gap-3 text-lg font-semibold tracking-[0.25em] text-white transition-colors hover:text-[#B98F58]">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#B98F58]">
                    <i className="bi bi-envelope" aria-hidden="true" />
                  </span>
                  contato@pavan.adv.br
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {quickInfo.map((info) => (
                  <div key={info.label} className="rounded-2xl border border-white/15 bg-white/5 p-4 text-white/80">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-white">
                      <i className={`bi ${info.icon}`} aria-hidden="true" />
                      {info.label}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{info.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl border border-white/15 bg-white/5 p-8 shadow-[0_35px_70px_rgba(5,9,15,0.45)] backdrop-blur">
            <h3 className="text-2xl font-semibold uppercase tracking-[0.25em]">Agende uma reunião</h3>
            <p className="mt-2 text-sm text-white/70">
              Preencha os dados e retornaremos em até 2 horas úteis com as próximas etapas.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-black/30 py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 text-sm text-white/70 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Pavan &amp; Associados. Todos os direitos reservados.</p>
          <div className="flex flex-col items-center gap-3 text-xs uppercase tracking-[0.35em] text-white/60 md:flex-row md:gap-6">
            <span>Política de Privacidade</span>
            <span>Termos de Uso</span>
          </div>
          <SocialIconsList />
        </div>
      </div>
    </footer>
  );
};

export default Footer;