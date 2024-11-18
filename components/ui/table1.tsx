import React, { CSSProperties } from 'react';
import './table1.css'; // Nhập tệp CSS

interface TableProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number; // Thêm colSpan
  style?: CSSProperties; // Thêm style để hỗ trợ tùy chỉnh CSS trực tiếp
}

export const Table: React.FC<TableProps> = ({ children, className }) => (
  <table className={`min-w-full ${className}`}>{children}</table>
);

export const TableHead: React.FC<TableProps> = ({ children, className }) => (
  <thead className={`${className}`}>{children}</thead>
);

export const TableRow: React.FC<TableProps> = ({ children, className }) => (
  <tr className={`border-b hover:bg-gray-100 transition-colors duration-200 ${className}`}>{children}</tr>
);

export const TableCell: React.FC<TableProps> = ({ children, className, colSpan, style }) => (
  <td className={`border px-4 py-2 ${className}`} colSpan={colSpan} style={style}>{children}</td> // Sử dụng colSpan và style
);

export const TableBody: React.FC<TableProps> = ({ children, className }) => (
  <tbody className={className}>{children}</tbody>
);
