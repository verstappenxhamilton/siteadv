import React from 'react';

const Team: React.FC = () => {
  return (
    <section id="team" className="bg-white pb-24 fade-in-section">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center justify-center gap-12 lg:flex-row">
          
          <div className="mt-8 text-center lg:w-2/3 lg:pl-12 lg:text-left">
            <h2 className="text-4xl font-bold uppercase tracking-wider text-gray-800">Conheça o Fundador</h2>
            <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#B98F58] lg:mx-0"></div>
            <h3 className="mt-6 text-3xl font-semibold text-[#B98F58]">Dr. Ricardo Pavan</h3>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Com mais de 15 anos de experiência e uma paixão incansável pela justiça, Dr. Ricardo Pavan fundou a Pavan & Associados com a missão de oferecer uma advocacia acessível, transparente e altamente eficaz.
            </p>
            <p className="mt-4 leading-relaxed text-gray-600">
              Especializado em direito imobiliário e sucessório, ele lidera uma equipe dedicada a proteger os interesses e o patrimônio de seus clientes, transformando complexidades legais em soluções claras e seguras.
            </p>
            <div className="mt-8">
              <a 
                href="#contact" 
                className="inline-block rounded-md bg-[#0D1B2A] px-8 py-3 text-sm font-bold uppercase text-white shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                Agende uma Consulta
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;