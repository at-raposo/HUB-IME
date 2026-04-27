"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface IMELogoProps {
  className?: string;
  size?: number | string;
}

/**
 * IMELogo - Logotipo Oficial do IME USP.
 * Renders the SVG logo from the public directory.
 */
export function IMELogo({ className, size = 42 }: IMELogoProps) {
  return (
    <div className={cn("relative shrink-0 flex items-center justify-center", className)} style={{ width: size, height: size }}>
       <img src="/ime-logo.svg" alt="IME USP Logo" className="w-full h-full object-contain" />
    </div>
  );
}
