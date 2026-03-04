'use client';

import { motion } from 'framer-motion';
import { COLORS, SHADOWS, BORDER_RADIUS } from '@/lib/design-tokens';
import { useFocusStyle } from '@/lib/hooks/useFocusStyle';

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
  id,
  ...props
}: ModernFormInputProps) {
  const fieldId = id || props.name || 'form-input';
  const errorId = error ? `${fieldId}-error` : undefined;
  const helperId = helperText ? `${fieldId}-helper` : undefined;
  const { onFocus, onBlur } = useFocusStyle({ hasError: !!error });

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
          htmlFor={fieldId}
          className="block text-sm font-bold mb-2"
          style={{ color: COLORS['text-dark'] }}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>}

        <input
          id={fieldId}
          className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-all focus:bg-white ${
            icon ? 'pl-12' : ''
          } ${error ? 'border-red-500' : 'border-gray-200'} ${className}`}
          style={{
            backgroundColor: COLORS['bg-light'],
            color: COLORS['text-dark'],
            borderColor: error ? '#ef4444' : '#e5e7eb',
            boxShadow: error ? undefined : SHADOWS.sm,
            pointerEvents: 'auto',
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={errorId || helperId}
          {...props}
        />
      </div>

      {error && (
        <motion.p
          id={errorId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-500 mt-1"
          role="alert"
        >
          {error}
        </motion.p>
      )}

      {helperText && !error && (
        <p
          id={helperId}
          className="text-sm mt-1"
          style={{ color: COLORS['text-muted'] }}
        >
          {helperText}
        </p>
      )}
    </motion.div>
  );
}
