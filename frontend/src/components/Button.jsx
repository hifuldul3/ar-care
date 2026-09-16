import React from 'react';

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const baseStyle = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-sky-600 hover:bg-sky-500 text-white shadow-md active:scale-95',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 active:scale-95',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white active:scale-95',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95',
    outline: 'border border-slate-600 text-slate-200 hover:bg-slate-800'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
