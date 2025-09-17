import { useEffect } from 'react';

const DEFAULT_SELECTOR = '.fade-in-section';
const DEFAULT_VISIBLE_CLASS = 'is-visible';

export const useFadeInOnScroll = ({
  selector = DEFAULT_SELECTOR,
  visibleClass = DEFAULT_VISIBLE_CLASS,
  threshold = 0.1,
} = {}) => {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(selector));
    if (!elements.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(visibleClass);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => observer.unobserve(element));
    };
  }, [selector, visibleClass, threshold]);
};
