import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { QuoteIcon } from './icons/UiIcons';

interface TestimonialCardProps {
  quote: string;
  author: string;
  location: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, location }) => (
  <div className="testimonial-card">
    <QuoteIcon className="testimonial-quote-icon" />
    <p className="testimonial-quote">"{quote}"</p>
    <cite className="testimonial-author">
      <span className="author-name">{author}</span>
      <span className="author-location">, {location}</span>
    </cite>
  </div>
);

const Testimonials: React.FC = () => {
  const testimonialsData = [
    {
      quote: "Incrível eficiência e profissionalismo. Resolveram meu caso com uma agilidade que eu não esperava. Recomendo a todos.",
      author: "Carlos Almeida",
      location: "São Paulo, SP",
    },
    {
      quote: "Trabalho extraordinário, uma equipe que realmente se importa com o cliente e busca a melhor solução.",
      author: "Mariana Costa",
      location: "Rio de Janeiro, RJ",
    },
    {
      quote: "Tiraram todas as minhas dúvidas com paciência e clareza, me senti seguro durante todo o processo.",
      author: "João Ferreira",
      location: "Belo Horizonte, MG",
    },
    {
      quote: "A melhor assessoria jurídica que já tive. Competência e seriedade definem a Pavan & Associados.",
      author: "Ana Clara",
      location: "Porto Alegre, RS",
    },
    {
      quote: "Solucionaram uma questão imobiliária complexa que se arrastava por anos. Gratidão eterna a toda a equipe.",
      author: "Pedro Martins",
      location: "Curitiba, PR",
    },
  ];

  return (
    <div className="testimonials-container">
      <h2 className="section-title">O que nossos clientes dizem</h2>
      <p className="section-subtitle">
        A confiança e a satisfação de nossos clientes são o nosso maior patrimônio.
      </p>
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="testimonials-swiper"
        loop={true}
      >
        {testimonialsData.map((testimonial, index) => (
          <SwiperSlide key={index}>
            <TestimonialCard {...testimonial} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Testimonials;
