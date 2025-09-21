import React from 'react';
import { BriefcaseIcon, HomeIcon, UsersIcon } from './icons/UiIcons';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description }) => (
  <div className="service-card">
    <div className="service-card-icon">{icon}</div>
    <h3 className="service-card-title">{title}</h3>
    <p className="service-card-description">{description}</p>
  </div>
);

const Services: React.FC = () => {
  const servicesData = [
    {
      icon: <HomeIcon />, // Removed className, will be styled by CSS
      title: "Direito Imobiliário",
      description: "Assessoria completa em transações, regularizações, contratos e contencioso imobiliário, garantindo segurança jurídica ao seu patrimônio."
    },
    {
      icon: <UsersIcon />, // Removed className
      title: "Inventários e Sucessões",
      description: "Condução de inventários judiciais e extrajudiciais, planejamento sucessório e partilha de bens com agilidade, discrição e eficiência."
    },
    {
        icon: <BriefcaseIcon />, // Removed className
        title: "Contratos Empresariais",
        description: "Elaboração, análise e gestão de contratos empresariais, mitigando riscos e fortalecendo as relações comerciais da sua empresa."
    }
  ];

  return (
    <div className="services-container">
      <h2 className="section-title">Nossas Áreas de Atuação</h2>
      <p className="section-subtitle">
        Oferecemos soluções jurídicas especializadas para proteger e valorizar o que é mais importante para você.
      </p>
      <div className="services-grid">
        {servicesData.map((service, index) => (
          <ServiceCard key={index} {...service} />
        ))}
      </div>
    </div>
  );
};

export default Services;
