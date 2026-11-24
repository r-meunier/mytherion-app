'use client';

import { KeyboardEvent, ReactNode, useId, useRef, useState } from 'react';

export interface EntryTab {
  id: string;
  label: string;
  content: ReactNode;
}

interface EntryTabsProps {
  tabs: EntryTab[];
}

/**
 * The tabs in the entry page's main column (docs/codex-entry-model.md §2), used when viewing and
 * when editing. Inactive panels stay mounted but hidden, so form fields keep their place in the DOM.
 */
export default function EntryTabs({ tabs }: EntryTabsProps) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const prefix = useId();
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});

  // Arrow keys move between tabs, as the WAI-ARIA tabs pattern expects.
  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    const offset = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (offset === 0) return;
    e.preventDefault();
    const next = tabs[(index + offset + tabs.length) % tabs.length];
    setActiveId(next.id);
    buttons.current[next.id]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Entry sections" className="flex gap-6 border-b border-white/10 mb-6">
        {tabs.map((tab, index) => {
          const selected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                buttons.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              id={`${prefix}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${prefix}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`pb-3 -mb-px border-b-2 text-sm font-semibold transition-colors ${
                selected ? 'border-primary text-white' : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${prefix}-panel-${tab.id}`}
          aria-labelledby={`${prefix}-tab-${tab.id}`}
          hidden={tab.id !== activeId}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
