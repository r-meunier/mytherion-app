import { EntryType } from '@/app/types/codex';
import { entryTypeConfig } from './EntryTypeSelector';

interface EntryTypeBadgeProps {
  type: EntryType;
  title?: string;
  /** `chip`: a pill beside a name. `eyebrow`: a small label above the entry's name on its page. */
  variant?: 'chip' | 'eyebrow';
}

/** The entry's type, in the entry type's colour. */
export default function EntryTypeBadge({ type, title, variant = 'chip' }: EntryTypeBadgeProps) {
  const config = entryTypeConfig[type];
  if (variant === 'eyebrow') {
    return (
      <p title={title} className={`text-[11px] font-bold uppercase tracking-[0.2em] ${config.color}`}>
        {config.label}
      </p>
    );
  }
  return (
    <span title={title} className={`chip ${config.color}`}>
      {config.label}
    </span>
  );
}
