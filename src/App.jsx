import React from 'react';
import Header from './components/Header.jsx';
import HeroSection from './components/HeroSection.jsx';
import ServicesSection from './components/ServicesSection.jsx';
import FounderSection from './components/FounderSection.jsx';
import TestimonialsSection from './components/TestimonialsSection.jsx';
import Footer from './components/Footer.jsx';
import { useFadeInOnScroll } from './hooks/useFadeInOnScroll.js';

const App = () => {
  useFadeInOnScroll();

  return (
    <div className="bg-white font-sans">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <FounderSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default App;
