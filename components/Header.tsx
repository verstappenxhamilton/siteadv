import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LogoIcon from "./icons/LogoIcon";

type HeaderThemeOption = "classic" | "aurora";

type HeaderThemeDefinition = {
  value: HeaderThemeOption;
  label: string;
  description: string;
};

type HeaderProps = {
  theme: HeaderThemeOption;
  onThemeSelect: (value: HeaderThemeOption) => void;
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

  const renderThemeSwitcher = (variant: "desktop" | "mobile" = "desktop") => (
    <div
      className={`site-theme-switcher ${variant === "mobile" ? "site-theme-switcher--mobile" : ""}`}
      role="group"
      aria-label="Seleção de tema"
    >
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
