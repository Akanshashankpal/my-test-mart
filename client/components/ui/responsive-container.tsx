import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveContainer({ children, className }: ResponsiveContainerProps) {
  return (
    <div className={cn(
      "w-full px-2 sm:px-4 py-2 sm:py-4 space-y-3 sm:space-y-6",
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

export function ResponsiveGrid({ children, cols = 2, className }: ResponsiveGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  };

  return (
    <div className={cn(
      "grid gap-3 sm:gap-4 lg:gap-6",
      gridClasses[cols],
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveCard({ children, className }: ResponsiveCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg border shadow-sm p-3 sm:p-4 lg:p-6",
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: "title" | "subtitle" | "body" | "caption";
  className?: string;
}

export function ResponsiveText({ children, variant = "body", className }: ResponsiveTextProps) {
  const variants = {
    title: "text-xl sm:text-2xl lg:text-3xl font-bold",
    subtitle: "text-lg sm:text-xl lg:text-2xl font-semibold", 
    body: "text-sm sm:text-base",
    caption: "text-xs sm:text-sm text-muted-foreground"
  };

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
}

interface ResponsiveButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveButtonGroup({ children, className }: ResponsiveButtonGroupProps) {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row gap-2 sm:gap-3",
      className
    )}>
      {children}
    </div>
  );
}

// Hook for responsive behavior
export function useResponsiveBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  React.useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet', 
    isDesktop: breakpoint === 'desktop',
    breakpoint
  };
}
