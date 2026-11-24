import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import InlineText from './InlineText';

describe('InlineText', () => {
  const openEditor = (name: RegExp | string) => fireEvent.click(screen.getByRole('button', { name }));

  it('opens an editor on click and saves on Enter', async () => {
    const onSave = jest.fn().mockResolvedValue(true);
    render(<InlineText value="Mira Vell" label="name" onSave={onSave} />);

    openEditor('Mira Vell');
    const input = screen.getByRole('textbox', { name: 'name' });
    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: 'Mira Vell-Arden ' } });
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });

    expect(onSave).toHaveBeenCalledWith('Mira Vell-Arden');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('saves when the author clicks away', async () => {
    const onSave = jest.fn().mockResolvedValue(true);
    render(<InlineText value="" label="description" multiline placeholder="Add a description" onSave={onSave} />);

    openEditor(/Add a description/);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Line one\nLine two' } });
    await act(async () => {
      fireEvent.blur(screen.getByRole('textbox'));
    });

    expect(onSave).toHaveBeenCalledWith('Line one\nLine two');
  });

  it('keeps Enter as a new line in multiline text, and saves on Ctrl+Enter', async () => {
    const onSave = jest.fn().mockResolvedValue(true);
    render(<InlineText value="Old" label="description" multiline onSave={onSave} />);

    openEditor('Old');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New' } });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSave).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', ctrlKey: true });
    });
    expect(onSave).toHaveBeenCalledWith('New');
  });

  it('cancels on Escape without saving, also on the blur that follows', () => {
    const onSave = jest.fn();
    render(<InlineText value="Mira" label="name" onSave={onSave} />);

    openEditor('Mira');
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Typo' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    fireEvent.blur(input);

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Mira' })).toBeInTheDocument();
  });

  it('shows a validation error on Enter and stays open', () => {
    const onSave = jest.fn();
    render(<InlineText value="Mira" label="name" validate={(v) => (v ? null : 'Name is required')} onSave={onSave} />);

    openEditor('Mira');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('reopens with the author\'s text when the save fails', async () => {
    const onSave = jest.fn().mockResolvedValue(false);
    render(<InlineText value="Mira" label="name" onSave={onSave} />);

    openEditor('Mira');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Mira Vell' } });
    await act(async () => {
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    });

    expect(screen.getByRole('textbox')).toHaveValue('Mira Vell');
    expect(screen.getByText(/Not saved/)).toBeInTheDocument();
  });

  it('does not save when nothing changed', () => {
    const onSave = jest.fn();
    render(<InlineText value="Mira" label="name" onSave={onSave} />);

    openEditor('Mira');
    fireEvent.blur(screen.getByRole('textbox'));

    expect(onSave).not.toHaveBeenCalled();
  });
});
