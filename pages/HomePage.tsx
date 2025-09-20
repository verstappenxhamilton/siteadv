import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Team from '../components/Team';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import FloatingChat from '../components/FloatingChat';
import useFadeInOnScroll from '../hooks/useFadeInOnScroll';

const HomePage: React.FC = () => {
  useFadeInOnScroll();

  return (
    <div className="bg-white font-sans">
      <Header />
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
