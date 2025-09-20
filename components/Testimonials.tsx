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
  <div className="flex h-full items-center justify-center p-6">
    <blockquote className="relative flex max-w-xl flex-col gap-6 rounded-3xl border border-white/30 bg-white/90 p-10 text-left shadow-xl backdrop-blur">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#B98F58]/15 text-[#B98F58]">
        <QuoteIcon className="h-7 w-7" />
      </span>
      <p className="text-lg leading-relaxed text-[#0D1B2A]">“{quote}”</p>
      <cite className="text-sm not-italic text-[#0D1B2A]/70">
        <span className="font-semibold text-[#0D1B2A]">{author}</span>
        <span className="ml-1">• {location}</span>
      </cite>
      <span className="absolute -top-4 right-6 inline-flex items-center rounded-full border border-[#B98F58]/50 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#B98F58]">
        Cliente real
      </span>
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
    <section id="testimonials" className="relative overflow-hidden bg-gradient-to-b from-gray-100 via-white to-gray-100 py-24 fade-in-section">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 5% 10%, rgba(185,143,88,0.18), transparent 55%), radial-gradient(circle at 95% 90%, rgba(13,27,42,0.12), transparent 50%)',
        }}
      ></div>
      <div className="relative container mx-auto px-6">
        <div className="text-center">
          <span className="inline-flex items-center justify-center gap-2 rounded-full border border-[#B98F58]/40 bg-[#B98F58]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#0D1B2A]">
            Resultados que falam por si
          </span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-[#0D1B2A]">O que nossos clientes dizem</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Histórias reais de quem confiou seus bens e planos ao nosso cuidado jurídico.
          </p>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-3xl border border-[#0D1B2A]/10 bg-white/70 px-6 py-6 text-center md:flex-row md:text-left">
          <div className="max-w-xl text-[#0D1B2A]">
            <p className="text-sm uppercase tracking-[0.35em] text-[#B98F58]">Indicadores de confiança</p>
            <p className="mt-2 text-lg font-semibold">91 NPS • 97% de aprovação na fase de onboarding</p>
            <p className="mt-1 text-sm text-[#0D1B2A]/70">Monitoramos a satisfação em cada etapa para ajustar a estratégia às expectativas do cliente.</p>
          </div>
          <a
            href="#contact"
            className="inline-flex items-center gap-3 rounded-full border border-[#B98F58]/60 bg-[#B98F58] px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a37d4b]"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-white" aria-hidden="true"></span>
            Conte seu caso para nós
          </a>
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
