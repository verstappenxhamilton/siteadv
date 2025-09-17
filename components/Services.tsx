
import React from 'react';
import { GavelHouseIcon, WillTreeIcon, HandshakeIcon } from './icons/UiIcons';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-8 bg-white rounded-lg shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
    <div className="flex-shrink-0 w-20 h-20 mb-6 flex items-center justify-center bg-gray-100 rounded-full text-gray-800">
      {icon}
    </div>
    <h3 className="text-2xl font-semibold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 max-w-xs">{description}</p>
  </div>
);

const Services: React.FC = () => {
  const servicesData = [
    {
      icon: <GavelHouseIcon className="h-10 w-10" />,
      title: "Direito Imobiliário",
      description: "Experiência jurídica e simplificada em todas as questões imobiliárias, garantindo segurança e tranquilidade em suas transações."
    },
    {
      icon: <WillTreeIcon className="h-10 w-10" />,
      title: "Inventários e Sucessões",
      description: "Assessoria completa em processos de inventário e partilha de bens, atuando com sensibilidade e eficiência para a família."
    },
    {
      icon: <HandshakeIcon className="h-10 w-10" />,
      title: "Nossa Experiência",
      description: "Anos de prática e dedicação em oferecer as melhores soluções jurídicas, com um serviço personalizado e focado nos seus interesses."
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50 fade-in-section">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 uppercase tracking-wide">Nossas Áreas de Atuação</h2>
          <div className="w-20 h-1 bg-[#B98F58] mx-auto mt-4"></div>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Oferecemos consultoria especializada para proteger e valorizar o seu patrimônio.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {servicesData.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;