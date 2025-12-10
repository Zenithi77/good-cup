import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-500 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      default: 'bg-coffee-500 text-white hover:bg-coffee-600 active:bg-coffee-700',
      destructive: 'bg-red-500 text-white hover:bg-red-600',
      outline: 'border-2 border-coffee-500 text-coffee-600 hover:bg-coffee-500 hover:text-white',
      secondary: 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200',
      ghost: 'text-coffee-600 hover:bg-coffee-100 hover:text-coffee-700',
      link: 'text-coffee-500 underline-offset-4 hover:underline',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-lg px-8',
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
