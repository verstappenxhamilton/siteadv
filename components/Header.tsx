import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LogoIcon from './icons/LogoIcon';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = (
    <>
      <a href="#services" onClick={closeMenu}>Serviços</a>
      <a href="#team" onClick={closeMenu}>O Fundador</a>
      <a href="#testimonials" onClick={closeMenu}>Clientes</a>
      <Link to="/lawyer" onClick={closeMenu}>Área do Advogado</Link>
      <a href="#contact" onClick={closeMenu} className="header-contact-button">Contato</a>
    </>
  );

  return (
    <>
      <header className={`header-container ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <Link to="/" className="header-logo" onClick={closeMenu}>
            <LogoIcon className="logo-icon" />
            <div className="logo-text">
              <span className="logo-title">NEIVA ADVOCACIA</span>
              <span className="logo-subtitle">ADVOCACIA IMOBILIÁRIA</span>
            </div>
          </Link>
          <nav className="header-nav">{navLinks}</nav>
          <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            )}
          </button>
        </div>
      </header>
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav-links">{navLinks}</nav>
      </div>
    </>
  );
};

export default Header;