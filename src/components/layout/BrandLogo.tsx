import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  variant?: 'header' | 'footer' | 'chatbot' | 'mobileMenu';
  className?: string;
}

export function BrandLogo({ variant = 'header', className = '' }: BrandLogoProps) {
  // Dimensions based on the logo variant (maintaining 1:1 aspect ratio)
  const sizes = {
    header: { width: 50, height: 50 },
    mobileMenu: { width: 44, height: 44 },
    footer: { width: 68, height: 68 },
    chatbot: { width: 32, height: 32 },
  };

  const { width, height } = sizes[variant];

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <Image
        src="/brand/logomc.png"
        alt="Mr. Car Automotive Group"
        width={width}
        height={height}
        className="object-contain"
        priority={variant === 'header' || variant === 'mobileMenu'}
      />
    </div>
  );
}
export default BrandLogo;
