"use client";

import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  subtitleColor?: string;
  icon: string;
  badges?: ReactNode;
  progressBar?: {
    value: number;
    label: string;
  };
}

export default function StatCard({
  title,
  value,
  subtitle,
  subtitleColor = "text-emerald-400",
  icon,
  badges,
  progressBar,
}: StatCardProps) {
  return (
    <div className="glass p-6 rounded-2xl relative overflow-hidden group hover:!border-primary/50 transition-all cursor-pointer">
      {/* Background Icon Watermark */}
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <span className="material-symbols-outlined" style={{ fontSize: '100px' }}>{icon}</span>
      </div>

      {/* Content */}
      <p className="text-slate-400 text-sm font-medium relative z-10">{title}</p>
      <div className="flex items-baseline space-x-2 mt-2 relative z-10">
        <h3 className="text-4xl font-display font-bold text-white">{value}</h3>
        {subtitle && (
          <span className={`${subtitleColor} text-xs font-bold`}>{subtitle}</span>
        )}
      </div>

      {/* Optional Badges */}
      {badges && <div className="mt-4 relative z-10">{badges}</div>}

      {/* Optional Progress Bar */}
      {progressBar && (
        <div className="mt-4 flex items-center space-x-2 relative z-10">
          <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary shadow-[0_0_8px_rgba(251,191,36,0.5)]"
              style={{ width: `${progressBar.value}%` }}
            ></div>
          </div>
          <span className="text-[10px] font-bold text-secondary uppercase">
            {progressBar.label}
          </span>
        </div>
      )}
    </div>
  );
}
