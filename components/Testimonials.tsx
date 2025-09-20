import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import '../styles/testimonials.css';
import { QuoteIcon } from './icons/UiIcons';

interface TestimonialCardProps {
  quote: string;
  author: string;
  location: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, location }) => (
  <div className="flex h-full items-center justify-center p-4">
    <blockquote className="flex max-w-xl flex-col items-center rounded-xl bg-white p-8 text-center shadow-lg">
      <QuoteIcon className="h-12 w-12 text-[#B98F58]" />
      <p className="mt-4 text-lg italic text-gray-700">"{quote}"</p>
      <cite className="mt-6 not-italic">
        <span className="font-semibold text-[#0D1B2A]">{author}</span>
        <span className="text-gray-500">, {location}</span>
      </cite>
    </blockquote>
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
    <section id="testimonials" className="bg-gray-100 py-24 fade-in-section">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold uppercase tracking-wider text-gray-800">O que nossos clientes dizem</h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#B98F58]"></div>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            A confiança e a satisfação de nossos clientes são o nosso maior patrimônio.
          </p>
        </div>
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
          className="mySwiper"
          loop={true}
        >
          {testimonialsData.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <TestimonialCard {...testimonial} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonials;