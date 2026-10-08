import { ContextRole, EntryTemplate, EntryType, TemplateLevel } from '@/app/types/codex';
import { defaultTemplate, detailsFromTemplate, hasDetailValues, normalizeContent } from './entryContent';

const blank: EntryTemplate = { id: 'item-blank', entryType: EntryType.ITEM, level: TemplateLevel.BLANK, name: 'Blank', details: [] };
const basic: EntryTemplate = {
  id: 'item-basic',
  entryType: EntryType.ITEM,
  level: TemplateLevel.BASIC,
  name: 'Basic',
  details: [{ label: 'Origin', hint: 'Who made it?', role: ContextRole.BACKSTORY }, { label: 'Kind' }],
};

describe('entryContent utils', () => {
  it('copies template details with fresh unique ids, empty values, hints and roles', () => {
    const details = detailsFromTemplate(basic);

    expect(details.map((d) => d.label)).toEqual(['Origin', 'Kind']);
    expect(details[0]).toMatchObject({ value: null, hint: 'Who made it?', role: ContextRole.BACKSTORY });
    expect(details[1]).toMatchObject({ hint: null, role: null });
    expect(new Set(details.map((d) => d.id)).size).toBe(2);
    expect(details[0].id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('defaults to Basic, else the first template', () => {
    expect(defaultTemplate([blank, basic])).toBe(basic);
    expect(defaultTemplate([blank])).toBe(blank);
    expect(defaultTemplate([])).toBeUndefined();
  });

  it('only counts non-blank values as typed', () => {
    expect(hasDetailValues([{ id: '1', label: 'A', value: '   ' }])).toBe(false);
    expect(hasDetailValues([{ id: '1', label: 'A', value: 'x' }])).toBe(true);
  });

  it('reads current content, JSON strings, and turns anything else into empty content', () => {
    const details = [{ id: '1', label: 'A', value: 'x' }];
    expect(normalizeContent({ templateId: 't', details })).toEqual({ templateId: 't', details });
    expect(normalizeContent(JSON.stringify({ details }))).toEqual({ templateId: null, details });
    // content saved before MYT-86 had sections instead of details
    expect(normalizeContent({ sections: [{ type: 'BIO' }] })).toEqual({ templateId: null, details: [] });
    expect(normalizeContent(null)).toEqual({ templateId: null, details: [] });
    expect(normalizeContent('not json')).toEqual({ templateId: null, details: [] });
  });
});
