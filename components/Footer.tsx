import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer-container">
      <p>&copy; {new Date().getFullYear()} Pavan & Associados. Todos os direitos reservados.</p>
      <p>Desenvolvido com IA</p>
    </footer>
  );
};

export default Footer;