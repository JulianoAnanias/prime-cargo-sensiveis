'use client';

import React, { useState } from 'react';

interface PackagingVistoriaState {
  original: boolean;
  inadequada: boolean;
  avaria_umidade: boolean;
  sem_embalagem: boolean;
}

interface PackagingVistoriaFormProps {
  value?: PackagingVistoriaState;
  onChange?: (value: PackagingVistoriaState) => void;
}

const defaultState: PackagingVistoriaState = {
  original: false,
  inadequada: false,
  avaria_umidade: false,
  sem_embalagem: false,
};

export function PackagingVistoriaForm({ value = defaultState, onChange }: PackagingVistoriaFormProps) {
  const [state, setState] = useState<PackagingVistoriaState>(value);

  const updateState = (updates: Partial<PackagingVistoriaState>) => {
    const newState = { ...state, ...updates };
    setState(newState);
    if (onChange) onChange(newState);
  };

  const handleCheckboxChange = (key: keyof PackagingVistoriaState) => {
    // Handle mutually exclusive cases
    if (key === 'sem_embalagem') {
      updateState({ 
        sem_embalagem: !state.sem_embalagem,
        original: false,
        inadequada: false,
        avaria_umidade: false
      });
    } else {
      updateState({ 
        [key]: !state[key as keyof PackagingVistoriaState],
        sem_embalagem: false 
      });
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-white">
      <h3 className="font-medium text-[#4D4D4D]">Inspeção de Embalagem (IPP41)</h3>
      
      <div className="space-y-3">
        <label className="flex items-start gap-2">
          <input 
            type="checkbox" 
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#F47920] focus:ring-[#F47920]"
            checked={state.original}
            onChange={() => handleCheckboxChange('original')}
          />
          <span className="text-sm text-gray-700">Embalagem original do equipamento</span>
        </label>
        
        <label className="flex items-start gap-2">
          <input 
            type="checkbox" 
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#F47920] focus:ring-[#F47920]"
            checked={state.inadequada}
            onChange={() => handleCheckboxChange('inadequada')}
          />
          <span className="text-sm text-gray-700">Embalagem inadequada para o transporte</span>
        </label>
        
        <label className="flex items-start gap-2">
          <input 
            type="checkbox" 
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#F47920] focus:ring-[#F47920]"
            checked={state.avaria_umidade}
            onChange={() => handleCheckboxChange('avaria_umidade')}
          />
          <span className="text-sm text-gray-700">Embalagem com sinais de avaria e/ou umidade</span>
        </label>
        
        <label className="flex items-start gap-2 pt-2 border-t">
          <input 
            type="checkbox" 
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#F47920] focus:ring-[#F47920]"
            checked={state.sem_embalagem}
            onChange={() => handleCheckboxChange('sem_embalagem')}
          />
          <span className="text-sm font-medium text-gray-700">Sem embalagem</span>
        </label>
      </div>
    </div>
  );
}
