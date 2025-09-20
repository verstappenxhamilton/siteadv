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

  const navLinks = (
    <>
      <a href="#services" onClick={closeMenu} className="hover:text-[#B98F58] transition-colors font-medium">Servicos</a>
      <a href="#team" onClick={closeMenu} className="hover:text-[#B98F58] transition-colors font-medium">O Fundador</a>
      <a href="#testimonials" onClick={closeMenu} className="hover:text-[#B98F58] transition-colors font-medium">Clientes</a>
      <Link to="/lawyer" onClick={closeMenu} className="hover:text-[#B98F58] transition-colors font-medium">
        Area do Advogado
      </Link>
      <a
        href="#contact"
        onClick={closeMenu}
        className="mt-4 md:mt-0 md:ml-4 px-4 py-2 border border-white rounded-sm hover:bg-white hover:text-[#0D1B2A] transition-colors font-bold inline-flex items-center justify-center md:-translate-y-[9px]"
      >
        CONTATO
      </a>
    </>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-[#0D1B2A] shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center" onClick={closeMenu}>
            <LogoIcon className="w-10 h-10 mr-3 text-white" />
            <div>
              <h1 className="text-sm sm:text-lg font-bold tracking-wider text-white">NEIVA & ASSOCIADOS</h1>
              <p className="text-xs text-gray-400">ADVOCACIA IMOBILIARIA</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-8 text-sm text-white">{navLinks}</nav>
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
