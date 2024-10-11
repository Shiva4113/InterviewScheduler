import React from 'react';

export function Button({ children, variant, className, ...props }) {
  const baseClass = "px-4 py-2 rounded";
  const variantClass = variant === "ghost" ? "bg-transparent hover:bg-gray-100" : "bg-blue-500 text-white hover:bg-blue-600";
  
  return (
    <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}