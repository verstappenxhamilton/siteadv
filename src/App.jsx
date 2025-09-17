import { useEffect, useMemo, useState } from 'react';

const DEFAULT_CONTENT = {
  site: {
    name: 'Pavan & Associados',
    tagline: 'Excelência jurídica em inventários e proteção patrimonial',
    city: 'Florianópolis • Santa Catarina'
  },
  nav: {
    items: [
      { href: '#services', label: 'Áreas de atuação' },
      { href: '#highlights', label: 'Por que nos escolher' },
      { href: '#founder', label: 'O Escritório' },
      { href: '#testimonials', label: 'Depoimentos' },
      { href: '#contact', label: 'Contato' }
    ],
    lawyerArea: { href: '/lawyer.html', label: 'Área do Advogado' }
  },
  hero: {
    eyebrow: 'Excelência jurídica personalizada',
    title: 'Advocacia Imobiliária e Inventários',
    highlight: 'SOLUÇÕES JURÍDICAS COMPLETAS PARA SEU PATRIMÔNIO',
    description:
      'Atendimento moderno, humano e confidencial para proteger seu patrimônio, orientar sucessões e resolver disputas com agilidade.',
    support: 'Atendimento imediato em todo o Brasil',
    stats: [
      { value: '15+', label: 'Anos de experiência' },
      { value: '500+', label: 'Famílias atendidas' },
      { value: '98%', label: 'Índice de satisfação' }
    ],
    cta: { label: 'Agende sua consulta', href: '#contact' },
    secondaryCta: { label: 'Conheça o escritório', href: '#founder' }
  },
  highlights: [
    {
      title: 'Planejamento patrimonial estratégico',
      description:
        'Desenhamos estruturas seguras para sucessão e preservação de bens, reduzindo conflitos e tributos de forma transparente.',
      icon: 'layers'
    },
    {
      title: 'Atendimento humano e proativo',
      description:
        'Cada cliente recebe acompanhamento direto da equipe jurídica, com relatórios claros e atualização constante do caso.',
      icon: 'chat'
    },
    {
      title: 'Inteligência jurídica com tecnologia',
      description:
        'Integramos audiências virtuais, consultas por vídeo e secretaria assistida por IA para acelerar decisões e agilizar prazos.',
      icon: 'shield'
    }
  ],
  services: {
    title: 'Áreas de atuação',
    description:
      'Atuação especializada em disputas patrimoniais, inventários, regularização imobiliária e consultoria empresarial.',
    items: [
      {
        name: 'Inventários e arrolamentos',
        description:
          'Condução completa do inventário judicial ou extrajudicial, com foco em conciliação familiar e redução de prazos.',
        iconPath:
          'M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z'
      },
      {
        name: 'Planejamento sucessório e holding familiar',
        description:
          'Estruturação societária, constituição de holdings e acordos para mitigar litígios e proteger empresas familiares.',
        iconPath:
          'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z'
      },
      {
        name: 'Regularização imobiliária complexa',
        description:
          'Due diligence, contratos, leilões, usucapião e defesa em disputas envolvendo imóveis de alto valor.',
        iconPath:
          'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z'
      }
    ]
  },
  founder: {
    name: 'Dra. Ana Luiza Pavan',
    role: 'Advogada Sócia-Fundadora • OAB/SC 12345',
    bio: [
      'Especialista em Direito Patrimonial, Sucessões e Mercado Imobiliário, com mais de quinze anos de atuação estratégica.',
      'Integra comissões da OAB, ministra workshops sobre planejamento sucessório e lidera equipes multidisciplinares em disputas complexas.'
    ],
    differentiators: [
      'Estratégias preventivas para reduzir conflitos familiares',
      'Equipe multidisciplinar com apoio contábil e fiscal',
      'Atendimento híbrido: presencial, on-line e por videoconferência'
    ],
    signature: '"Nosso compromisso é oferecer segurança jurídica e clareza em cada decisão."'
  },
  testimonials: {
    title: 'Histórias reais de confiança',
    subtitle: 'Clientes que confiaram em nossa condução estratégica',
    items: [
      {
        quote:
          'A equipe conduziu nosso inventário em tempo recorde, sempre com empatia e clareza. Transformaram um momento delicado em tranquilidade para toda a família.',
        author: 'Marina S., empresária',
        detail: 'Inventário extrajudicial concluído em 45 dias'
      },
      {
        quote:
          'Recebi orientação completa para proteger o patrimônio da empresa familiar. A segurança jurídica trouxe novas possibilidades de expansão.',
        author: 'Eduardo F., diretor executivo',
        detail: 'Planejamento sucessório com holding patrimonial'
      },
      {
        quote:
          'Fomos representados em uma disputa imobiliária complexa. A estratégia técnica e a comunicação constante fizeram toda a diferença no acordo final.',
        author: 'Patrícia e Marcelo A., investidores',
        detail: 'Conciliação em litígio imobiliário de alto valor'
      }
    ]
  },
  contact: {
    title: 'Entre em contato',
    description:
      'Tem alguma dúvida ou precisa de uma consulta estratégica? Preencha o formulário ou fale diretamente com nossa equipe especializada.',
    address: 'Av. Beira-Mar Norte, 600 • Florianópolis/SC',
    phone: '+55 (48) 3777-8899',
    email: 'contato@pavanassociados.com',
    whatsapp: '+55 (48) 98888-0000',
    officeHours: 'Segunda a sexta, das 9h às 18h',
    responseTime: 'Respondemos em até 1 hora útil',
    form: {
      title: 'Envie uma mensagem',
      subtitle: 'Responderemos em até 1 hora útil com as melhores opções para o seu caso.',
      fields: {
        nome: 'Seu nome completo',
        email: 'Seu melhor e-mail',
        telefone: 'Telefone ou WhatsApp',
        mensagem: 'Como podemos ajudar?'
      },
      disclaimer: 'Ao enviar você concorda em ser contatado pela equipe Pavan & Associados.'
    }
  },
  footer: {
    rights: '© 2024 Pavan & Associados. Todos os direitos reservados.',
    links: [
      { label: 'Política de Privacidade', href: '#politica' },
      { label: 'Canal LGPD', href: '#lgpd' }
    ],
    social: [
      { label: 'LinkedIn', href: '#', icon: 'bi-linkedin' },
      { label: 'Instagram', href: '#', icon: 'bi-instagram' },
      { label: 'Facebook', href: '#', icon: 'bi-facebook' }
    ]
  }
};

