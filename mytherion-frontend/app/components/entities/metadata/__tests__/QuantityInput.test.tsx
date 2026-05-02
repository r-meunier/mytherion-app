import { render, screen, fireEvent } from '@testing-library/react';
import QuantityInput from '../QuantityInput';
import '@testing-library/jest-dom';

describe('QuantityInput', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    label: 'Age',
    value: { value: 25, unit: 'Years' },
    onChange: mockOnChange,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders correctly with initial values', () => {
    render(<QuantityInput {...defaultProps} />);
    
    expect(screen.getByLabelText(/Age/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('25')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Years')).toBeInTheDocument();
  });

  it('calls onChange when the number value changes', () => {
    render(<QuantityInput {...defaultProps} />);
    
    const valueInput = screen.getByDisplayValue('25');
    fireEvent.change(valueInput, { target: { value: '30' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({ value: 30, unit: 'Years' });
  });

  it('calls onChange when the unit value changes', () => {
    render(<QuantityInput {...defaultProps} />);
    
    const unitInput = screen.getByDisplayValue('Years');
    fireEvent.change(unitInput, { target: { value: 'Centuries' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({ value: 25, unit: 'Centuries' });
  });

  it('handles empty value correctly', () => {
    render(<QuantityInput {...defaultProps} value={{ value: undefined, unit: 'Years' }} />);
    
    const valueInput = screen.getByRole('spinbutton');
    fireEvent.change(valueInput, { target: { value: '10' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({ value: 10, unit: 'Years' });
  });

  it('disables both inputs when disabled prop is true', () => {
    render(<QuantityInput {...defaultProps} disabled={true} />);
    
    const valueInput = screen.getByDisplayValue('25');
    const unitInput = screen.getByDisplayValue('Years');
    
    expect(valueInput).toBeDisabled();
    expect(unitInput).toBeDisabled();
  });
});
