
import React from 'react';
import ContactForm from './ContactForm';
import { SocialIconsList } from './icons/SocialIcons';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="relative overflow-hidden bg-[#0D1B2A] text-white fade-in-section">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(185,143,88,0.35), transparent 55%), radial-gradient(circle at 85% 90%, rgba(255,255,255,0.12), transparent 50%)',
        }}
      ></div>
      <div className="relative container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-[1.1fr_1fr] md:items-start">
          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                Vamos conversar
              </span>
              <h2 className="mt-4 text-4xl font-semibold leading-tight">Compartilhe seu cenário e receba um direcionamento rápido</h2>
            </div>
            <p className="max-w-xl text-sm text-white/70">
              Responderemos em até uma hora útil com a confirmação do recebimento e os próximos passos para iniciar a análise detalhada do seu caso.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-[#B98F58]">Telefone</p>
                <a href="tel:+43574301234" className="mt-2 block text-lg font-semibold text-white hover:text-[#B98F58] transition-colors">
                  43 57430 1234
                </a>
                <p className="mt-1 text-xs text-white/60">Atendimento de segunda a sexta, 8h às 19h</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-[#B98F58]">E-mail</p>
                <a href="mailto:contato@pavan.adv.br" className="mt-2 block text-lg font-semibold text-white hover:text-[#B98F58] transition-colors">
                  contato@pavan.adv.br
                </a>
                <p className="mt-1 text-xs text-white/60">Responderemos com um resumo do plano sugerido</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              <p className="font-semibold text-white">Onde estamos</p>
              <p className="mt-1">Rua das Flores, 210 • Centro • São Paulo/SP</p>
              <p className="mt-2 text-xs uppercase tracking-[0.35em] text-[#B98F58]">Atendimento presencial com hora marcada</p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
            <ContactForm />
          </div>
        </div>
      </div>
      <div className="relative bg-black/30 py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 text-sm text-white/70 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Pavan &amp; Associados. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <SocialIconsList />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;