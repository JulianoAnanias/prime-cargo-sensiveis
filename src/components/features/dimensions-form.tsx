'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

interface DimensoesState {
  altura: string;
  largura: string;
  comprimento: string;
  peso: string;
}

interface DimensoesFormProps {
  value?: DimensoesState;
  onChange?: (value: DimensoesState) => void;
}

export function DimensoesForm({ 
  value = { altura: '', largura: '', comprimento: '', peso: '' },
  onChange 
}: DimensoesFormProps) {
  const [dimensions, setDimensoes] = useState<DimensoesState>(value);

  const handleChange = (field: keyof DimensoesState, val: string) => {
    // Allow empty or valid numbers
    if (val === '' || !isNaN(Number(val))) {
      const newDimensoes = { ...dimensions, [field]: val };
      setDimensoes(newDimensoes);
      if (onChange) {
        onChange(newDimensoes);
      }
    }
  };

  const isNotReported = (val: string) => val === '';

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-white">
      <h3 className="font-medium text-[#4D4D4D]">Dimensões e Peso</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Altura <span className="text-gray-400 font-normal">(cm)</span>
          </label>
          <div className="relative">
            <Input
              type="number"
              placeholder="Não informado"
              value={dimensions.altura}
              onChange={(e) => handleChange('altura', e.target.value)}
              className={isNotReported(dimensions.altura) ? 'text-gray-400 placeholder:text-gray-400' : ''}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Largura <span className="text-gray-400 font-normal">(cm)</span>
          </label>
          <Input
            type="number"
            placeholder="Não informado"
            value={dimensions.largura}
            onChange={(e) => handleChange('largura', e.target.value)}
            className={isNotReported(dimensions.largura) ? 'text-gray-400 placeholder:text-gray-400' : ''}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Comprimento <span className="text-gray-400 font-normal">(cm)</span>
          </label>
          <Input
            type="number"
            placeholder="Não informado"
            value={dimensions.comprimento}
            onChange={(e) => handleChange('comprimento', e.target.value)}
            className={isNotReported(dimensions.comprimento) ? 'text-gray-400 placeholder:text-gray-400' : ''}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Peso <span className="text-gray-400 font-normal">(kg)</span>
          </label>
          <Input
            type="number"
            placeholder="Não informado"
            value={dimensions.peso}
            onChange={(e) => handleChange('peso', e.target.value)}
            className={isNotReported(dimensions.peso) ? 'text-gray-400 placeholder:text-gray-400' : ''}
          />
        </div>
      </div>
    </div>
  );
}
