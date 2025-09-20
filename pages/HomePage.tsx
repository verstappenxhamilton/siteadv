import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Highlights from '../components/Highlights';
import Services from '../components/Services';
import Process from '../components/Process';
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
        <Highlights />
        <Services />
        <Process />
        <Team />
        <Testimonials />
      </main>
      <Footer />
      <FloatingChat />
    </div>
  );
};

export default HomePage;
