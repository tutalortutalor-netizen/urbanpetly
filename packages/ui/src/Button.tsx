import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from './cn.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Renders a busy state and blocks further clicks. */
  loading?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'bg-surface text-ink border border-border hover:bg-surface-muted',
  ghost: 'bg-transparent text-brand-700 hover:bg-brand-50',
};

/**
 * Base button. Focus ring and disabled handling live here so no app has to
 * rebuild them (docs/05-ux-spec.md: WCAG 2.1 AA, visible focus, keyboard support).
 */
export function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-control',
        'px-4 py-2 text-sm font-medium transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
