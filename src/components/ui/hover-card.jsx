import React from "react";

export const HoverCard = ({ children, openDelay }) => <div className="relative group">{children}</div>;
export const HoverCardTrigger = ({ children, asChild }) => <>{children}</>;
export const HoverCardContent = ({ children, className }) => (
  <div className={`absolute z-50 hidden group-hover:block top-full mt-2 ${className}`}>{children}</div>
);
