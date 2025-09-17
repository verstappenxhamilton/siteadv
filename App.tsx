
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Services from './components/Services';
import Team from './components/Team';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import useFadeInOnScroll from './hooks/useFadeInOnScroll';
import ChatButton from './components/ChatButton';
import VirtualSecretaryChat from './components/VirtualSecretaryChat';
import LawyerPage from './components/LawyerPage';

const MainPage: React.FC = () => {
  useFadeInOnScroll();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <main>
        <Hero />
        <Services />
        <Team />
        <Testimonials />
        <Contact />
      </main>
      <ChatButton onClick={() => setIsChatOpen(true)} />
      <VirtualSecretaryChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

const App: React.FC = () => {
  return (
    <div className="bg-white font-sans">
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/lawyer" element={<LawyerPage />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
