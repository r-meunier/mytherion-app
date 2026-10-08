import { EntryContent, EntryDetail, EntryTemplate, TemplateLevel } from '@/app/types/codex';

/** A random id for a new detail. Falls back to getRandomValues where randomUUID is missing. */
export function newDetailId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Copy a template's details into new entry details: fresh ids, empty values, hints and roles kept. */
export function detailsFromTemplate(template: EntryTemplate): EntryDetail[] {
  return template.details.map((d) => ({
    id: newDetailId(),
    label: d.label,
    value: null,
    hint: d.hint ?? null,
    role: d.role ?? null,
  }));
}

/** The template a new entry starts from: Basic when available, otherwise the first (Blank). */
export function defaultTemplate(templates: EntryTemplate[]): EntryTemplate | undefined {
  return templates.find((t) => t.level === TemplateLevel.BASIC) ?? templates[0];
}

/** True when the author has typed something worth confirming before it is replaced. */
export function hasDetailValues(details: EntryDetail[]): boolean {
  return details.some((d) => (d.value ?? '').trim() !== '');
}

// Handles content saved as a string or before MYT-86 (sections): anything unreadable becomes empty.
export const normalizeContent = (meta: unknown): EntryContent => {
  let parsed: unknown = meta;
  if (typeof meta === 'string') {
    try {
      parsed = JSON.parse(meta);
    } catch {
      parsed = null;
    }
  }
  if (parsed && typeof parsed === 'object' && Array.isArray((parsed as EntryContent).details)) {
    const content = parsed as EntryContent;
    return { templateId: content.templateId ?? null, details: content.details };
  }
  return { templateId: null, details: [] };
};
