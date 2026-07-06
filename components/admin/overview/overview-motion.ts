import type { TargetAndTransition, Transition, Variants } from 'framer-motion';

const overviewEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function getOverviewEnterTransition(reduced: boolean, delay = 0): Transition {
  return {
    delay,
    duration: reduced ? 0.01 : 0.6,
    ease: overviewEase,
  };
}

export function getOverviewContainerVariants(reduced: boolean, stagger = 0.08): Variants {
  return {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: reduced
        ? { duration: 0.01 }
        : {
            staggerChildren: stagger,
            delayChildren: 0.05,
          },
    },
  };
}

export function getOverviewRevealVariants(reduced: boolean, y = 24, scale = 0.98): Variants {
  return {
    hidden: {
      opacity: 0,
      y: reduced ? 0 : y,
      scale: reduced ? 1 : scale,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: getOverviewEnterTransition(reduced),
    },
  };
}

export function getOverviewSlideVariants(reduced: boolean, x = 28): Variants {
  return {
    hidden: {
      opacity: 0,
      x: reduced ? 0 : x,
    },
    show: {
      opacity: 1,
      x: 0,
      transition: getOverviewEnterTransition(reduced),
    },
  };
}

export function getOverviewFloatAnimation(reduced: boolean, delta = 10): TargetAndTransition {
  return reduced
    ? { y: 0 }
    : {
        y: [0, -delta, 0],
        transition: {
          duration: 6.5,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'mirror',
        },
      };
}

export function getOverviewPulseAnimation(reduced: boolean): TargetAndTransition {
  return reduced
    ? { opacity: 1, scale: 1 }
    : {
        opacity: [0.5, 1, 0.5],
        scale: [1, 1.08, 1],
        transition: {
          duration: 2.8,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      };
}
