
import React from "react";
import { BriefcaseIcon, HomeIcon, UsersIcon } from "./icons/UiIcons";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description }) => (
  <div className="group relative transform transition-transform duration-300 hover:-translate-y-2">
    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#B98F58]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
    <div className="relative flex h-full flex-col items-center justify-center rounded-xl border border-gray-200/70 bg-white/95 p-8 text-center shadow-sm">
      <div className="mb-4 text-[#B98F58] transition-colors duration-300 group-hover:text-[#0D1B2A]">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[#0D1B2A]">{title}</h3>
      <p className="mt-3 text-gray-600">{description}</p>
    </div>
  </div>
);

const Services: React.FC = () => {
  const servicesData = [
    {
      icon: <HomeIcon className="h-12 w-12" />,
      title: "Direito Imobiliário",
      description: "Assessoria completa em transações e regularização de imóveis, garantindo segurança jurídica para seu patrimônio.",
    },
    {
      icon: <UsersIcon className="h-12 w-12" />,
      title: "Inventários e Sucessões",
      description: "Condução de inventários e planejamento sucessório com agilidade e discrição, preservando as relações familiares.",
    },
    {
      icon: <BriefcaseIcon className="h-12 w-12" />,
      title: "Contratos em Geral",
      description: "Elaboração e revisão de contratos cíveis e empresariais para proteger seus interesses e evitar litígios futuros.",
    },
  ];

  return (
    <section id="services" className="bg-gray-50 py-24 fade-in-section">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold uppercase tracking-wider text-gray-800">Nossas Áreas de Atuação</h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#B98F58]"></div>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Oferecemos soluções jurídicas especializadas para proteger e valorizar o que é mais importante para você.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {servicesData.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
