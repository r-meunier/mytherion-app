'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: string;
  href?: string;
  badge?: string;
  badgeType?: 'primary' | 'secondary' | 'disabled';
  disabled?: boolean;
}

export default function ModuleCard({
  title,
  description,
  icon,
  href,
  badge,
  badgeType = 'secondary',
  disabled = false
}: ModuleCardProps) {
  const CardContent = (
    <div className={`glass rounded-2xl p-6 transition-all border-2 border-transparent h-full flex flex-col ${
      disabled 
        ? 'cursor-not-allowed opacity-80' 
        : 'cursor-pointer hover:bg-primary/5 hover:border-primary/30'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
          disabled ? 'bg-slate-800' : 'bg-primary/20'
        }`}>
          <span className={`material-symbols-outlined text-3xl ${
            disabled ? 'text-slate-400' : 'text-primary'
          }`}>
            {icon}
          </span>
        </div>
        {badge && (
          <span className={`text-micro-badge px-2.5 py-1 rounded border uppercase tracking-tighter ${
            badgeType === 'primary' 
              ? 'bg-primary text-white border-primary/50' 
              : badgeType === 'disabled'
              ? 'bg-white/5 text-slate-500 border-white/10'
              : 'bg-secondary/20 text-secondary border-secondary/40'
          }`}>
            {badge}
          </span>
        )}
      </div>
      <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );

  if (href && !disabled) {
    return <Link href={href} className="block h-full group">{CardContent}</Link>;
  }

  return <div className="h-full group">{CardContent}</div>;
}
