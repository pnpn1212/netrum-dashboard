import React from "react";

export const Table = ({ children }) => <table className="w-full">{children}</table>;
export const TableHeader = ({ children }) => <thead>{children}</thead>;
export const TableBody = ({ children }) => <tbody>{children}</tbody>;
export const TableRow = ({ children, className }) => <tr className={className}>{children}</tr>;
export const TableHead = ({ children, className }) => <th className={className}>{children}</th>;
export const TableCell = ({ children, colSpan, className }) => <td colSpan={colSpan} className={className}>{children}</td>;
