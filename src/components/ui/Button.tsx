import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';
    
    const variants = {
      default: 'bg-gradient-to-b from-coffee-500 to-coffee-600 text-white shadow-md shadow-coffee-500/25 hover:from-coffee-600 hover:to-coffee-700 hover:shadow-lg hover:shadow-coffee-500/30 active:bg-coffee-700',
      destructive: 'bg-red-500 text-white shadow-md shadow-red-500/20 hover:bg-red-600 hover:shadow-lg',
      outline: 'border-2 border-coffee-500 text-coffee-600 hover:bg-coffee-500 hover:text-white hover:shadow-md hover:shadow-coffee-500/20',
      secondary: 'bg-coffee-100 text-coffee-700 border border-coffee-200 hover:bg-coffee-200 hover:border-coffee-300',
      ghost: 'text-coffee-600 hover:bg-coffee-100 hover:text-coffee-700',
      link: 'text-coffee-500 underline-offset-4 hover:underline hover:text-coffee-600',
    };

    const sizes = {
      default: 'h-10 px-5 py-2',
      sm: 'h-9 rounded-lg px-3.5 text-sm',
      lg: 'h-12 rounded-xl px-8 text-base',
      icon: 'h-10 w-10',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
