import React, { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  children,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 ${className}`}
    >
      <div>
        <h1 className="font-display-lg text-2xl sm:text-3xl font-bold text-white mb-1 text-glow tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <div className="text-xs sm:text-sm text-white/60 max-w-lg font-medium tracking-wide">
            {subtitle}
          </div>
        )}
      </div>

      {children && (
        <div className="w-full lg:w-auto max-w-xl lg:ml-auto">
          {children}
        </div>
      )}
    </div>
  );
}
