import React from "react";

export const Button = ({ children, onClick, className, disabled, variant, size }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded px-2 py-1 text-xs ${className}`}
  >
    {children}
  </button>
);
