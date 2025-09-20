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

  const navLinkClass =
    "relative text-xs font-semibold uppercase tracking-[0.35em] text-white/80 transition-all duration-300 hover:text-[#B98F58] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:bg-[#B98F58] after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100";

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
        Area do Advogado
      </Link>
      <a
        href="#contact"
        onClick={closeMenu}
        className="mt-4 inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B98F58] hover:bg-[#B98F58] hover:text-[#0D1B2A] md:mt-0 md:ml-6"
      >
        CONTATO
      </a>
    </>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b border-transparent transition-all duration-300 ${
          isScrolled
            ? 'border-white/10 bg-[#0D1B2A]/95 shadow-lg backdrop-blur'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
            <LogoIcon className="w-10 h-10 mr-3 text-white" />
            <div className="leading-tight">
              <h1 className="text-sm font-bold uppercase tracking-[0.4em] text-white sm:text-base">NEIVA ADVOCACIA</h1>
              <p className="text-[10px] uppercase tracking-[0.45em] text-white/60">Advocacia Imobiliária</p>
            </div>
          </Link>
          <nav className="hidden items-center space-x-8 md:flex">{navLinks}</nav>
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
        className={`fixed inset-0 z-40 transform bg-[#0D1B2A]/95 backdrop-blur md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <nav className="flex h-full flex-col items-center justify-center space-y-8 text-white text-xl">{navLinks}</nav>
      </div>
    </>
  );
};

export default Header;
