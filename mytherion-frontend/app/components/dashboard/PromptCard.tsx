"use client";

export default function PromptCard() {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/60 to-primary/60 border border-white/20 relative overflow-hidden shadow-2xl">
      {/* Decorative Background Icon */}
      <span className="material-symbols-outlined absolute -right-6 -top-6 text-white/5 text-[140px] rotate-12">
        history_edu
      </span>

      {/* Content */}
      <p className="text-[10px] font-bold text-secondary uppercase mb-3 tracking-widest relative z-10">
        Prompt of the day
      </p>
      <p className="text-2xl font-script text-white leading-relaxed relative z-10 drop-shadow-md">
        "What ancient secret lies beneath the roots of the world-tree, forgotten even by the
        gods?"
      </p>
    </div>
  );
}
