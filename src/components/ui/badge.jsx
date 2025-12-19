import React from "react";

export const Badge = ({ children, variant, className }) => (
  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${className}`}>
    {children}
  </span>
);
