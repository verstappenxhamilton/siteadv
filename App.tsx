import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LawyerPage from './pages/LawyerPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lawyer" element={<LawyerPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
