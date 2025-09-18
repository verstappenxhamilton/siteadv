
import { useEffect } from 'react';

const useFadeInOnScroll = () => {
  useEffect(() => {
    const sections = document.querySelectorAll('.fade-in-section');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        if (observer) {
          observer.unobserve(section);
        }
      });
    };
  }, []);
};

export default useFadeInOnScroll;
