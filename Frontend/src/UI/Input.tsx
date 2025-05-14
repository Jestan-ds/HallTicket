import React, { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id: string;
  fullWidth?: boolean;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, fullWidth = true, helperText, className = '', ...props }, ref) => {
    const baseStyles = 'rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500';
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
    
    const inputClasses = `${baseStyles} ${widthClass} ${errorClass} ${className}`;
    
    return (
      <div className={`mb-4 ${widthClass}`}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={inputClasses}
          {...props}
        />
        {(error || helperText) && (
          <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;