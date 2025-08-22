import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ResponsiveContainer provides a consistent layout container with proper mobile spacing,
 * safe areas, and breakpoint-specific behaviors.
 */
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Whether to include safe area padding for mobile devices
   */
  includeSafeArea?: boolean;
  /**
   * Maximum width constraint
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
  /**
   * Padding variant for different screen sizes
   */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'responsive';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  full: 'max-w-full'
};

const paddingClasses = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  responsive: 'p-2 sm:p-4 lg:p-6'
};

export function ResponsiveContainer({
  children,
  className,
  includeSafeArea = true,
  maxWidth = '6xl',
  padding = 'responsive'
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        includeSafeArea && 'safe-area-inset-top safe-area-inset-bottom',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * ResponsiveGrid provides a flexible grid layout that adapts to different screen sizes
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Number of columns for different breakpoints
   */
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /**
   * Gap between grid items
   */
  gap?: 'sm' | 'md' | 'lg' | 'responsive';
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  responsive: 'gap-3 sm:gap-4 lg:gap-6'
};

export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 'responsive'
}: ResponsiveGridProps) {
  const gridCols = cn(
    'grid',
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    gapClasses[gap]
  );

  return (
    <div className={cn(gridCols, className)}>
      {children}
    </div>
  );
}

/**
 * MobileCard provides a mobile-optimized card component with proper touch targets
 */
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Whether the card is clickable (affects styling and accessibility)
   */
  clickable?: boolean;
  /**
   * Click handler for interactive cards
   */
  onClick?: () => void;
  /**
   * Card variant
   */
  variant?: 'default' | 'elevated' | 'outlined';
}

const cardVariants = {
  default: 'bg-white border border-gray-200 shadow-sm',
  elevated: 'bg-white border border-gray-200 shadow-lg',
  outlined: 'bg-white border-2 border-gray-300'
};

export function MobileCard({
  children,
  className,
  clickable = false,
  onClick,
  variant = 'default'
}: MobileCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden transition-all duration-200',
        cardVariants[variant],
        clickable && 'cursor-pointer hover:shadow-md active:scale-98 tap-target',
        'mobile-card',
        className
      )}
      onClick={onClick}
    >
      <div className="p-3 sm:p-4 lg:p-6">
        {children}
      </div>
    </div>
  );
}

/**
 * ResponsiveText provides text scaling based on screen size
 */
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Text size for different breakpoints
   */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  /**
   * Whether to use mobile-optimized sizing
   */
  mobileOptimized?: boolean;
}

const textSizes = {
  xs: 'text-xs sm:text-sm',
  sm: 'text-sm sm:text-base',
  base: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl',
  xl: 'text-xl sm:text-2xl',
  '2xl': 'text-2xl sm:text-3xl',
  '3xl': 'text-3xl sm:text-4xl'
};

const mobileTextSizes = {
  xs: 'text-mobile-xs sm:text-xs',
  sm: 'text-mobile-sm sm:text-sm',
  base: 'text-mobile-base sm:text-base',
  lg: 'text-mobile-lg sm:text-lg',
  xl: 'text-mobile-xl sm:text-xl',
  '2xl': 'text-mobile-xl sm:text-2xl',
  '3xl': 'text-mobile-xl sm:text-3xl'
};

export function ResponsiveText({
  children,
  className,
  size = 'base',
  mobileOptimized = false
}: ResponsiveTextProps) {
  const sizeClasses = mobileOptimized ? mobileTextSizes[size] : textSizes[size];
  
  return (
    <span className={cn(sizeClasses, className)}>
      {children}
    </span>
  );
}

/**
 * MobileFriendlyButton provides touch-optimized button styling
 */
interface MobileFriendlyButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const buttonVariants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500'
};

const buttonSizes = {
  sm: 'px-3 py-2 text-sm min-h-[40px]',
  md: 'px-4 py-2.5 text-sm min-h-[44px]',
  lg: 'px-6 py-3 text-base min-h-[48px]',
  icon: 'p-2.5 min-h-[44px] min-w-[44px]'
};

export function MobileFriendlyButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button'
}: MobileFriendlyButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'active:scale-95 tap-target',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current',
        buttonVariants[variant],
        buttonSizes[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {children}
    </button>
  );
}

/**
 * ResponsiveDialog provides mobile-optimized modal dialogs
 */
interface ResponsiveDialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  className?: string;
  /**
   * Whether to use full screen on mobile
   */
  fullScreenOnMobile?: boolean;
}

