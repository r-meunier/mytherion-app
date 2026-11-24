import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DetailsEditor from './DetailsEditor';
import { ContextRole, EntryDetail } from '@/app/types/codex';

const details: EntryDetail[] = [
  { id: 'a', label: 'Story role', value: 'Protagonist' },
  { id: 'b', label: 'Voice', value: null, hint: 'How do they talk?' },
];

describe('DetailsEditor', () => {
  it('updates a value by id', () => {
    const onChange = jest.fn();
    render(<DetailsEditor details={details} onChange={onChange} />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Voice' }), { target: { value: 'Clipped' } });

    expect(onChange).toHaveBeenCalledWith([details[0], { ...details[1], value: 'Clipped' }]);
  });

  it('renames a detail', () => {
    const onChange = jest.fn();
    render(<DetailsEditor details={details} onChange={onChange} />);

    fireEvent.change(screen.getAllByRole('textbox', { name: 'Detail label' })[0], { target: { value: 'Role' } });

    expect(onChange.mock.calls[0][0][0]).toMatchObject({ id: 'a', label: 'Role' });
  });

  it('adds an empty detail with a new id', () => {
    const onChange = jest.fn();
    render(<DetailsEditor details={details} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /Add detail/ }));

    const next = onChange.mock.calls[0][0];
    expect(next).toHaveLength(3);
    expect(next[2]).toMatchObject({ label: '', value: null });
    expect(next[2].id).not.toBe('a');
  });

  it('removes an empty detail without asking', () => {
    const confirm = jest.spyOn(window, 'confirm');
    const onChange = jest.fn();
    render(<DetailsEditor details={details} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remove Voice' }));

    expect(confirm).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith([details[0]]);
    confirm.mockRestore();
  });

  it('asks before removing a detail that has text', () => {
    const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
    const onChange = jest.fn();
    render(<DetailsEditor details={details} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remove Story role' }));

    expect(confirm).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    confirm.mockRestore();
  });

  it('moves a detail up and down', () => {
    const onChange = jest.fn();
    render(<DetailsEditor details={details} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Move Voice up' }));
    expect(onChange).toHaveBeenLastCalledWith([details[1], details[0]]);

    fireEvent.click(screen.getByRole('button', { name: 'Move Story role down' }));
    expect(onChange).toHaveBeenLastCalledWith([details[1], details[0]]);
  });

  it('cannot move the first detail up or the last one down', () => {
    render(<DetailsEditor details={details} onChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Move Story role up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move Voice down' })).toBeDisabled();
  });

  it('keeps a hint reachable once the detail has text', () => {
    render(<DetailsEditor details={[{ ...details[1], value: 'Clipped' }]} onChange={jest.fn()} />);

    expect(screen.getByRole('img', { name: 'Hint: How do they talk?' })).toBeInTheDocument();
  });

  it('keeps the context role when a detail is renamed', () => {
    const onChange = jest.fn();
    const voice = { id: 'v', label: 'Voice', value: null, role: ContextRole.VOICE };
    render(<DetailsEditor details={[voice]} onChange={onChange} />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Detail label' }), { target: { value: 'Speech' } });

    expect(onChange).toHaveBeenCalledWith([{ ...voice, label: 'Speech' }]);
  });

  it('shows only filled details when read-only', () => {
    render(<DetailsEditor details={details} readOnly />);

    expect(screen.getByText('Story role')).toBeInTheDocument();
    expect(screen.getByText('Protagonist')).toBeInTheDocument();
    expect(screen.queryByText('Voice')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('says so when a read-only entry has no filled details', () => {
    render(<DetailsEditor details={[]} readOnly />);
    expect(screen.getByText('No details yet.')).toBeInTheDocument();
  });
});
