'use client';

import { useEffect, ReactNode } from 'react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: string;
  decorativeIcon?: string;
  children: ReactNode;
  maxWidth?: string;
  className?: string;
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  decorativeIcon,
  children,
  maxWidth = 'max-w-2xl',
  className = ''
}: BaseModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`} 
      onClick={handleOverlayClick}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-md cursor-pointer" 
      />
      
      {/* Modal Container */}
      <div 
        className={`relative w-full ${maxWidth} glass rounded-3xl p-8 overflow-hidden overflow-y-auto max-h-[95vh] modal-border-glow border-t-2 border-primary/50 border-b-2 border-secondary/50 shadow-2xl transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        } ${className}`}
      >
        {/* Decorative animated icon in background/top-right */}
        {decorativeIcon && (
          <div className="absolute top-6 right-6 text-secondary/40 animate-pulse pointer-events-none">
            <span className="material-symbols-outlined text-4xl select-none">
              {decorativeIcon}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 relative z-10">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary text-2xl">
                  {icon}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-3xl font-display font-extrabold text-white tracking-tight">
                {title}
              </h2>
              {description && (
                <p className="text-slate-400 mt-1 font-medium italic opacity-80">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
