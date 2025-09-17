
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen bg-gray-900 text-white flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-cover bg-center ken-burns" 
        style={{ backgroundImage: `url(https://picsum.photos/seed/law-office/1920/1080)` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
      <div className="relative text-center px-4 z-10">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold uppercase tracking-wider">Pavan & Associados</h1>
        <div className="w-24 h-1 bg-[#B98F58] mx-auto my-4"></div>
        <p className="mt-4 text-xl md:text-2xl font-light">Advocacia Imobiliária e Inventários</p>
        <p className="mt-2 text-lg md:text-xl text-gray-300 max-w-3xl">Soluções Jurídicas Completas para Seu Patrimônio</p>
        <a 
          href="#contact" 
          className="mt-8 inline-block px-8 py-4 bg-[#B98F58] text-white font-bold uppercase rounded-sm hover:bg-[#a37d4b] transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Agende sua Consulta Gratuita
        </a>
      </div>
    </section>
  );
};

export default Hero;