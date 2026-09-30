'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { PhotoCapture, Photo } from './photo-capture';

interface EquipmentVistoriaState {
  sem_avarias: boolean;
  com_avarias: boolean;
  avarias_descricao: string;
  umido: boolean;
  outros: boolean;
  outros_descricao: string;
  avarias_fotos: Photo[];
}

interface EquipmentVistoriaFormProps {
  value?: EquipmentVistoriaState;
  onChange?: (value: EquipmentVistoriaState) => void;
}

const defaultState: EquipmentVistoriaState = {
  sem_avarias: false,
  com_avarias: false,
  avarias_descricao: '',
  umido: false,
  outros: false,
  outros_descricao: '',
  avarias_fotos: [],
};

export function EquipmentVistoriaForm({ value = defaultState, onChange }: EquipmentVistoriaFormProps) {
  const [state, setState] = useState<EquipmentVistoriaState>(value);

  const updateState = (updates: Partial<EquipmentVistoriaState>) => {
    const newState = { ...state, ...updates };
    setState(newState);
    if (onChange) onChange(newState);
  };

  const handleCheckboxChange = (key: keyof EquipmentVistoriaState) => {
    if (key === 'sem_avarias') {
      updateState({ 
        sem_avarias: !state.sem_avarias,
        com_avarias: false,
        umido: false,
        outros: false
      });
    } else {
      updateState({ 
        [key]: !state[key as keyof EquipmentVistoriaState],
        sem_avarias: false 
      });
    }
  };

  const handleAddPhoto = (photo: Photo) => {
    updateState({ avarias_fotos: [...state.avarias_fotos, photo] });
  };

  const handleRemovePhoto = (id: string) => {
    updateState({ avarias_fotos: state.avarias_fotos.filter((p) => p.id !== id) });
  };

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-white">
      <h3 className="font-medium text-[#4D4D4D]">Inspeção do Equipamento (IPP41)</h3>
      
      <div className="space-y-4">
        <label className="flex items-start gap-2 border-b pb-3">
          <input 
            type="checkbox" 
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#F47920] focus:ring-[#F47920]"
            checked={state.sem_avarias}
            onChange={() => handleCheckboxChange('sem_avarias')}
          />
          <span className="text-sm font-medium text-green-700">Equipamento sem sinais de avarias</span>
        </label>
        
        <div className="space-y-3">
          <label className="flex items-start gap-2">
            <input 
              type="checkbox" 
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#F47920] focus:ring-[#F47920]"
              checked={state.com_avarias}
              onChange={() => handleCheckboxChange('com_avarias')}
            />
            <span className="text-sm text-gray-700">Equipamento apresenta sinais de avarias</span>
          </label>
          
          {state.com_avarias && (
            <div className="pl-6 space-y-4 border-l-2 border-red-200 ml-1">
              <Input 
                placeholder="Descreva a avaria em detalhes (obrigatório)"
                value={state.avarias_descricao}
                onChange={(e) => updateState({ avarias_descricao: e.target.value })}
                error={!state.avarias_descricao ? "A descrição é obrigatória" : undefined}
              />
              
              <div className="rounded border border-dashed border-gray-300 p-3 bg-gray-50">
                <PhotoCapture
                  label="Fotos da Avaria (Obrigatório)"
                  minPhotos={1}
                  maxPhotos={5}
                  photos={state.avarias_fotos}
                  onAddPhoto={handleAddPhoto}
                  onRemovePhoto={handleRemovePhoto}
                />
              </div>
            </div>
          )}
        </div>
        
        <label className="flex items-start gap-2">
          <input 
            type="checkbox" 
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#F47920] focus:ring-[#F47920]"
            checked={state.umido}
            onChange={() => handleCheckboxChange('umido')}
          />
          <span className="text-sm text-gray-700">Equipamento úmido / molhado</span>
        </label>
        
        <div className="space-y-3">
          <label className="flex items-start gap-2">
            <input 
              type="checkbox" 
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#F47920] focus:ring-[#F47920]"
              checked={state.outros}
              onChange={() => handleCheckboxChange('outros')}
            />
            <span className="text-sm text-gray-700">Outros</span>
          </label>
          
          {state.outros && (
            <div className="pl-6 border-l-2 border-gray-200 ml-1">
              <Input 
                placeholder="Especifique..."
                value={state.outros_descricao}
                onChange={(e) => updateState({ outros_descricao: e.target.value })}
                error={!state.outros_descricao ? "A descrição é obrigatória" : undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
