import type { PropsWithChildren } from 'react';
import { cn } from '../utils/cn';

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-white/10 text-slate-200',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  danger: 'bg-danger/20 text-danger',
  info: 'bg-cyan/20 text-cyan',
};

export function Badge({ children, variant = 'neutral', className }: PropsWithChildren<BadgeProps>) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', variantClasses[variant], className)}>
      {children}
    </span>
  );
}
