import { COLORS, SHADOWS } from '@/lib/design-tokens';

export interface UseFocusStyleOptions {
  hasError?: boolean;
}

export function useFocusStyle(options: UseFocusStyleOptions = {}) {
  const { hasError = false } = options;

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = COLORS['trust-green'];
    e.currentTarget.style.boxShadow = SHADOWS.md;
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = hasError ? '#ef4444' : '#e5e7eb';
    e.currentTarget.style.boxShadow = hasError ? '' : SHADOWS.sm;
  };

  return { onFocus, onBlur };
}
