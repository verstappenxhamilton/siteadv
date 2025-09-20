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
    <blockquote className="relative flex w-full max-w-2xl flex-col gap-6 rounded-3xl border border-white/60 bg-white/95 p-10 text-left shadow-[0_35px_70px_rgba(15,23,42,0.15)]">
      <div className="absolute -top-10 right-10 hidden h-24 w-24 rounded-full bg-[#B98F58]/20 blur-xl sm:block" aria-hidden="true" />
      <div className="flex items-center gap-2 text-[#FACC15]">
        {Array.from({ length: 5 }).map((_, index) => (
          <i key={index} className="bi bi-star-fill text-lg" aria-hidden="true" />
        ))}
      </div>
      <div className="flex items-start gap-4 text-slate-700">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0D1B2A]/10 text-[#0D1B2A]">
          <QuoteIcon className="h-7 w-7" />
        </span>
        <p className="text-lg italic leading-relaxed">“{quote}”</p>
      </div>
      <cite className="mt-4 flex flex-col gap-1 text-sm font-medium uppercase tracking-[0.3em] text-[#0D1B2A]/80 not-italic">
        {author}
        <span className="text-xs tracking-[0.25em] text-slate-500">{location}</span>
      </cite>
    </blockquote>
  </div>
);

const Testimonials: React.FC = () => {
  const metrics = [
    { value: '4.9/5', label: 'Avaliação média nas plataformas digitais' },
    { value: '72h', label: 'Tempo médio para retorno de estratégias' },
    { value: '92%', label: 'Casos resolvidos sem litígio prolongado' },
  ];
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
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#B98F58]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-[#0D1B2A]/10 blur-[120px]" />

      <div className="container relative mx-auto px-6">
        <div className="mb-16 text-center">
          <span className="inline-flex items-center justify-center rounded-full bg-[#0D1B2A]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#0D1B2A]">
            Resultados Reais
          </span>
          <h2 className="mt-6 text-4xl font-bold uppercase tracking-wider text-[#0D1B2A] sm:text-5xl">O que nossos clientes dizem</h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#B98F58]" />
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Cada depoimento reflete nossa dedicação em entregar segurança, clareza e resultados consistentes em momentos
            decisivos.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-3xl border border-[#0D1B2A]/10 bg-white/80 px-6 py-6 text-center shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="text-3xl font-bold text-[#0D1B2A] sm:text-4xl">{metric.value}</div>
              <p className="mt-2 text-sm text-slate-600">{metric.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <Swiper
            spaceBetween={30}
            centeredSlides
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation
            modules={[Autoplay, Pagination, Navigation]}
            className="mySwiper"
            loop
          >
            {testimonialsData.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <TestimonialCard {...testimonial} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;