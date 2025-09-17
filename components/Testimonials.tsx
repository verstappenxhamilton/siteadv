
import React from 'react';
import { QuoteIcon } from './icons/UiIcons';

interface TestimonialCardProps {
  quote: string;
  authorImage?: string;
  isFeatured?: boolean;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, authorImage, isFeatured = false }) => {
  const cardClasses = isFeatured 
    ? "bg-[#0D1B2A] text-white border-2 border-[#B98F58] transform md:scale-105 z-10" 
    : "bg-white text-gray-700 border";
  
  const quoteColor = "text-[#B98F58]";

  return (
    <div className={`p-8 rounded-lg shadow-lg flex flex-col h-full transition-shadow duration-300 hover:shadow-xl ${cardClasses}`}>
      <QuoteIcon className={`w-12 h-12 mb-4 ${quoteColor}`} />
      <p className="italic text-base mb-6 flex-grow">"{quote}"</p>
      {authorImage && (
        <div className="flex items-center justify-center mt-auto">
          <img src={authorImage} alt="Client" className="w-14 h-14 rounded-full object-cover border-2 border-[#B98F58]" />
        </div>
      )}
    </div>
  );
};

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
      quote: "A melhor assessoria jurídica que já tive. Competência e seriedade definem a Pavan & Associados.",
      authorImage: "https://picsum.photos/seed/person3/100/100"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-100 fade-in-section" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}>
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12 uppercase tracking-wide">Depoimentos de Clientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {testimonialsData.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;