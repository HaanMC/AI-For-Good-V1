import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  ...props
}, ref) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-xl
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    active:scale-[0.98]
  `;

  const variants = {
    primary: `
      bg-primary-500 text-white
      hover:bg-primary-600
      focus:ring-primary-500/50
      shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30
    `,
    secondary: `
      bg-slate-100 dark:bg-slate-800
      text-slate-700 dark:text-slate-200
      hover:bg-slate-200 dark:hover:bg-slate-700
      focus:ring-slate-400/50
      border border-slate-200 dark:border-slate-700
    `,
    ghost: `
      bg-transparent
      text-slate-600 dark:text-slate-400
      hover:bg-slate-100 dark:hover:bg-slate-800
      hover:text-slate-900 dark:hover:text-slate-100
      focus:ring-slate-400/50
    `,
    danger: `
      bg-red-500 text-white
      hover:bg-red-600
      focus:ring-red-500/50
      shadow-lg shadow-red-500/25
    `,
    success: `
      bg-emerald-500 text-white
      hover:bg-emerald-600
      focus:ring-emerald-500/50
      shadow-lg shadow-emerald-500/25
    `,
    outline: `
      bg-transparent border-2 border-primary-500 text-primary-600
      hover:bg-primary-500 hover:text-white
      focus:ring-primary-500/50
    `
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg'
  };

  return (
    <button
      ref={ref}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
