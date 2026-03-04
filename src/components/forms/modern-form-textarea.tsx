'use client';

import { motion } from 'framer-motion';
import { COLORS, SHADOWS } from '@/lib/design-tokens';
import { useFocusStyle } from '@/lib/hooks/useFocusStyle';

interface ModernFormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  charLimit?: number;
}

export function ModernFormTextarea({
  label,
  error,
  helperText,
  charLimit,
  className = '',
  value = '',
  ...props
}: ModernFormTextareaProps) {
  const charCount = typeof value === 'string' ? value.length : 0;
  const fieldId = (props as any).id || props.name || 'form-textarea';
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

      <textarea
        id={fieldId}
        className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-all resize-none ${
          error ? 'border-red-500' : 'border-gray-200'
        } ${className}`}
        style={{
          backgroundColor: COLORS['bg-light'],
          color: COLORS['text-dark'],
          borderColor: error ? '#ef4444' : '#e5e7eb',
          boxShadow: error ? undefined : SHADOWS.sm,
            minHeight: '120px',
        }}
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={errorId || helperId}
        {...props}
      />

      <div className="flex justify-between mt-2">
        <div>
          {error && (
            <motion.p
              id={errorId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-500"
              role="alert"
            >
              {error}
            </motion.p>
          )}

          {helperText && !error && (
            <p
              id={helperId}
              className="text-sm"
              style={{ color: COLORS['text-muted'] }}
            >
              {helperText}
            </p>
          )}
        </div>

        {charLimit && (
          <p
            className="text-sm"
            style={{
              color: charCount > charLimit * 0.9 ? '#ef4444' : COLORS['text-muted'],
            }}
          >
            {charCount}/{charLimit}
          </p>
        )}
      </div>
    </motion.div>
  );
}
