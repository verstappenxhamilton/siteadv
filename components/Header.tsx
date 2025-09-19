import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { HomeThemeOption } from "../types/home-theme";
import LogoIcon from "./icons/LogoIcon";

type HeaderThemeDefinition = {
  value: HomeThemeOption;
  label: string;
  description: string;
};

type HeaderProps = {
  theme: HomeThemeOption;
  onThemeSelect: (value: HomeThemeOption) => void;
  themeOptions: HeaderThemeDefinition[];
};

const Header: React.FC<HeaderProps> = ({ theme, onThemeSelect, themeOptions }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const renderThemeSwitcher = (
    variant: "desktop" | "mobile" = "desktop",
    extraClassName = ""
  ) => {
    const className = [
      "site-theme-switcher",
      variant === "mobile" ? "site-theme-switcher--mobile" : "",
      extraClassName,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={className} role="group" aria-label="Seleção de tema">
        <span className="site-theme-switcher__label">
          <i className="bi bi-stars" aria-hidden="true" /> Tema
        </span>
        <div className="site-theme-switcher__options">
          {themeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`site-theme-chip ${theme === option.value ? "is-active" : ""}`}
            data-theme={option.value}
            onClick={() => onThemeSelect(option.value)}
            aria-pressed={theme === option.value}
            title={option.description}
          >
            <span className="site-theme-chip__swatch" aria-hidden="true" />
            <span className="site-theme-chip__label">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
    );
  };

  const navLinks = (
    <>
      <a href="#services" onClick={closeMenu} className="site-nav__link">
        Serviços
      </a>
      <a href="#team" onClick={closeMenu} className="site-nav__link">
        O Fundador
      </a>
      <a href="#testimonials" onClick={closeMenu} className="site-nav__link">
        Clientes
      </a>
      <Link to="/lawyer" onClick={closeMenu} className="site-nav__link">
        Área do Advogado
      </Link>
    </>
  );

  if (theme === "legacy") {
    const legacyNavLinkClass = "hover:text-[#B98F58] transition-colors font-medium";

    return (
      <>
        <header
          className={`legacy-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled ? "legacy-header--scrolled" : "bg-transparent"
          }`}
        >
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center" onClick={closeMenu}>
              <LogoIcon className="w-10 h-10 mr-3 text-white" />
              <div>
                <h1 className="text-sm sm:text-lg font-bold tracking-wider text-white">NEIVA & ASSOCIADOS</h1>
                <p className="text-xs text-gray-400">ADVOCACIA IMOBILIÁRIA</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-8 text-sm text-white">
              <a href="#services" onClick={closeMenu} className={legacyNavLinkClass}>
                Serviços
              </a>
              <a href="#team" onClick={closeMenu} className={legacyNavLinkClass}>
                O Fundador
              </a>
              <a href="#testimonials" onClick={closeMenu} className={legacyNavLinkClass}>
                Clientes
              </a>
              <Link to="/lawyer" onClick={closeMenu} className={legacyNavLinkClass}>
                Área do Advogado
              </Link>
            </nav>
            <div className="hidden md:flex items-center gap-4">
              {renderThemeSwitcher("desktop", "site-theme-switcher--legacy")}
              <a
                href="#contact"
                className="legacy-contact-button px-4 py-2 border border-white rounded-sm hover:bg-white hover:text-[#0D1B2A] transition-colors font-bold uppercase tracking-[0.18em]"
              >
                Contato
              </a>
            </div>
            <button
              type="button"
              className="md:hidden text-white z-50"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMenuOpen}
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
          className={`legacy-mobile-menu fixed inset-0 bg-[#0D1B2A] bg-opacity-95 z-40 transform ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out`}
        >
          <nav className="flex flex-col items-center justify-center h-full space-y-8 text-white text-xl">
            <a href="#services" onClick={closeMenu} className="hover:text-[#B98F58] transition-colors">
              Serviços
            </a>
            <a href="#team" onClick={closeMenu} className="hover:text-[#B98F58] transition-colors">
              O Fundador
            </a>
            <a href="#testimonials" onClick={closeMenu} className="hover:text-[#B98F58] transition-colors">
              Clientes
            </a>
            <Link to="/lawyer" onClick={closeMenu} className="hover:text-[#B98F58] transition-colors">
              Área do Advogado
            </Link>
            <a
              href="#contact"
              onClick={closeMenu}
              className="legacy-contact-button inline-flex items-center justify-center px-6 py-3 border border-white rounded-sm uppercase tracking-[0.18em] hover:bg-white hover:text-[#0D1B2A] transition-colors"
            >
              Contato
            </a>
            <div className="w-full max-w-xs pt-6">
              {renderThemeSwitcher("mobile", "site-theme-switcher--legacy")}
            </div>
          </nav>
        </div>
      </>
    );
  }

  return (
    <>
      <header className={`site-header ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="container site-header__inner">
          <Link to="/" className="site-logo" onClick={closeMenu}>
            <LogoIcon className="site-logo__icon" />
            <div className="site-logo__text">
              <span className="site-logo__title">NEIVA & ASSOCIADOS</span>
              <span className="site-logo__subtitle">ADVOCACIA IMOBILIÁRIA</span>
            </div>
          </Link>
          <nav className="site-nav">{navLinks}</nav>
          <div className="site-header__actions">
            {renderThemeSwitcher()}
            <a href="#contact" className="site-contact-button">
              Contato
            </a>
            <button
              type="button"
              className={`site-menu-toggle ${isMenuOpen ? "is-open" : ""}`}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMenuOpen}
            >
              <span className="site-menu-toggle__bar" />
              <span className="site-menu-toggle__bar" />
              <span className="site-menu-toggle__bar" />
            </button>
          </div>
        </div>
      </header>
      <div className={`site-mobile-menu ${isMenuOpen ? "is-visible" : ""}`}>
        <div className="site-mobile-menu__content">
          <nav className="site-mobile-menu__nav">{navLinks}</nav>
          <div className="site-mobile-menu__footer">
            {renderThemeSwitcher("mobile")}
            <a href="#contact" className="site-contact-button site-contact-button--mobile" onClick={closeMenu}>
              Contato
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
