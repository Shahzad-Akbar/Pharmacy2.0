'use client';

import { useState, useRef, useEffect } from 'react';

interface LazyLoadProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const LazyLoad: React.FC<LazyLoadProps> = ({ children, placeholder, className, style }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '0px 0px 100px 0px', // Start loading 100px before it enters the viewport
        threshold: 0.1
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div 
      ref={ref} 
      className={`lazy-load-container ${className || ''} ${isVisible ? 'is-visible' : ''}`}
      style={style}
    >
      {isVisible ? children : placeholder}
    </div>
  );
};

export default LazyLoad;
