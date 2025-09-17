import React from 'react';

export const LogoIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 2.5L2.5 15V35L25 47.5L47.5 35V15L25 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M15 20L25 15L35 20V30H15V20Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M25 30V37.5" stroke="currentColor" strokeWidth="2" />
    <path d="M20 37.5H30" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const RealEstateIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M54 28L32 6L10 28V58H24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 58V40H42V58"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M58 48L46 36"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M49 39L43 33"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M40 54H54"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const InheritanceIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M32 54V30"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 38C39.732 38 46 31.732 46 24C46 16.268 39.732 10 32 10C24.268 10 18 16.268 18 24C18 31.732 24.268 38 32 38Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="24" cy="18" r="3" fill="#B98F58" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="40" cy="18" r="3" fill="#B98F58" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="32" cy="12" r="3" fill="#B98F58" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M44 34H56V58L50 54L44 58V34Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <text
      x="50"
      y="28"
      fontFamily="serif"
      fontSize="8"
      textAnchor="middle"
      fontWeight="bold"
      fill="currentColor"
    >
      WILL
    </text>
    <circle cx="20" cy="46" r="3" stroke="currentColor" strokeWidth="2" />
    <path
      d="M24 58L20 50L16 58"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ExperienceIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M44 12H20C17.7909 12 16 13.7909 16 16V48C16 50.2091 17.7909 52 20 52H44C46.2091 52 48 50.2091 48 48V16C48 13.7909 46.2091 12 44 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M24 20H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 28H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 36H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 36L24 44L28 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M52 36L40 44L36 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 44C24 44 26 48 32 48C38 48 40 44 40 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const QuoteIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.6,83.3c-5.9-5.9-8.9-13.6-8.9-23.2c0-9.6,2.9-17.7,8.8-24.3c5.9-6.6,13.2-9.9,22.1-9.9c2.3,0,4.3,0.3,6.2,0.8 l-3,11.5c-1.3-0.3-2.6-0.5-4-0.5c-4.7,0-8.6,1.8-11.7,5.3c-3.1,3.5-4.7,8-4.7,13.4c0,5,1.6,9.4,4.7,13.1 c3.1,3.7,7,5.6,11.5,5.6c1.4,0,2.8-0.2,4.3-0.5l3,11.5c-2.1,0.5-4.3,0.8-6.6,0.8C27.5,92.2,20,89.6,13.6,83.3z M63.6,83.3 c-5.9-5.9-8.9-13.6-8.9-23.2c0-9.6,2.9-17.7,8.8-24.3c5.9-6.6,13.2-9.9,22.1-9.9c2.3,0,4.3,0.3,6.2,0.8l-3,11.5 c-1.3-0.3-2.6-0.5-4-0.5c-4.7,0-8.6,1.8-11.7,5.3c-3.1,3.5-4.7,8-4.7,13.4c0,5,1.6,9.4,4.7,13.1c3.1,3.7,7,5.6,11.5,5.6 c1.4,0,2.8-0.2,4.3-0.5l3,11.5c-2.1,0.5-4.3,0.8-6.6,0.8C77.5,92.2,70,89.6,63.6,83.3z" />
  </svg>
);

export const WhatsappIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.248 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

export const TwitterIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.065c0 2.296 1.634 4.208 3.803 4.649-.6.166-1.243.2-1.9.088.616 1.923 2.393 3.316 4.492 3.355-1.64 1.288-3.717 2.053-5.963 2.053-.387 0-.768-.023-1.145-.067 2.099 1.35 4.596 2.148 7.29 2.148 8.578 0 13.279-7.106 13.033-13.388.899-.652 1.67-1.464 2.288-2.38z" />
  </svg>
);

export const InstagramIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);
