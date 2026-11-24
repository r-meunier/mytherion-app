import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import EntryForm from './EntryForm';
import { codexService } from '@/app/services/codexService';
import { ContextRole, EntryTemplate, EntryType, TemplateLevel } from '@/app/types/codex';

jest.mock('./EntryTypeSelector', () => {
  const MockTypeSelector = ({ onChange }: { onChange: (type: string) => void }) => (
    <button type="button" onClick={() => onChange('LOCATION')}>
      Switch to Location
    </button>
  );
  MockTypeSelector.displayName = 'MockTypeSelector';
  return { __esModule: true, default: MockTypeSelector, entryTypeConfig: {} };
});
jest.mock('@/app/services/codexService', () => ({
  codexService: { getTemplates: jest.fn() },
}));

const templates: EntryTemplate[] = [
  { id: 'character-blank', entryType: EntryType.CHARACTER, level: TemplateLevel.BLANK, name: 'Blank', details: [] },
  {
    id: 'character-basic',
    entryType: EntryType.CHARACTER,
    level: TemplateLevel.BASIC,
    name: 'Basic',
    details: [
      { label: 'Story role', hint: 'Protagonist, antagonist…', role: ContextRole.IDENTITY },
      { label: 'Voice', hint: 'How do they talk?', role: ContextRole.VOICE },
    ],
  },
];

describe('EntryForm - templates and details', () => {
  const onSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (codexService.getTemplates as jest.Mock).mockResolvedValue(templates);
  });

  const renderCreateForm = () =>
    render(<EntryForm projectId="proj-1" defaultType={EntryType.CHARACTER} onSubmit={onSubmit} onCancel={jest.fn()} />);

  it('starts a new entry from the Basic template, with hints as placeholders', async () => {
    renderCreateForm();

    const voice = await screen.findByRole('textbox', { name: 'Voice' });
    expect(voice).toHaveAttribute('placeholder', 'How do they talk?');
    expect(screen.getByRole('textbox', { name: 'Story role' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Basic/ })).toHaveAttribute('aria-checked', 'true');
    expect(codexService.getTemplates).toHaveBeenCalledWith(EntryType.CHARACTER);
  });

  it('asks before switching templates once details have text, and keeps them if declined', async () => {
    const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
    renderCreateForm();

    fireEvent.change(await screen.findByRole('textbox', { name: 'Voice' }), { target: { value: 'Clipped' } });
    fireEvent.click(screen.getByRole('radio', { name: /Blank/ }));

    expect(confirm).toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Voice' })).toHaveValue('Clipped');
    confirm.mockRestore();
  });

  it('switches to Blank without asking when nothing was typed', async () => {
    const confirm = jest.spyOn(window, 'confirm');
    renderCreateForm();

    await screen.findByRole('textbox', { name: 'Voice' });
    fireEvent.click(screen.getByRole('radio', { name: /Blank/ }));

    expect(confirm).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox', { name: 'Voice' })).not.toBeInTheDocument();
    confirm.mockRestore();
  });

  it('submits the template id, details and aliases, dropping empty added rows', async () => {
    renderCreateForm();

    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Mira Vell' } });
    fireEvent.change(await screen.findByRole('textbox', { name: 'Voice' }), { target: { value: 'Clipped, dry humour' } });
    fireEvent.click(screen.getByRole('button', { name: /Add detail/ }));

    const aliasInput = screen.getByPlaceholderText(/Other names/);
    fireEvent.change(aliasInput, { target: { value: 'The Cartographer' } });
    fireEvent.keyDown(aliasInput, { key: 'Enter' });

    fireEvent.click(screen.getByRole('button', { name: 'Create Entry' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const [data] = onSubmit.mock.calls[0];
    expect(data.aliases).toEqual(['The Cartographer']);
    expect(data.content.templateId).toBe('character-basic');
    expect(data.content.details.map((d: { label: string }) => d.label)).toEqual(['Story role', 'Voice']);
    expect(data.content.details[1]).toMatchObject({ value: 'Clipped, dry humour', role: ContextRole.VOICE });
  });

  it('blocks submit when a detail has text but no label', async () => {
    renderCreateForm();

    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Mira Vell' } });
    fireEvent.change(await screen.findByRole('textbox', { name: 'Story role' }), { target: { value: 'Protagonist' } });
    fireEvent.change(screen.getAllByRole('textbox', { name: 'Detail label' })[0], { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Entry' }));

    expect(await screen.findByText('Every detail with text needs a label.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('locks the details while templates load, so nothing typed is replaced when they arrive', async () => {
    let resolveTemplates: (list: EntryTemplate[]) => void = () => {};
    (codexService.getTemplates as jest.Mock).mockReturnValue(new Promise((resolve) => (resolveTemplates = resolve)));
    renderCreateForm();

    expect(screen.getByRole('button', { name: /Add detail/ })).toBeDisabled();

    await act(async () => resolveTemplates(templates));

    expect(screen.getByRole('button', { name: /Add detail/ })).toBeEnabled();
    expect(screen.getByRole('textbox', { name: 'Voice' })).toBeEnabled();
  });

  it('drops the previous type\'s template when the new type\'s templates fail to load', async () => {
    (codexService.getTemplates as jest.Mock).mockImplementation((type: EntryType) =>
      type === EntryType.LOCATION ? Promise.reject(new Error('offline')) : Promise.resolve(templates)
    );
    renderCreateForm();
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'The Drowned Quarter' } });
    await screen.findByRole('textbox', { name: 'Voice' });

    fireEvent.click(screen.getByRole('button', { name: 'Switch to Location' }));

    expect(await screen.findByText(/Templates could not be loaded/)).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Voice' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create Entry' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const [data] = onSubmit.mock.calls[0];
    expect(data.type).toBe(EntryType.LOCATION);
    expect(data.content).toEqual({ templateId: null, details: [] });
  });

  it('fetches every type\'s templates once, so switching type swaps the details without locking them', async () => {
    const locationTemplates: EntryTemplate[] = [
      { id: 'location-blank', entryType: EntryType.LOCATION, level: TemplateLevel.BLANK, name: 'Blank', details: [] },
      { id: 'location-basic', entryType: EntryType.LOCATION, level: TemplateLevel.BASIC, name: 'Basic', details: [{ label: 'Climate' }] },
    ];
    (codexService.getTemplates as jest.Mock).mockImplementation((type: EntryType) =>
      Promise.resolve(type === EntryType.LOCATION ? locationTemplates : templates)
    );
    renderCreateForm();
    await screen.findByRole('textbox', { name: 'Voice' });
    await waitFor(() => expect(codexService.getTemplates).toHaveBeenCalledTimes(Object.values(EntryType).length));

    fireEvent.click(screen.getByRole('button', { name: 'Switch to Location' }));

    // Same render: no locked state in between, and no new request.
    expect(screen.getByRole('textbox', { name: 'Climate' })).toBeEnabled();
    expect(screen.queryByRole('textbox', { name: 'Voice' })).not.toBeInTheDocument();
    expect(codexService.getTemplates).toHaveBeenCalledTimes(Object.values(EntryType).length);
  });

  it('still lets the author add details when templates fail to load', async () => {
    (codexService.getTemplates as jest.Mock).mockRejectedValue(new Error('offline'));
    renderCreateForm();

    expect(await screen.findByText(/Templates could not be loaded/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Add detail/ }));
    expect(screen.getByRole('textbox', { name: 'Detail label' })).toBeInTheDocument();
  });
});
