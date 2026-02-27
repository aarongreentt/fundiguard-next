'use client';

import { motion } from 'framer-motion';
import { COLORS, SHADOWS, BORDER_RADIUS } from '@/lib/design-tokens';

interface ModernFormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export function ModernFormInput({
  label,
  error,
  icon,
  helperText,
  className = '',
  ...props
}: ModernFormInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      className="w-full"
    >
      {label && (
        <label
          className="block text-sm font-bold mb-2"
          style={{ color: COLORS['text-dark'] }}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>}

        <input
          className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-all focus:bg-white ${
            icon ? 'pl-12' : ''
          } ${error ? 'border-red-500' : 'border-gray-200'} ${className}`}
          style={{
            backgroundColor: COLORS['bg-light'],
            color: COLORS['text-dark'],
            borderColor: error ? '#ef4444' : '#e5e7eb',
            boxShadow: error ? undefined : SHADOWS.sm,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = COLORS['trust-green'];
            e.currentTarget.style.boxShadow = SHADOWS.md;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#ef4444' : '#e5e7eb';
            e.currentTarget.style.boxShadow = error ? '' : SHADOWS.sm;
          }}
          {...props}
        />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-500 mt-1"
        >
          {error}
        </motion.p>
      )}

      {helperText && !error && (
        <p
          className="text-sm mt-1"
          style={{ color: COLORS['text-muted'] }}
        >
          {helperText}
        </p>
      )}
    </motion.div>
  );
}
