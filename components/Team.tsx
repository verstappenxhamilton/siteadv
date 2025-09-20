import React from 'react';

const Team: React.FC = () => {
  return (
    <section id="team" className="bg-white py-24 fade-in-section">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row">
          <div className="w-full max-w-sm lg:w-1/3">
            <div className="group relative transform transition-transform duration-500 hover:scale-105">
              <div className="absolute -inset-4 rounded-xl bg-gradient-to-br from-[#B98F58]/40 to-transparent opacity-70 blur-lg transition-all duration-500 group-hover:opacity-100"></div>
              <img 
                src="https://i.imgur.com/3p2au6n.jpeg" 
                alt="Dr. Ricardo Pavan"
                className="relative w-full rounded-xl shadow-2xl"
              />
            </div>
          </div>
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