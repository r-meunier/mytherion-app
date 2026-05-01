'use client';

import { useState } from 'react';

interface CustomFieldsProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  disabled?: boolean;
}

export default function CustomFields({ data, onChange, disabled = false }: CustomFieldsProps) {
  // Convert map to array of entries for easier editing
  const entries = Object.entries(data).map(([key, value]) => ({ key, value }));

  const handleEntryChange = (index: number, field: 'key' | 'value', newValue: string) => {
    const newEntries = [...entries];
    const oldKey = newEntries[index].key;
    
    if (field === 'key') {
      newEntries[index].key = newValue;
    } else {
      newEntries[index].value = newValue;
    }

    // Reconstruct the map
    const newData: Record<string, any> = {};
    newEntries.forEach((entry) => {
      if (entry.key) {
        newData[entry.key] = entry.value;
      }
    });
    onChange(newData);
  };

  const addEntry = () => {
    const newData = { ...data, [`field_${entries.length + 1}`]: '' };
    onChange(newData);
  };

  const removeEntry = (keyToRemove: string) => {
    const newData = { ...data };
    delete newData[keyToRemove];
    onChange(newData);
  };

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-1">
            <input
              type="text"
              value={entry.key}
              onChange={(e) => handleEntryChange(index, 'key', e.target.value)}
              disabled={disabled}
              placeholder="Field Name"
              className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div className="flex-[2]">
            <input
              type="text"
              value={entry.value}
              onChange={(e) => handleEntryChange(index, 'value', e.target.value)}
              disabled={disabled}
              placeholder="Value"
              className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => removeEntry(entry.key)}
              className="p-2 text-gray-500 hover:text-red-400 transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          )}
        </div>
      ))}

      {!disabled && (
        <button
          type="button"
          onClick={addEntry}
          className="flex items-center gap-2 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors pt-2"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Custom Field
        </button>
      )}
    </div>
  );
}
