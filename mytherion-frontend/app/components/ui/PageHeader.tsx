import React, { ReactNode } from "react";
import Breadcrumbs, { Crumb } from "./Breadcrumbs";

export interface PageHeaderProps {
  /** Usually text; the entry page passes its click-to-edit name. */
  title: ReactNode;
  subtitle?: ReactNode;
  /** Shown inside a project; see docs/style-guide.md §3. */
  breadcrumbs?: Crumb[];
  /** Small pill next to the title, such as an entry's type. */
  badge?: ReactNode;
  /** Actions or a command bar, locked to the right on wide screens. */
  children?: ReactNode;
  className?: string;
}

/** The one page header: breadcrumbs, title, subtitle, actions. Every page uses it (docs/style-guide.md §3). */
export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  badge,
  children,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={className}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="font-display-lg text-2xl sm:text-3xl font-bold text-white text-glow tracking-tight">
              {title}
            </h1>
            {/* Centred on the title's lowercase letters rather than its capitals, which reads as centred. */}
            {badge && <span className="flex translate-y-0.5 sm:translate-y-[3px]">{badge}</span>}
          </div>
          {subtitle && (
            <div className="text-xs sm:text-sm text-white/60 max-w-2xl font-medium tracking-wide">
              {subtitle}
            </div>
          )}
        </div>

        {children && (
          <div className="w-full lg:w-auto max-w-xl lg:ml-auto shrink-0">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
