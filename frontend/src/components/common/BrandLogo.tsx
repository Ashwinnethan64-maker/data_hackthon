import React from 'react';

export interface BrandLogoProps {
  /**
   * Optional custom pixel size or explicit override for logo image.
   * If omitted, responsive breakpoints will strictly follow requirements.
   */
  size?: number;
  /**
   * Custom CSS classes for container element.
   */
  className?: string;
  /**
   * Custom CSS classes for logo image.
   */
  imgClassName?: string;
  /**
   * Whether to display branding text alongside or below the logo icon.
   * Default: false
   */
  showText?: boolean;
  /**
   * Specific layout variant:
   * - 'sidebar': 44px (desktop), 40px (tablet), 36px (mobile). Gap 14px. Vertically centered.
   * - 'header': 36px (desktop), 32px (tablet), 28px (mobile). Logo left of MISSION CONTROL / AI-CIOS.
   * - 'login': 64px (desktop), 56px (tablet), 48px (mobile). Centered logo stacked above text.
   * - 'iconOnly': Only displays icon image with responsive dimensions.
   */
  variant?: 'sidebar' | 'header' | 'login' | 'iconOnly';
}

export function BrandLogo({
  size,
  className = '',
  imgClassName = '',
  showText = false,
  variant = 'iconOnly',
}: BrandLogoProps) {
  // Compute responsive image classes according to Requirement 8:
  // Desktop: Sidebar 44px (h-[44px] w-[44px]), Header 36px (h-[36px] w-[36px]), Login 64px (h-[64px] w-[64px])
  // Tablet: Sidebar 40px (md:h-[40px] md:w-[40px]), Header 32px (md:h-[32px] md:w-[32px]), Login 56px (md:h-[56px] md:w-[56px])
  // Mobile: Sidebar 36px (h-[36px] w-[36px]), Header 28px (h-[28px] w-[28px]), Login 48px (h-[48px] w-[48px])
  // Increased sizing for maximum visibility and clarity across devices
  let responsiveClasses = '';

  if (size) {
    responsiveClasses = '';
  } else if (variant === 'sidebar') {
    responsiveClasses = 'h-[52px] w-[52px] md:h-[56px] md:w-[56px] lg:h-[60px] lg:w-[60px]';
  } else if (variant === 'header') {
    responsiveClasses = 'h-[44px] w-[44px] md:h-[48px] md:w-[48px] lg:h-[52px] lg:w-[52px]';
  } else if (variant === 'login') {
    responsiveClasses = 'h-[64px] w-[64px] md:h-[76px] md:w-[76px] lg:h-[88px] lg:w-[88px]';
  } else {
    responsiveClasses = 'h-[52px] w-[52px] md:h-[56px] md:w-[56px] lg:h-[60px] lg:w-[60px]';
  }

  const imageStyle = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  // Use the official AI-CIOS logo asset across all variants
  const imageSrc = '/ai-cios-logo.png';

  // Clean transparent logo image without artificial box wrapper
  const logoImage = (
    <img
      src={imageSrc}
      alt="AI-CIOS Logo"
      loading="eager"
      style={imageStyle}
      onError={(e) => {
        const target = e.currentTarget;
        if (target.src.startsWith(window.location.origin + '/')) {
          const filename = imageSrc.substring(1);
          if (!target.dataset.retried) {
            target.dataset.retried = 'true';
            target.src = './' + filename;
          }
        }
      }}
      className={`object-contain transition-all duration-300 hover:scale-105 shrink-0 ${responsiveClasses} ${imgClassName}`}
    />
  );

  if (!showText || variant === 'iconOnly') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {logoImage}
      </div>
    );
  }

  // Requirement 5: Sidebar Logo
  // Layout: [ LOGO ] (44px) Gap: 14px, Text vertically centered.
  if (variant === 'sidebar') {
    return (
      <div className={`flex items-center gap-[14px] ${className}`}>
        {logoImage}
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan/80 leading-none mb-1">
            AI-CIOS
          </span>
          <h1 className="text-base font-bold text-white leading-tight truncate">
            Crime Intelligence OS
          </h1>
          <p className="text-xs text-slate-400 font-medium leading-tight truncate mt-0.5">
            Karnataka State Police
          </p>
        </div>
      </div>
    );
  }

  // Requirement 6: Dashboard Header
  // Layout: [ LOGO ] (36px), MISSION CONTROL, AI-CIOS
  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {logoImage}
        <div className="flex flex-col justify-center">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-cyan/80 leading-none mb-0.5">
            MISSION CONTROL
          </span>
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-white leading-none">
            AI-CIOS
          </h2>
        </div>
      </div>
    );
  }

  // Requirement 7: Login Page Branding
  // Display crisp emblem icon cleanly above card headers without duplicating full title sentences
  if (variant === 'login') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="mb-2 shrink-0">{logoImage}</div>
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan/80">
          AI-CIOS
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {logoImage}
      <span className="font-bold text-white text-lg">AI-CIOS</span>
    </div>
  );
}
