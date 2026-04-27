"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ColisorIconProps {
  className?: string;
  size?: number | string;
  animate?: boolean;
}

/**
 * ColisorIcon - Um ícone personalizado inspirado em detectores de partículas.
 * Design circular simétrico com caminhos convergentes e núcleo de colisão.
 */
export function ColisorIcon({ className, size = 24, animate = true }: ColisorIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
    >
      {/* 8 Spokes (Caminhos convergentes) */}
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />

      {/* Anel Externo com "Nós" (Detector) */}
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        strokeDasharray="1 3"
        className={cn(animate && "animate-[spin_20s_linear_infinite]")}
        style={{ transformOrigin: 'center' }}
      />

      {/* Anel Interno */}
      <circle cx="12" cy="12" r="4" className="opacity-80" />

      {/* Núcleo de Colisão (Spark) */}
      <path 
        d="M12 10v4M10 12h4" 
        className={cn("stroke-[2]", animate && "animate-pulse")} 
      />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}
