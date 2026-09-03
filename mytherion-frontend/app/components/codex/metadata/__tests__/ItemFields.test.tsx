import { render, screen, fireEvent } from '@testing-library/react';
import ItemFields from '../ItemFields';
import '@testing-library/jest-dom';

describe('ItemFields', () => {
  const mockOnChange = jest.fn();
  const mockData = {
    rarity: 'Common',
    material: 'Iron',
    condition: 'Good',
    weight: { value: 10, unit: 'kg' },
    value: { value: 100, unit: 'Gold' },
    properties: ['Heavy', 'Rusty'],
    history: 'Found in a cave.'
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all fields correctly', () => {
    render(<ItemFields data={mockData} onChange={mockOnChange} />);
    
    expect(screen.getByLabelText('Rarity')).toHaveValue('Common');
    expect(screen.getByLabelText('Primary Material')).toHaveValue('Iron');
    expect(screen.getByLabelText('Current Condition')).toHaveValue('Good');
    expect(screen.getByLabelText('Weight')).toHaveValue(10);
    expect(screen.getByLabelText('Monetary Value')).toHaveValue(100);
    expect(screen.getByLabelText('Special Properties / Enchantments')).toHaveValue('Heavy, Rusty');
    expect(screen.getByLabelText('Item History / Lore')).toHaveValue('Found in a cave.');
  });

  it('calls onChange when basic fields change', () => {
    render(<ItemFields data={mockData} onChange={mockOnChange} />);
    
    const rarityInput = screen.getByLabelText('Rarity');
    fireEvent.change(rarityInput, { target: { value: 'Rare' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({ rarity: 'Rare' });
  });

  it('handles properties array correctly', () => {
    render(<ItemFields data={mockData} onChange={mockOnChange} />);
    
    const propertiesInput = screen.getByLabelText('Special Properties / Enchantments');
    fireEvent.change(propertiesInput, { target: { value: 'Magic, Sharp' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({ properties: ['Magic', 'Sharp'] });
  });

  it('disables fields when disabled prop is true', () => {
    render(<ItemFields data={mockData} onChange={mockOnChange} disabled={true} />);
    
    expect(screen.getByLabelText('Rarity')).toBeDisabled();
    expect(screen.getByLabelText('Primary Material')).toBeDisabled();
    expect(screen.getByLabelText('Weight')).toBeDisabled();
    expect(screen.getByLabelText('Item History / Lore')).toBeDisabled();
  });
});
