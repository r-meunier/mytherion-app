import { EntryType } from '@/app/types/codex';
import { entryTypeConfig } from './EntryTypeSelector';

interface EntryTypeBadgeProps {
  type: EntryType;
  title?: string;
}

/** The entry's type as a pill next to its name, on the entry page and in the edit form. */
export default function EntryTypeBadge({ type, title }: EntryTypeBadgeProps) {
  const config = entryTypeConfig[type];
  return (
    <span title={title} className={`chip ${config.color}`}>
      {config.label}
    </span>
  );
}
