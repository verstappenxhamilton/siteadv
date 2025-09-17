import React, { useEffect, useMemo, useState } from 'react';
import { LogoIcon } from './icons/Icons.jsx';

const NAV_LINKS = [
  { href: '#services', label: 'Serviços' },
  { href: '#team', label: 'O Fundador' },
  { href: '#testimonials', label: 'Clientes' },
  { href: '#contact', label: 'CONTATO', isCallToAction: true },
];

const Header = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = useMemo(
    () =>
      NAV_LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          onClick={() => setIsMobileOpen(false)}
          className={
            link.isCallToAction
              ? 'mt-4 md:mt-0 md:ml-4 px-4 py-2 border border-white rounded-sm hover:bg-white hover:text-[#0D1B2A] transition-colors font-bold'
              : 'hover:text-[#B98F58] transition-colors font-medium'
          }
        >
          {link.label}
        </a>
      )),
    [],
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-[#0D1B2A] shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#" className="flex items-center">
            <LogoIcon className="w-10 h-10 mr-3 text-white" />
            <div>
              <h1 className="text-sm sm:text-lg font-bold tracking-wider text-white">PAVAN &amp; ASSOCIADOS</h1>
              <p className="text-xs text-gray-400">ADVOCACIA IMOBILIÁRIA</p>
            </div>
          </a>

          <nav className="hidden md:flex items-center space-x-8 text-sm text-white">{navItems}</nav>

          <button
            type="button"
            className="md:hidden text-white z-50"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Alternar menu"
          >
            {isMobileOpen ? (
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
          isMobileOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <nav className="flex flex-col items-center justify-center h-full space-y-8 text-white text-xl">
          {navItems}
        </nav>
      </div>
    </>
  );
};

export default Header;
