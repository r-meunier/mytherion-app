import { SaveState } from '@/app/hooks/useEntryAutosave';

interface SaveStatusProps {
  state: SaveState;
  error?: string | null;
}

/**
 * "Saving… / Saved / Not saved" next to the entry page's actions. It keeps its width when empty,
 * so the buttons beside it don't move as the state changes.
 */
export default function SaveStatus({ state, error }: SaveStatusProps) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center justify-end gap-1.5 min-w-[6.5rem] text-xs font-semibold">
      {state === 'saving' && (
        <>
          <span className="animate-spin rounded-full h-3 w-3 border-t border-b border-primary" aria-hidden="true" />
          <span className="text-white/50">Saving…</span>
        </>
      )}
      {state === 'saved' && (
        <>
          <span className="material-symbols-outlined text-[16px] text-emerald-400" aria-hidden="true">check</span>
          <span className="text-white/50">Saved</span>
        </>
      )}
      {state === 'error' && (
        <span className="text-rose-400" title={error ?? undefined}>
          Not saved
        </span>
      )}
    </span>
  );
}
