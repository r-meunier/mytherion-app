import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import DetailsInline from './DetailsInline';
import { ContextRole, EntryDetail } from '@/app/types/codex';

// onChange gets an updater; this is the list it produces from the details shown.
const applied = (onChange: jest.Mock, call = 0) => onChange.mock.calls[call][0](details);

const details: EntryDetail[] = [
  { id: 'a', label: 'Story role', value: 'Protagonist', role: ContextRole.IDENTITY },
  { id: 'b', label: 'Voice', value: null, hint: 'How do they talk?' },
];

describe('DetailsInline', () => {
  it('shows empty template details with their hint, so the author sees what to fill in', () => {
    render(<DetailsInline details={details} onChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'How do they talk?' })).toBeInTheDocument();
  });

  it('saves a value typed into a detail, keeping its role', async () => {
    const onChange = jest.fn().mockResolvedValue(true);
    render(<DetailsInline details={details} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Protagonist' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Story role' }), { target: { value: 'Antagonist' } });
    await act(async () => {
      fireEvent.blur(screen.getByRole('textbox', { name: 'Story role' }));
    });

    expect(applied(onChange)).toEqual([
      { id: 'a', label: 'Story role', value: 'Antagonist', role: ContextRole.IDENTITY },
      details[1],
    ]);
  });

  it('renames a detail and keeps its role', async () => {
    const onChange = jest.fn().mockResolvedValue(true);
    render(<DetailsInline details={details} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Story role' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'label of Story role' }), { target: { value: 'Role' } });
    await act(async () => {
      fireEvent.keyDown(screen.getByRole('textbox', { name: 'label of Story role' }), { key: 'Enter' });
    });

    expect(applied(onChange)[0]).toEqual({ ...details[0], label: 'Role' });
  });

  it('adds a detail once it has a label, and drops it when left empty', async () => {
    const onChange = jest.fn().mockResolvedValue(true);
    render(<DetailsInline details={details} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /Add detail/ }));
    fireEvent.blur(screen.getByRole('textbox', { name: "new detail's label" }));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Add detail/ }));
    fireEvent.change(screen.getByRole('textbox', { name: "new detail's label" }), { target: { value: 'Pronouns' } });
    await act(async () => {
      fireEvent.keyDown(screen.getByRole('textbox', { name: "new detail's label" }), { key: 'Enter' });
    });

    const saved = applied(onChange);
    expect(saved).toHaveLength(3);
    expect(saved[2]).toMatchObject({ label: 'Pronouns', value: null });
  });

  it('applies edits to the list it is given, not the one on screen, so queued edits keep each other', () => {
    const onChange = jest.fn().mockResolvedValue(true);
    render(<DetailsInline details={details} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Move Story role down' }));

    // The list as an earlier save left it: Story role already changed, a detail added.
    const saved: EntryDetail[] = [{ ...details[0], value: 'Antagonist' }, details[1], { id: 'c', label: 'Pronouns', value: null }];
    expect(onChange.mock.calls[0][0](saved)).toEqual([saved[1], saved[0], saved[2]]);
  });

  it('moves a detail down', () => {
    const onChange = jest.fn().mockResolvedValue(true);
    render(<DetailsInline details={details} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Move Story role down' }));

    expect(applied(onChange)).toEqual([details[1], details[0]]);
  });
});