function mergeDefaults(base, override) {
  if (override === undefined) {
    return base;
  }
  if (Array.isArray(base)) {
    return Array.isArray(override) ? override : base;
  }
  if (Array.isArray(override)) {
    return override;
  }
  if (typeof base === 'object' && base !== null) {
    const result = { ...base };
    if (override && typeof override === 'object') {
      for (const key of Object.keys(override)) {
        result[key] = mergeDefaults(base?.[key], override[key]);
      }
    }
    return result;
  }
  if (typeof override === 'object' && override !== null) {
    return override;
  }
  return override;
}

function useFirmContent() {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/content')
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar conteúdo');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setContent((current) => mergeDefaults(current, data));
      })
      .catch((err) => {
        console.warn('Não foi possível carregar conteúdo personalizado. Usando padrão.', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return content;
}

function Icon({ name, className = '' }) {
  const shared = 'w-12 h-12 text-[#b98f58]';
  switch (name) {
    case 'chat':
      return (
        <svg className={`${shared} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a1.125 1.125 0 1 1-2.25 0 1.125 1.125 0 0 1 2.25 0Zm4.125 0a1.125 1.125 0 1 1-2.25 0 1.125 1.125 0 0 1 2.25 0Zm4.125 0a1.125 1.125 0 1 1-2.25 0 1.125 1.125 0 0 1 2.25 0Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12c0 1.6.693 3.053 1.818 4.133-.1.78-.417 2.142-1.323 3.222a.75.75 0 0 0 .876 1.171c1.723-.46 3.086-1.173 4.003-1.819A9.705 9.705 0 0 0 12 18.75c5.385 0 9.75-3.694 9.75-6.75S17.385 5.25 12 5.25 2.25 8.944 2.25 12Z"
          />
        </svg>
      );
    case 'shield':
      return (
        <svg className={`${shared} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21c4.97-1.39 8.25-5.17 8.25-9.75V6.32a1.5 1.5 0 0 0-.89-1.36l-6.75-3a1.5 1.5 0 0 0-1.22 0l-6.75 3A1.5 1.5 0 0 0 3.75 6.32V11.25C3.75 15.83 7.03 19.61 12 21Z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.1 15 15 9.75" />
        </svg>
      );
    case 'layers':
    default:
      return (
        <svg className={`${shared} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m12 4.5 8.25 4.5L12 13.5 3.75 9 12 4.5Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m12 13.5 8.25-4.5V15L12 19.5 3.75 15V9l8.25 4.5Z" />
        </svg>
      );
  }
}

function ServicesIcon({ path }) {
  return (
    <svg className="w-12 h-12 text-[#0d1b2a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function HeroSection({ hero, site, navLinks, lawyerLink, navOpen, toggleNav }) {
  return (
    <header className="hero-wrapper bg-[#0d1b2a] text-white" id="inicio">
      <video className="hero-video" autoPlay muted playsInline loop>
        <source src="videos/office.mp4" type="video/mp4" />
      </video>
      <div className="hero-overlay"></div>
      <div className="hero-content relative">
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-12 lg:pt-12">
          <nav className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-300">{site?.city}</p>
                <p className="text-2xl md:text-3xl font-semibold">{site?.name}</p>
              </div>
              <button
                className="md:hidden inline-flex items-center justify-center rounded-md border border-white/25 px-3 py-2 text-sm"
                type="button"
                aria-expanded={navOpen}
                onClick={toggleNav}
              >
                <span className="sr-only">Abrir menu</span>
                <i className={`bi ${navOpen ? 'bi-x-lg' : 'bi-list'} text-xl`}></i>
              </button>
            </div>
            <div
              className={`flex flex-col md:flex-row md:items-center gap-4 md:gap-6 ${
                navOpen ? 'block' : 'hidden md:flex'
              }`}
            >
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="hover:text-[#b98f58] transition-colors font-medium"
                  onClick={toggleNav}
                >
                  {item.label}
                </a>
              ))}
              <a
                className="md:ml-4 px-4 py-2 border border-white rounded-sm hover:bg-white hover:text-[#0d1b2a] transition-colors font-bold"
                href={lawyerLink.href}
              >
                {lawyerLink.label.toUpperCase()}
              </a>
            </div>
          </nav>

          <div className="mt-16 lg:mt-20 grid lg:grid-cols-[minmax(0,1fr)_auto] gap-12 items-start">
            <div className="space-y-8 max-w-2xl">
              <div className="flex flex-wrap gap-3 items-center text-sm uppercase tracking-[0.35em] text-slate-300">
                <span>{hero?.eyebrow}</span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-200 text-xs tracking-[0.25em]">
                  <span id="statusBadge" className="font-semibold">
                    Carregando status...
                  </span>
                  <span className="hidden md:inline">• Atendimento em tempo real</span>
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight">
                {hero?.title}
              </h1>
              <p className="text-lg md:text-xl text-slate-200/90 max-w-3xl uppercase tracking-[0.15em]">
                {hero?.highlight}
              </p>
              <p className="text-lg md:text-xl text-slate-200/90">
                {hero?.description}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  id="heroContactBtn"
                  className="px-6 py-3 bg-[#b98f58] text-white font-semibold rounded-sm uppercase tracking-[0.15em] shadow-lg shadow-[#b98f58]/30"
                  data-bs-toggle="modal"
                  data-bs-target="#contactModal"
                  type="button"
                >
                  {hero?.cta?.label}
                </button>
                <a
                  href={hero?.secondaryCta?.href || '#founder'}
                  className="px-6 py-3 border border-white/50 text-white/90 font-semibold rounded-sm uppercase tracking-[0.15em] hover:bg-white hover:text-[#0d1b2a] transition-colors"
                >
                  {hero?.secondaryCta?.label}
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left text-slate-100 pt-4">
                {hero?.stats?.map((stat) => (
                  <div key={stat.label} className="border-l border-white/25 pl-4">
                    <div className="text-3xl font-semibold">{stat.value}</div>
                    <div className="text-sm uppercase tracking-[0.25em] text-slate-300">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex flex-col gap-5 card-surface rounded-3xl p-8 w-[320px]">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-200/80">{hero?.support}</p>
              <div className="space-y-4 text-slate-100/90 text-sm leading-relaxed">
                <p>
                  <i className="bi bi-people-fill me-2 text-[#b98f58]"></i>
                  Equipe dedicada em cada etapa do seu processo.
                </p>
                <p>
                  <i className="bi bi-camera-video-fill me-2 text-[#b98f58]"></i>
                  Consultas on-line seguras via videoconferência.
                </p>
                <p>
                  <i className="bi bi-file-check-fill me-2 text-[#b98f58]"></i>
                  Documentação digital assinada com validade jurídica.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function HighlightsSection({ items }) {
  return (
    <section id="highlights" className="py-20 bg-white reveal">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="section-eyebrow">Por que nos escolher</span>
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">
            Parceria estratégica para proteger o que é mais valioso para você
          </h2>
          <p className="text-lg text-slate-600">
            Unimos experiência jurídica, tecnologia e atendimento humanizado para entregar soluções completas em momentos decisivos.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {items?.map((item) => (
            <div key={item.title} className="p-8 rounded-3xl gradient-border">
              <Icon name={item.icon} className="mb-6" />
              <h3 className="text-xl font-semibold text-[#0d1b2a]">{item.title}</h3>
              <p className="mt-4 text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ services }) {
  return (
    <section id="services" className="py-20 bg-gray-50 reveal">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="section-eyebrow">Especialidades</span>
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">{services?.title}</h2>
          <p className="text-lg text-slate-600">{services?.description}</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {services?.items?.map((area) => (
            <article key={area.name} className="p-8 bg-white rounded-3xl shadow-lg shadow-slate-900/5 border border-slate-200/60">
              <ServicesIcon path={area.iconPath} />
              <h3 className="mt-6 text-xl font-semibold text-[#0d1b2a]">{area.name}</h3>
              <p className="mt-4 text-slate-600 leading-relaxed">{area.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderSection({ founder }) {
  return (
    <section id="founder" className="py-20 bg-white reveal">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <span className="section-eyebrow">O Escritório</span>
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">{founder?.name}</h2>
          <p className="text-lg font-medium text-[#b98f58] uppercase tracking-[0.25em]">{founder?.role}</p>
          {founder?.bio?.map((paragraph) => (
            <p key={paragraph} className="text-lg leading-relaxed text-slate-600">
              {paragraph}
            </p>
          ))}
          <blockquote className="text-xl italic text-[#0d1b2a] border-l-4 border-[#b98f58] pl-4">
            {founder?.signature}
          </blockquote>
        </div>
        <div className="space-y-6 card-surface rounded-3xl p-8">
          <h3 className="text-xl font-semibold text-[#0d1b2a]">Nossos diferenciais</h3>
          <ul className="space-y-4 text-slate-600 leading-relaxed">
            {founder?.differentiators?.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <i className="bi bi-check-circle-fill text-[#b98f58] text-lg mt-1"></i>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-2xl bg-[#0d1b2a] text-slate-100 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Secretaria estratégica</p>
            <p className="mt-2 text-lg">
              Nossa equipe acompanha todas as etapas do atendimento para garantir que você receba atualizações precisas e ágeis.
            </p>
            <p className="mt-3 text-sm text-slate-400">Disponível para audiências virtuais, reuniões híbridas e atendimento emergencial.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ testimonials }) {
  return (
    <section id="testimonials" className="py-20 bg-gray-50 reveal">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="section-eyebrow">Clientes</span>
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">{testimonials?.title}</h2>
          <p className="text-lg text-slate-600">{testimonials?.subtitle}</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonials?.items?.map((item) => (
            <article key={item.quote} className="testimonial-card relative p-8">
              <p className="text-lg leading-relaxed">{item.quote}</p>
              <div className="mt-8 pt-4 border-t border-white/10">
                <p className="font-semibold text-[#facc15]">{item.author}</p>
                <p className="text-sm text-slate-300">{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ contact }) {
  return (
    <section id="contact" className="py-20 bg-white reveal">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start contact-card p-10">
        <div className="space-y-6">
          <span className="contact-pill">Atendimento dedicado</span>
          <h2 className="text-3xl font-semibold text-[#0d1b2a]">{contact?.title}</h2>
          <p className="text-lg text-slate-600">{contact?.description}</p>
          <dl className="space-y-4 text-slate-600">
            <div>
              <dt className="font-semibold text-[#0d1b2a] uppercase tracking-[0.25em] text-xs">Endereço</dt>
              <dd>{contact?.address}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#0d1b2a] uppercase tracking-[0.25em] text-xs">Telefone</dt>
              <dd>
                <a href={`tel:${contact?.phone}`} className="hover:text-[#b98f58]">
                  {contact?.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[#0d1b2a] uppercase tracking-[0.25em] text-xs">E-mail</dt>
              <dd>
                <a href={`mailto:${contact?.email}`} className="hover:text-[#b98f58]">
                  {contact?.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[#0d1b2a] uppercase tracking-[0.25em] text-xs">Horário</dt>
              <dd>{contact?.officeHours}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#0d1b2a] uppercase tracking-[0.25em] text-xs">Prazo de resposta</dt>
              <dd>{contact?.responseTime}</dd>
            </div>
          </dl>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-semibold text-[#0d1b2a]">{contact?.form?.title}</h3>
            <p className="text-slate-600">{contact?.form?.subtitle}</p>
          </div>
          <form className="contact-form space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <label className="space-y-2 text-sm font-medium text-[#0d1b2a]">
                Nome completo
                <input
                  id="contactName"
                  name="nome"
                  type="text"
                  placeholder={contact?.form?.fields?.nome}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#b98f58]"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-[#0d1b2a]">
                E-mail
                <input
                  id="contactEmail"
                  name="email"
                  type="email"
                  placeholder={contact?.form?.fields?.email}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#b98f58]"
                />
              </label>
            </div>
            <label className="space-y-2 text-sm font-medium text-[#0d1b2a]">
              Telefone ou WhatsApp
              <input
                id="contactPhone"
                name="telefone"
                type="tel"
                placeholder={contact?.form?.fields?.telefone}
                className="w-full rounded-md border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#b98f58]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[#0d1b2a]">
              Como podemos ajudar?
              <textarea
                id="contactMessage"
                name="mensagem"
                rows="5"
                placeholder={contact?.form?.fields?.mensagem}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#b98f58]"
              ></textarea>
            </label>
            <p id="formStatus" className="text-sm text-slate-500 hidden"></p>
            <button
              type="submit"
              className="w-full bg-[#0d1b2a] text-white font-semibold uppercase tracking-[0.2em] py-3 rounded-md hover:bg-[#13243c] transition-colors"
            >
              Enviar mensagem
            </button>
            <p className="text-xs text-slate-500">{contact?.form?.disclaimer}</p>
          </form>
        </div>
      </div>
    </section>
  );
}

function FooterSection({ footer }) {
  return (
    <footer className="footer-background mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-[2fr_1fr] gap-10">
        <div className="space-y-4">
          <p className="text-lg font-semibold">Pavan &amp; Associados</p>
          <p className="text-sm text-slate-300 max-w-2xl">
            Escritório especializado em proteção patrimonial, sucessões e regularização imobiliária.
            Atendimento personalizado com suporte tecnológico completo.
          </p>
          <p className="text-xs text-slate-400">{footer?.rights}</p>
        </div>
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            {footer?.links?.map((link) => (
              <a key={link.label} href={link.href} className="text-sm">
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex gap-3">
            {footer?.social?.map((link) => (
              <a key={link.label} href={link.href} aria-label={link.label} className="text-lg">
                <i className={`bi ${link.icon}`}></i>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const content = useFirmContent();
  const [navOpen, setNavOpen] = useState(false);

  const navLinks = useMemo(() => content.nav?.items ?? [], [content.nav?.items]);
  const lawyerLink = useMemo(
    () => content.nav?.lawyerArea ?? { href: '/lawyer.html', label: 'Área do Advogado' },
    [content.nav?.lawyerArea]
  );

  const whatsappEnv = (import.meta.env.VITE_WHATSAPP_NUMBER || '').trim();
  const whatsappNumber = whatsappEnv || content.contact?.whatsapp || '';

  useEffect(() => {
    document.title = `${content.site?.name ?? 'Pavan & Associados'} • ${content.site?.tagline ?? ''}`.trim();
  }, [content.site?.name, content.site?.tagline]);

  useEffect(() => {
    document.body.classList.add('theme-d');
    return () => {
      document.body.classList.remove('theme-d');
    };
  }, []);

  useEffect(() => {
    const cleaned = whatsappNumber.replace(/\D/g, '');
    if (cleaned) {
      document.body.setAttribute('data-whatsapp-number', cleaned);
      const link = document.getElementById('whatsapp-cta');
      if (link) {
        link.href = `https://wa.me/${cleaned}`;
      }
    }
  }, [whatsappNumber]);

  useEffect(() => {
    if (!navOpen) return;
    const onScroll = () => setNavOpen(false);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [navOpen]);

  const toggleNav = () => setNavOpen((value) => !value);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-slate-900">
      <HeroSection
        hero={content.hero}
        site={content.site}
        navLinks={navLinks}
        lawyerLink={lawyerLink}
        navOpen={navOpen}
        toggleNav={toggleNav}
      />
      <main>
        <HighlightsSection items={content.highlights} />
        <ServicesSection services={content.services} />
        <FounderSection founder={content.founder} />
        <TestimonialsSection testimonials={content.testimonials} />
        <ContactSection contact={content.contact} />
      </main>
      <FooterSection footer={content.footer} />
    </div>
  );
}
