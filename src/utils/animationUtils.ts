/**
 * Lightweight animation utilities to replace framer-motion
 * Provides CSS-based animations with React hooks
 */

import { useEffect, useState, useRef, useCallback } from 'react';

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface FadeConfig extends AnimationConfig {
  from?: number;
  to?: number;
}

export interface SlideConfig extends AnimationConfig {
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

export interface ScaleConfig extends AnimationConfig {
  from?: number;
  to?: number;
}

/**
 * Fade animation hook
 */
export const useFadeAnimation = (
  isVisible: boolean,
  config: FadeConfig = {}
) => {
  const {
    duration = 300,
    delay = 0,
    easing = 'ease-in-out',
    from = 0,
    to = 1,
    fillMode = 'both'
  } = config;

  const [shouldRender, setShouldRender] = useState(isVisible);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    }

    const element = elementRef.current;
    if (!element) return;

    const keyframes = [
      { opacity: isVisible ? from : to },
      { opacity: isVisible ? to : from }
    ];

    const animation = element.animate(keyframes, {
      duration,
      delay,
      easing,
      fill: fillMode,
    });

    animation.onfinish = () => {
      if (!isVisible) {
        setShouldRender(false);
      }
    };

    return () => {
      animation.cancel();
    };
  }, [isVisible, duration, delay, easing, from, to, fillMode]);

  return {
    shouldRender,
    ref: elementRef,
    style: {
      opacity: isVisible ? to : from,
      transition: `opacity ${duration}ms ${easing} ${delay}ms`,
    },
  };
};

/**
 * Slide animation hook
 */
export const useSlideAnimation = (
  isVisible: boolean,
  config: SlideConfig = {}
) => {
  const {
    duration = 300,
    delay = 0,
    easing = 'ease-in-out',
    direction = 'up',
    distance = 20,
    fillMode = 'both'
  } = config;

  const [shouldRender, setShouldRender] = useState(isVisible);
  const elementRef = useRef<HTMLElement>(null);

  const getTransform = useCallback((show: boolean) => {
    if (show) return 'translate3d(0, 0, 0)';
    
    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'right':
        return `translate3d(-${distance}px, 0, 0)`;
      default:
        return `translate3d(0, ${distance}px, 0)`;
    }
  }, [direction, distance]);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    }

    const element = elementRef.current;
    if (!element) return;

    const keyframes = [
      { 
        opacity: isVisible ? 0 : 1,
        transform: getTransform(!isVisible)
      },
      { 
        opacity: isVisible ? 1 : 0,
        transform: getTransform(isVisible)
      }
    ];

    const animation = element.animate(keyframes, {
      duration,
      delay,
      easing,
      fill: fillMode,
    });

    animation.onfinish = () => {
      if (!isVisible) {
        setShouldRender(false);
      }
    };

    return () => {
      animation.cancel();
    };
  }, [isVisible, duration, delay, easing, getTransform, fillMode]);

  return {
    shouldRender,
    ref: elementRef,
    style: {
      opacity: isVisible ? 1 : 0,
      transform: getTransform(isVisible),
      transition: `all ${duration}ms ${easing} ${delay}ms`,
    },
  };
};

/**
 * Scale animation hook
 */
export const useScaleAnimation = (
  isVisible: boolean,
  config: ScaleConfig = {}
) => {
  const {
    duration = 300,
    delay = 0,
    easing = 'ease-in-out',
    from = 0.8,
    to = 1,
    fillMode = 'both'
  } = config;

  const [shouldRender, setShouldRender] = useState(isVisible);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    }

    const element = elementRef.current;
    if (!element) return;

    const keyframes = [
      { 
        opacity: isVisible ? 0 : 1,
        transform: `scale(${isVisible ? from : to})`
      },
      { 
        opacity: isVisible ? 1 : 0,
        transform: `scale(${isVisible ? to : from})`
      }
    ];

    const animation = element.animate(keyframes, {
      duration,
      delay,
      easing,
      fill: fillMode,
    });

    animation.onfinish = () => {
      if (!isVisible) {
        setShouldRender(false);
      }
    };

    return () => {
      animation.cancel();
    };
  }, [isVisible, duration, delay, easing, from, to, fillMode]);

  return {
    shouldRender,
    ref: elementRef,
    style: {
      opacity: isVisible ? 1 : 0,
      transform: `scale(${isVisible ? to : from})`,
      transition: `all ${duration}ms ${easing} ${delay}ms`,
    },
  };
};

