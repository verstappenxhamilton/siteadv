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

export type ThemeOption = "classic" | "aurora";

const THEME_OPTIONS: { value: ThemeOption; label: string; description: string }[] = [
  { value: "classic", label: "Clássico", description: "Visual original com contraste sofisticado" },
  {
    value: "aurora",
    label: "Aurora",
    description: "Tema clean com camadas translúcidas e tons suaves",
  },
];

const THEME_STORAGE_KEY = "client-home-theme";

const HomePage: React.FC = () => {
  useFadeInOnScroll();

  const [theme, setTheme] = useState<ThemeOption>(() => {
    if (typeof window !== "undefined") {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === "classic" || storedTheme === "aurora") {
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

  const handleThemeSelect = (value: ThemeOption) => {
    setTheme((current) => (current === value ? current : value));
  };

  const rootClassName = `home-page theme-${theme}`;

  return (
    <div className={rootClassName}>
      <Header theme={theme} onThemeSelect={handleThemeSelect} themeOptions={THEME_OPTIONS} />
      <main>
        <Hero />
        <Services />
        <Team />
        <Testimonials />
      </main>
      <Footer />
      <FloatingChat />
    </div>
  );
};

export default HomePage;
