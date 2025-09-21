import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Team from '../components/Team';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import FloatingChat from '../components/FloatingChat';
import useFadeInOnScroll from '../hooks/useFadeInOnScroll';
import '../styles/HomePage.css';

const HomePage: React.FC = () => {
  useFadeInOnScroll();

  return (
    <div className="homepage-design">
      <Header />
      <main>
        <div id="hero">
          <Hero />
        </div>
        <section id="services" className="fade-in-section">
          <Services />
        </section>
        <section id="team" className="fade-in-section">
          <Team />
        </section>
        <section id="testimonials" className="fade-in-section">
          <Testimonials />
        </section>
        <section id="contact" className="fade-in-section">
          <Contact />
        </section>
      </main>
      <Footer />
      <FloatingChat />
    </div>
  );
};

export default HomePage;
