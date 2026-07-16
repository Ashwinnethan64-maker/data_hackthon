import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-police text-white shadow-lg shadow-police/25 hover:bg-police/90',
  secondary: 'bg-white/5 text-slate-100 hover:bg-white/10 border border-white/10',
  ghost: 'bg-transparent text-slate-200 hover:bg-white/5',
  danger: 'bg-danger text-white hover:bg-danger/90',
};

export function Button({ className, children, variant = 'primary', ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan/60 focus:ring-offset-2 focus:ring-offset-navy disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
