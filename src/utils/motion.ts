// Optimized framer-motion imports to reduce bundle size
// Only import what we actually use instead of the entire library

// Core animation functions - using standard imports for compatibility
export { motion, AnimatePresence } from 'framer-motion';

// Essential hooks only - using standard imports
export { useAnimation, useInView } from 'framer-motion';

// Basic easing functions only
export const easeInOut = [0.4, 0, 0.2, 1];
export const easeOut = [0, 0, 0.2, 1];
export const easeIn = [0.4, 0, 1, 1];

// Optimized animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const slideIn = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 }
};

// Transition presets
export const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

export const smoothTransition = {
  duration: 0.3,
  ease: easeInOut
};
