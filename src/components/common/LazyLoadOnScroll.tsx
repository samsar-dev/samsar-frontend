import React, { Suspense, lazy, useRef, useState, useEffect } from 'react';
import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';

interface LazyLoadOnScrollProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const LazyLoadOnScroll: React.FC<LazyLoadOnScrollProps> = ({ children, fallback = null }) => {
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
        rootMargin: '200px', // Start loading when the component is 200px away from the viewport
        threshold: 0.01,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  );
};

export default LazyLoadOnScroll;
