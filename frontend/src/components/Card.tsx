import type { PropsWithChildren } from 'react';
import { cn } from '../utils/cn';

interface CardProps {
  className?: string;
}

export function Card({ className, children }: PropsWithChildren<CardProps>) {
  return <div className={cn('glass-panel rounded-2xl p-5', className)}>{children}</div>;
}
