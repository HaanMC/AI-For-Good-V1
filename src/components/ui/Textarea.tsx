import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'filled';
  textareaSize?: 'sm' | 'md' | 'lg';
  autoResize?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className = '',
  label,
  error,
  hint,
  variant = 'default',
  textareaSize = 'md',
  autoResize = false,
  id,
  onChange,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
    onChange?.(e);
  };

  const baseStyles = `
    w-full rounded-xl transition-all duration-200 resize-none
    placeholder:text-stone-400 dark:placeholder:text-stone-500
    focus:outline-none focus:ring-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    default: `
      bg-white dark:bg-stone-800
      border border-stone-300 dark:border-stone-600
      text-stone-900 dark:text-stone-100
      hover:border-stone-400 dark:hover:border-stone-500
      focus:border-accent focus:ring-accent/20
    `,
    filled: `
      bg-stone-100 dark:bg-stone-900
      border-2 border-transparent
      text-stone-900 dark:text-stone-100
      hover:bg-stone-200 dark:hover:bg-stone-800
      focus:border-accent focus:ring-accent/20 focus:bg-white dark:focus:bg-stone-800
    `
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[80px]',
    md: 'px-4 py-3 text-base min-h-[120px]',
    lg: 'px-5 py-4 text-lg min-h-[160px]'
  };

  const isRequired = props.required || props['aria-required'] === 'true';
  const errorId = error ? `${textareaId}-error` : undefined;
  const hintId = hint && !error ? `${textareaId}-hint` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2"
        >
          {label}
          {isRequired && (
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          )}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[textareaSize]}
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId || hintId || undefined}
        onChange={handleChange}
        {...props}
      />
      {error && (
        <p
          id={errorId}
          className="mt-1.5 text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {hint && !error && (
        <p
          id={hintId}
          className="mt-1.5 text-sm text-stone-500 dark:text-stone-400"
        >
          {hint}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
