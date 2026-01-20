"use client";

const tools = [
  { id: "name-gen", icon: "casino", label: "Name Gen" },
  { id: "calendar", icon: "calendar_month", label: "Calendar" },
  { id: "lore-ai", icon: "psychology", label: "Lore AI" },
  { id: "export", icon: "share", label: "Export" },
];

export default function ArcaneTools() {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-display font-bold text-white flex items-center">
        <span className="material-symbols-outlined mr-2 text-primary">auto_fix_high</span>
        Arcane Tools
      </h4>

      <div className="grid grid-cols-2 gap-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className="p-4 glass rounded-xl hover:!bg-primary hover:text-white transition-all text-left flex flex-col items-start group"
          >
            <span className="material-symbols-outlined text-primary group-hover:text-white mb-2 transition-colors">
              {tool.icon}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

