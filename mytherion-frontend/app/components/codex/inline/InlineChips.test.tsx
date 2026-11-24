import { render, screen, fireEvent, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import InlineChips from './InlineChips';

const tagLabel = { singular: 'tag', plural: 'tags' };

describe('InlineChips', () => {
  it('adds an item on Enter and saves the whole list', async () => {
    const onSave = jest.fn().mockResolvedValue(true);
    render(<InlineChips items={['council']} onSave={onSave} itemLabel={tagLabel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add tag' }));
    const input = screen.getByRole('textbox', { name: 'New tag' });
    fireEvent.change(input, { target: { value: 'political' } });
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });

    expect(onSave).toHaveBeenCalledWith(['council', 'political']);
    // Stays open for the next one.
    expect(screen.getByRole('textbox', { name: 'New tag' })).toHaveValue('');
  });

  it('removes an item straight away', async () => {
    const onSave = jest.fn().mockResolvedValue(true);
    render(<InlineChips items={['council', 'political']} onSave={onSave} itemLabel={tagLabel} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Remove council' }));
    });

    expect(onSave).toHaveBeenCalledWith(['political']);
  });

  it('refuses duplicates without saving', () => {
    const onSave = jest.fn();
    render(<InlineChips items={['council']} onSave={onSave} itemLabel={tagLabel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add tag' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'council' } });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });

    expect(screen.getByText('Tag already exists')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows the list as stored again when a save fails', async () => {
    const onSave = jest.fn().mockResolvedValue(false);
    render(<InlineChips items={['council']} onSave={onSave} itemLabel={tagLabel} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Remove council' }));
    });

    expect(within(screen.getByRole('list', { name: 'Tags' })).getByText('council')).toBeInTheDocument();
    expect(screen.getByText(/Not saved/)).toBeInTheDocument();
  });
});