export function ResponsiveDialog({
  children,
  isOpen,
  onClose,
  title,
  description,
  className,
  fullScreenOnMobile = false
}: ResponsiveDialogProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div
        className={cn(
          'relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4',
          'max-h-[90vh] overflow-y-auto mobile-scroll',
          fullScreenOnMobile && 'sm:max-w-md sm:mx-4 sm:max-h-[90vh] max-w-full mx-0 h-full sm:h-auto sm:rounded-lg rounded-none',
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            {title && (
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-gray-500">
                {description}
              </p>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="px-4 sm:px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for detecting mobile breakpoint
 */
export function useMobileBreakpoint() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return { isMobile, isTablet, isDesktop };
}

/**
 * Hook for safe area insets (useful for iOS devices with notches)
 */
export function useSafeArea() {
  const [safeArea, setSafeArea] = React.useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  React.useEffect(() => {
    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
        bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
        right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0')
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);
    
    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return safeArea;
}

/**
 * Touch gesture hook for mobile interactions
 */
export function useTouchGestures() {
  const [touchStart, setTouchStart] = React.useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = React.useState({ x: 0, y: 0 });

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchEnd = () => {
    if (!touchStart.x || !touchEnd.x) return;
    
    const distance = touchStart.x - touchEnd.x;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    return { isLeftSwipe, isRightSwipe, distance };
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}

/**
 * Responsive form input component with mobile optimizations
 */
interface ResponsiveInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helper?: string;
  className?: string;
}

export function ResponsiveInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  error,
  helper,
  className
}: ResponsiveInputProps) {
  return (
    <div className="mobile-form-group">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={cn(
          'mobile-input w-full px-3 py-2.5 border border-gray-300 rounded-lg',
          'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:bg-gray-50 disabled:text-gray-500',
          'transition-colors duration-200',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
}

/**
 * Mobile navigation bar component
 */
interface MobileNavBarProps {
  items: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
    badge?: number;
  }>;
  activeItem?: string;
  className?: string;
}

export function MobileNavBar({ items, activeItem, className }: MobileNavBarProps) {
  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50',
      'lg:hidden', // Hide on desktop
      className
    )}>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5">
        {items.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className={cn(
              'mobile-nav-item relative',
              activeItem === item.id
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            )}
            onClick={item.onClick}
          >
            <div className="relative">
              {item.icon}
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-xs font-medium truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </nav>
  );
}

// Export utility classes for consistent mobile styling
export const mobileStyles = {
  container: 'p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto',
  card: 'bg-white rounded-lg border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6',
  input: 'mobile-input w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',
  button: 'tap-target min-h-[44px] px-4 py-2 rounded-lg font-medium transition-all duration-200',
  text: {
    heading: 'text-xl sm:text-2xl lg:text-3xl font-bold',
    subheading: 'text-lg sm:text-xl font-semibold',
    body: 'text-sm sm:text-base',
    caption: 'text-xs sm:text-sm text-gray-600'
  },
  spacing: {
    xs: 'space-y-2 sm:space-y-3',
    sm: 'space-y-3 sm:space-y-4',
    md: 'space-y-4 sm:space-y-6',
    lg: 'space-y-6 sm:space-y-8'
  },
  grid: {
    responsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6',
    adaptive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'
  }
};

// Mobile responsiveness best practices documentation
export const mobileGuide = {
  touchTargets: {
    minimum: '44px', // Apple and Google guidelines
    recommended: '48px',
    description: 'All interactive elements should meet minimum touch target sizes'
  },
  
  typography: {
    minimumFontSize: '16px', // Prevents zoom on iOS
    readableLineHeight: '1.5',
    description: 'Use 16px minimum font size to prevent mobile zoom'
  },
  
  spacing: {
    mobilePadding: '12px-16px',
    tabletPadding: '16px-24px',
    desktopPadding: '24px-32px',
    description: 'Progressive spacing based on screen size'
  },
  
  breakpoints: {
    mobile: '< 768px',
    tablet: '768px - 1024px',
    desktop: '> 1024px',
    description: 'Standard breakpoints used throughout the application'
  },
  
  performance: {
    lazyLoading: 'Use for images and heavy components',
    virtualScrolling: 'For long lists on mobile',
    codesplitting: 'Route-based splitting for faster initial load',
    description: 'Optimize for mobile performance'
  }
};
