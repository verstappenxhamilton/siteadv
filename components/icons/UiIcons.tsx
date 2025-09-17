
import React from 'react';

export const GavelHouseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M54 28L32 6L10 28V58H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 58V40H42V58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M58 48L46 36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M49 39L43 33" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M40 54H54" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const WillTreeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 54V30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M32 38C39.732 38 46 31.732 46 24C46 16.268 39.732 10 32 10C24.268 10 18 16.268 18 24C18 31.732 24.268 38 32 38Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="24" cy="18" r="3" fill="#B98F58" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="40" cy="18" r="3" fill="#B98F58" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="32" cy="12" r="3" fill="#B98F58" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M44 34H56V58L50 54L44 58V34Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="50" y="28" fontFamily="serif" fontSize="8" textAnchor="middle" fontWeight="bold" fill="currentColor">WILL</text>
    <circle cx="20" cy="46" r="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M24 58L20 50L16 58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const HandshakeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M44 12H20C17.7909 12 16 13.7909 16 16V48C16 50.2091 17.7909 52 20 52H44C46.2091 52 48 50.2091 48 48V16C48 13.7909 46.2091 12 44 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 20H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 28H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 36H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 36L24 44L28 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M52 36L40 44L36 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 44C24 44 26 48 32 48C38 48 40 44 40 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const QuoteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M13.6,83.3c-5.9-5.9-8.9-13.6-8.9-23.2c0-9.6,2.9-17.7,8.8-24.3c5.9-6.6,13.2-9.9,22.1-9.9c2.3,0,4.3,0.3,6.2,0.8 l-3,11.5c-1.3-0.3-2.6-0.5-4-0.5c-4.7,0-8.6,1.8-11.7,5.3c-3.1,3.5-4.7,8-4.7,13.4c0,5,1.6,9.4,4.7,13.1 c3.1,3.7,7,5.6,11.5,5.6c1.4,0,2.8-0.2,4.3-0.5l3,11.5c-2.1,0.5-4.3,0.8-6.6,0.8C27.5,92.2,20,89.6,13.6,83.3z M63.6,83.3 c-5.9-5.9-8.9-13.6-8.9-23.2c0-9.6,2.9-17.7,8.8-24.3c5.9-6.6,13.2-9.9,22.1-9.9c2.3,0,4.3,0.3,6.2,0.8l-3,11.5 c-1.3-0.3-2.6-0.5-4-0.5c-4.7,0-8.6,1.8-11.7,5.3c-3.1,3.5-4.7,8-4.7,13.4c0,5,1.6,9.4,4.7,13.1c3.1,3.7,7,5.6,11.5,5.6 c1.4,0,2.8-0.2,4.3-0.5l3,11.5c-2.1,0.5-4.3,0.8-6.6,0.8C77.5,92.2,70,89.6,63.6,83.3z"/>
  </svg>
);
