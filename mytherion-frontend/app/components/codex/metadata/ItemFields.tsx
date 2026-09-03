'use client';

import { ItemData } from '@/app/types/entity';
import QuantityInput from './QuantityInput';

interface ItemFieldsProps {
  data: ItemData;
  onChange: (data: Partial<ItemData>) => void;
  disabled?: boolean;
}

export default function ItemFields({ data, onChange, disabled = false }: ItemFieldsProps) {
  // Ensure default structure
  const safeData: ItemData = {
    rarity: data.rarity || '',
    material: data.material || '',
    condition: data.condition || '',
    weight: data.weight || {},
    value: data.value || {},
    properties: data.properties || [],
    history: data.history || ''
  };

  const handleChange = (field: keyof ItemData, value: any) => {
    onChange({ [field]: value });
  };

  const handlePropertiesChange = (value: string) => {
    const list = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    onChange({ properties: list });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Stats */}
        <div className="space-y-4">
          <div>
            <label 
              htmlFor="item-rarity"
              className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
            >
              Rarity
            </label>
            <input
              id="item-rarity"
              type="text"
              value={safeData.rarity}
              onChange={(e) => handleChange('rarity', e.target.value)}
              disabled={disabled}
              placeholder="e.g. Common, Rare, Legendary"
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
            />
          </div>

          <div>
            <label 
              htmlFor="item-material"
              className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
            >
              Primary Material
            </label>
            <input
              id="item-material"
              type="text"
              value={safeData.material}
              onChange={(e) => handleChange('material', e.target.value)}
              disabled={disabled}
              placeholder="e.g. Steel, Oak, Obsidian"
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
            />
          </div>

          <div>
            <label 
              htmlFor="item-condition"
              className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
            >
              Current Condition
            </label>
            <input
              id="item-condition"
              type="text"
              value={safeData.condition}
              onChange={(e) => handleChange('condition', e.target.value)}
              disabled={disabled}
              placeholder="e.g. Pristine, Worn, Broken"
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Measurements */}
        <div className="space-y-4">
          <QuantityInput 
            label="Weight"
            value={safeData.weight}
            onChange={(val) => handleChange('weight', val)}
            disabled={disabled}
            units={['kg', 'lb', 'g', 'tons']}
          />

          <QuantityInput 
            label="Monetary Value"
            value={safeData.value}
            onChange={(val) => handleChange('value', val)}
            disabled={disabled}
            units={['Gold', 'Silver', 'Credits', 'Souls']}
          />
        </div>
      </div>

      {/* Properties (Array) */}
      <div>
        <label 
          htmlFor="item-properties"
          className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
        >
          Special Properties / Enchantments
        </label>
        <input
          id="item-properties"
          type="text"
          value={safeData.properties.join(', ')}
          onChange={(e) => handlePropertiesChange(e.target.value)}
          disabled={disabled}
          placeholder="e.g. Flaming, Sharp, Soulbound (comma separated)"
          className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm"
        />
        <p className="mt-1 text-[10px] text-gray-500">Separate multiple properties with commas.</p>
      </div>

      {/* History (Full Width) */}
      <div>
        <label 
          htmlFor="item-history"
          className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
        >
          Item History / Lore
        </label>
        <textarea
          id="item-history"
          value={safeData.history}
          onChange={(e) => handleChange('history', e.target.value)}
          disabled={disabled}
          rows={4}
          placeholder="Describe the origins and significant events in this item's existence..."
          className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-sm resize-none"
        />
      </div>
    </div>
  );
}
