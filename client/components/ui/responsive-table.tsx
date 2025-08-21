import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="min-w-full">
          <table className={cn("w-full divide-y divide-gray-200", className)}>
            {children}
          </table>
        </div>
      </div>
    </div>
  );
}

interface ResponsiveTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTableHeader({ children, className }: ResponsiveTableHeaderProps) {
  return (
    <thead className={cn("bg-gray-50", className)}>
      {children}
    </thead>
  );
}

interface ResponsiveTableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTableHeaderCell({ children, className }: ResponsiveTableHeaderCellProps) {
  return (
    <th className={cn(
      "px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap",
      className
    )}>
      {children}
    </th>
  );
}

interface ResponsiveTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTableBody({ children, className }: ResponsiveTableBodyProps) {
  return (
    <tbody className={cn("bg-white divide-y divide-gray-200", className)}>
      {children}
    </tbody>
  );
}

interface ResponsiveTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ResponsiveTableRow({ children, className, onClick }: ResponsiveTableRowProps) {
  return (
    <tr 
      className={cn(
        "hover:bg-gray-50 transition-colors cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface ResponsiveTableCellProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTableCell({ children, className }: ResponsiveTableCellProps) {
  return (
    <td className={cn(
      "px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm text-gray-900 whitespace-nowrap",
      className
    )}>
      {children}
    </td>
  );
}

// Mobile-friendly table for displaying data in cards on small screens
interface MobileTableCardProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileTableCard({ children, className }: MobileTableCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 p-4 space-y-3 shadow-sm",
      className
    )}>
      {children}
    </div>
  );
}

interface MobileTableRowItemProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function MobileTableRowItem({ label, children, className }: MobileTableRowItemProps) {
  return (
    <div className={cn("flex justify-between items-center text-sm", className)}>
      <span className="text-gray-600 font-medium">{label}:</span>
      <span className="text-gray-900">{children}</span>
    </div>
  );
}

// Custom hook for responsive table behavior
export function useResponsiveTable() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile };
}
