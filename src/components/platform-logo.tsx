"use client";

import { useState } from "react";

interface PlatformLogoProps {
  name: string;
  logoUrl: string;
  color: string;
  size?: number;
  className?: string;
}

export function PlatformLogo({ name, logoUrl, color, size = 28, className = "" }: PlatformLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg font-semibold text-white ${className}`}
        style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
      >
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={name}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
