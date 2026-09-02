"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface ArcaneModuleCardProps {
  title: string;
  description: string;
  icon: string;
  href?: string;
  badge?: string;
  isPrimary?: boolean;
  disabled?: boolean;
}

export default function ArcaneModuleCard({
  title,
  description,
  icon,
  href,
  badge,
  isPrimary = false,
  disabled = false
}: ArcaneModuleCardProps) {
  const CardContent = (
    <>
      <div className="flex justify-between items-start mb-6">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
          isPrimary 
            ? "bg-primary/15 border border-primary/20 text-primary shadow-[0_0_20px_rgba(168,85,247,0.2)] group-hover:scale-105" 
            : "bg-white/5 border border-white/5 text-white/40"
        }`}>
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        
        {badge && (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isPrimary 
              ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_12px_rgba(168,85,247,0.3)]" 
              : "bg-white/5 text-white/30 border border-white/10"
          }`}>
            {badge}
          </span>
        )}
      </div>
      
      <div className="mt-auto">
        <h4 className={`text-lg font-bold mb-1.5 transition-colors ${
          disabled ? "text-white/20" : "text-white group-hover:text-primary"
        }`}>
          {title}
        </h4>
        <p className={`text-xs leading-relaxed font-medium transition-colors ${
          disabled ? "text-white/10" : "text-white/40"
        }`}>
          {description}
        </p>
      </div>
    </>
  );

  const baseStyles = `glass-panel p-6 rounded-2xl transition-all duration-300 flex flex-col min-h-[220px] relative overflow-hidden group shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${
    isPrimary 
      ? "hover:border-primary/50" 
      : "opacity-75 hover:opacity-100"
  } ${disabled ? "cursor-not-allowed opacity-40 hover:border-white/5" : "cursor-pointer"}`;

  if (disabled || !href) {
    return (
      <div className={baseStyles}>
        {CardContent}
      </div>
    );
  }

  return (
    <Link href={href} className={baseStyles}>
      {/* Subtle hover light leak */}
      {isPrimary && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-primary/10 transition-all duration-700 pointer-events-none" />
      )}
      {CardContent}
    </Link>
  );
}