/**
 * Stagger animation hook for lists
 */
export const useStaggerAnimation = (
  items: any[],
  isVisible: boolean,
  config: AnimationConfig & { staggerDelay?: number } = {}
) => {
  const {
    duration = 300,
    delay = 0,
    staggerDelay = 50,
    easing = 'ease-in-out'
  } = config;

  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isVisible) {
      items.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems(prev => new Set([...prev, index]));
        }, delay + (index * staggerDelay));
      });
    } else {
      setVisibleItems(new Set());
    }
  }, [isVisible, items.length, delay, staggerDelay]);

  const getItemStyle = useCallback((index: number) => ({
    opacity: visibleItems.has(index) ? 1 : 0,
    transform: visibleItems.has(index) ? 'translateY(0)' : 'translateY(20px)',
    transition: `all ${duration}ms ${easing}`,
  }), [visibleItems, duration, easing]);

  return {
    getItemStyle,
    visibleItems,
  };
};

/**
 * Hover animation hook
 */
export const useHoverAnimation = (config: ScaleConfig = {}) => {
  const {
    duration = 200,
    easing = 'ease-in-out',
    from = 1,
    to = 1.05
  } = config;

  const [isHovered, setIsHovered] = useState(false);

  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    style: {
      transform: `scale(${isHovered ? to : from})`,
      transition: `transform ${duration}ms ${easing}`,
      cursor: 'pointer',
    },
  };

  return {
    isHovered,
    hoverProps,
  };
};

/**
 * Loading animation hook
 */
export const useLoadingAnimation = (isLoading: boolean) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isLoading) {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  return dots;
};

/**
 * Pulse animation utility
 */
export const pulseAnimation = {
  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  '@keyframes pulse': {
    '0%, 100%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0.5,
    },
  },
};

/**
 * Bounce animation utility
 */
export const bounceAnimation = {
  animation: 'bounce 1s infinite',
  '@keyframes bounce': {
    '0%, 100%': {
      transform: 'translateY(-25%)',
      animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
    },
    '50%': {
      transform: 'none',
      animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
    },
  },
};

/**
 * Spin animation utility
 */
export const spinAnimation = {
  animation: 'spin 1s linear infinite',
  '@keyframes spin': {
    from: {
      transform: 'rotate(0deg)',
    },
    to: {
      transform: 'rotate(360deg)',
    },
  },
};

/**
 * Shake animation utility
 */
export const shakeAnimation = {
  animation: 'shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
  '@keyframes shake': {
    '10%, 90%': {
      transform: 'translate3d(-1px, 0, 0)',
    },
    '20%, 80%': {
      transform: 'translate3d(2px, 0, 0)',
    },
    '30%, 50%, 70%': {
      transform: 'translate3d(-4px, 0, 0)',
    },
    '40%, 60%': {
      transform: 'translate3d(4px, 0, 0)',
    },
  },
};

/**
 * Create CSS animation classes
 */
export const createAnimationClasses = () => `
  .fade-enter {
    opacity: 0;
  }
  .fade-enter-active {
    opacity: 1;
    transition: opacity 300ms ease-in-out;
  }
  .fade-exit {
    opacity: 1;
  }
  .fade-exit-active {
    opacity: 0;
    transition: opacity 300ms ease-in-out;
  }

  .slide-up-enter {
    opacity: 0;
    transform: translateY(20px);
  }
  .slide-up-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition: all 300ms ease-in-out;
  }
  .slide-up-exit {
    opacity: 1;
    transform: translateY(0);
  }
  .slide-up-exit-active {
    opacity: 0;
    transform: translateY(-20px);
    transition: all 300ms ease-in-out;
  }

  .scale-enter {
    opacity: 0;
    transform: scale(0.8);
  }
  .scale-enter-active {
    opacity: 1;
    transform: scale(1);
    transition: all 300ms ease-in-out;
  }
  .scale-exit {
    opacity: 1;
    transform: scale(1);
  }
  .scale-exit-active {
    opacity: 0;
    transform: scale(0.8);
    transition: all 300ms ease-in-out;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(-25%);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: none;
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
  }

  .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  .animate-bounce { animation: bounce 1s infinite; }
  .animate-spin { animation: spin 1s linear infinite; }
  .animate-shake { animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
`;
