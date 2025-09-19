import React from "react";
import { QuoteIcon } from "./icons/UiIcons";

interface TestimonialCardProps {
  quote: string;
  authorImage?: string;
  isFeatured?: boolean;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, authorImage, isFeatured = false }) => (
  <article className={`home-testimonials__card ${isFeatured ? "home-testimonials__card--featured" : ""}`}>
    <QuoteIcon className="home-testimonials__icon" />
    <p className="home-testimonials__quote">“{quote}”</p>
    {authorImage && (
      <div className="home-testimonials__author">
        <img src={authorImage} alt="Cliente" className="home-testimonials__avatar" />
      </div>
    )}
  </article>
);

const Testimonials: React.FC = () => {
  const testimonialsData = [
    {
      quote: "Incrível eficiência e profissionalismo. Resolveram meu caso com uma agilidade que eu não esperava. Recomendo a todos.",
      isFeatured: true
    },
    {
      quote: "Trabalho extraordinário, uma equipe que realmente se importa com o cliente e busca a melhor solução.",
      authorImage: "https://picsum.photos/seed/person1/100/100"
    },
    {
      quote: "Tiraram todas as minhas dúvidas com paciência e clareza, me senti seguro durante todo o processo.",
      authorImage: "https://picsum.photos/seed/person2/100/100"
    },
    {
      quote: "A melhor assessoria jurídica que já tive. Competência e seriedade definem o escritório.",
      authorImage: "https://picsum.photos/seed/person3/100/100"
    }
  ];

  return (
    <section id="testimonials" className="home-testimonials fade-in-section">
      <div className="container">
        <div className="home-section-heading home-section-heading--center">
          <span className="home-section-heading__eyebrow">confiança comprovada</span>
          <h2 className="home-section-heading__title">Depoimentos de clientes</h2>
          <p className="home-section-heading__description">
            Histórias reais de pessoas e empresas que confiaram na nossa assessoria jurídica para destravar negociações e garantir
            segurança patrimonial.
          </p>
        </div>
        <div className="home-testimonials__grid">
          {testimonialsData.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
