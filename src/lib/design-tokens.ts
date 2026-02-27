/**
 * FundiGuard Design System
 * Colors, spacing, typography, animations
 */

export const COLORS = {
  // Primary
  'trust-green': '#00C853',
  'trust-green-dark': '#00B848',
  'trust-green-light': '#4CFF8A',
  
  // Secondary
  'energy-orange': '#FF6D00',
  'energy-orange-dark': '#E56D00',
  'energy-orange-light': '#FFB366',
  
  // Neutrals
  'bg-light': '#F8FAFC',
  'bg-white': '#FFFFFF',
  'text-dark': '#1F2937',
  'text-muted': '#6B7280',
  'border-light': '#E5E7EB',
  
  // Status
  'success': '#00C853',
  'warning': '#F59E0B',
  'danger': '#EF4444',
  'info': '#3B82F6',
};

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 4px 12px rgba(0, 0, 0, 0.08)',
  hover: '0 10px 25px rgba(0, 0, 0, 0.12)',
};

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
};

export const BORDER_RADIUS = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
};

export const ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  },
  slideUpIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
  },
  containerVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  itemVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  },
};
