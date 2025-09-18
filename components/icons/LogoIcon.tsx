
import React from 'react';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 2.5L2.5 15V35L25 47.5L47.5 35V15L25 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M15 20L25 15L35 20V30H15V20Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M25 30V37.5" stroke="currentColor" strokeWidth="2"/>
    <path d="M20 37.5H30" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export default LogoIcon;
