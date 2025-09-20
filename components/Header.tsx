import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LogoIcon from './icons/LogoIcon';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const navLinkClass = 'hover:text-[#B98F58] transition-colors font-medium tracking-wide';

  const navLinks = (
    <>
      <a href="#services" onClick={closeMenu} className={navLinkClass}>
        Serviços
      </a>
      <a href="#team" onClick={closeMenu} className={navLinkClass}>
        O Fundador
      </a>
      <a href="#testimonials" onClick={closeMenu} className={navLinkClass}>
        Clientes
      </a>
      <Link to="/lawyer" onClick={closeMenu} className={navLinkClass}>
        Área do Advogado
      </Link>
      <a
        href="#contact"
        onClick={closeMenu}
        className="mt-6 md:mt-0 md:ml-6 inline-flex items-center justify-center gap-2 rounded-full border border-white/60 px-5 py-2 text-sm font-semibold uppercase tracking-widest text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#0D1B2A]"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-[#B98F58]" aria-hidden="true"></span>
        Contato
      </a>
    </>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-[#0D1B2A]/95 backdrop-blur shadow-lg' : 'bg-transparent'
        }`}
      >
        <div
          className={`hidden border-b border-white/10 text-white/80 transition-colors duration-300 md:block ${
            isScrolled ? 'bg-[#0D1B2A]' : 'bg-[#102337]/70 backdrop-blur'
          }`}
        >
          <div className="container mx-auto flex items-center justify-between px-6 py-2 text-xs tracking-wide">
            <div className="flex items-center gap-6">
              <span className="inline-flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 text-[#B98F58]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13A11.042 11.042 0 0014.52 15.52l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a href="tel:+43574301234" className="hover:text-white transition-colors">
                  43 57430 1234
                </a>
              </span>
              <span className="inline-flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 text-[#B98F58]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16.5 9.4L21 12l-4.5 2.6v5.2L12 22l-4.5-2.2v-5.2L3 12l4.5-2.6V4.2L12 2l4.5 2.2v5.2z"
                  />
                </svg>
                Atuação em todo o Brasil
              </span>
            </div>
            <span className="inline-flex items-center gap-2 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 text-[#B98F58]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l2.5 2.5M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"
                />
              </svg>
              Retorno em até 1 hora útil
            </span>
          </div>
        </div>
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center" onClick={closeMenu}>
            <LogoIcon className="w-10 h-10 mr-3 text-white" />
            <div>
              <h1 className="text-sm sm:text-lg font-bold tracking-[0.35em] text-white">NEIVA ADVOCACIA</h1>
              <p className="text-xs uppercase text-white/70">Advocacia Imobiliária</p>
            </div>
          </Link>
          <nav className="hidden items-center space-x-8 text-sm text-white md:flex">{navLinks}</nav>
          <button
            className="md:hidden text-white z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
      </header>
      <div
        className={`md:hidden fixed inset-0 bg-[#0D1B2A] bg-opacity-95 z-40 transform ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <nav className="flex flex-col items-center justify-center h-full space-y-8 text-white text-xl">{navLinks}</nav>
      </div>
    </>
  );
};

export default Header;
