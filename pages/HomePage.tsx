import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Team from "../components/Team";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";
import FloatingChat from "../components/FloatingChat";
import useFadeInOnScroll from "../hooks/useFadeInOnScroll";
import "../styles/home-page.css";
import type { HomeThemeOption } from "../types/home-theme";

const THEME_OPTIONS: { value: HomeThemeOption; label: string; description: string }[] = [
  { value: "classic", label: "Clássico", description: "Visual refinado com contrastes elegantes" },
  {
    value: "aurora",
    label: "Aurora",
    description: "Tema translúcido com tons suaves e detalhes luminosos",
  },
  {
    value: "legacy",
    label: "Original",
    description: "Layout clássico exatamente como o lançamento do site",
  },
];

const THEME_STORAGE_KEY = "client-home-theme";

const HomePage: React.FC = () => {
  useFadeInOnScroll();

  const [theme, setTheme] = useState<HomeThemeOption>(() => {
    if (typeof window !== "undefined") {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === "classic" || storedTheme === "aurora" || storedTheme === "legacy") {
        return storedTheme;
      }
    }
    return "classic";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const handleThemeSelect = (value: HomeThemeOption) => {
    setTheme((current) => (current === value ? current : value));
  };

  const rootClassName = `home-page theme-${theme}`;

  return (
    <div className={rootClassName}>
      <Header theme={theme} onThemeSelect={handleThemeSelect} themeOptions={THEME_OPTIONS} />
      <main>
        <Hero theme={theme} />
        <Services theme={theme} />
        <Team theme={theme} />
        <Testimonials theme={theme} />
      </main>
      <Footer theme={theme} />
      <FloatingChat />
    </div>
  );
};

export default HomePage;
