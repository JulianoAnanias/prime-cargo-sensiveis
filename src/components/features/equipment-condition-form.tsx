'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

interface CondicaoEquipamentoState {
  novo: boolean;
  usado: boolean;
  embalado: boolean;
  desembalado: boolean;
  funcionando: boolean;
  danificado: boolean;
  danificado_descricao: string;
  outros: boolean;
  outros_descricao: string;
  nao_verificado: boolean;
}

interface CondicaoEquipamentoFormProps {
  value?: CondicaoEquipamentoState;
  onChange?: (value: CondicaoEquipamentoState) => void;
}

const defaultState: CondicaoEquipamentoState = {
  novo: false,
  usado: false,
  embalado: false,
  desembalado: false,
  funcionando: false,
  danificado: false,
  danificado_descricao: '',
  outros: false,
  outros_descricao: '',
  nao_verificado: false,
};

export function CondicaoEquipamentoForm({ value = defaultState, onChange }: CondicaoEquipamentoFormProps) {
  const [state, setState] = useState<CondicaoEquipamentoState>(value);

  const updateState = (updates: Partial<CondicaoEquipamentoState>) => {
    const newState = { ...state, ...updates };
    setState(newState);
    if (onChange) onChange(newState);
  };

  const handleCheckboxChange = (key: keyof CondicaoEquipamentoState) => {
    // Handle mutually exclusive cases
    if (key === 'novo') updateState({ novo: !state.novo, usado: false });
    else if (key === 'usado') updateState({ usado: !state.usado, novo: false });
    else if (key === 'embalado') updateState({ embalado: !state.embalado, desembalado: false });
    else if (key === 'desembalado') updateState({ desembalado: !state.desembalado, embalado: false });
    // Sem avarias vs Danificado handled by generic inspection, but if we need it here:
    else updateState({ [key]: !state[key as keyof CondicaoEquipamentoState] });
  };

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-white">
      <h3 className="font-medium text-[#4D4D4D]">Condição do Equipamento (IPP41)</h3>
      
      <div className="space-y-4">
        {/* Condição de Uso */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Estado de Uso:</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-[#F47920] focus:ring-[#F47920]"
                checked={state.novo}
                onChange={() => handleCheckboxChange('novo')}
              />
              <span className="text-sm text-gray-700">Novo</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-[#F47920] focus:ring-[#F47920]"
                checked={state.usado}
                onChange={() => handleCheckboxChange('usado')}
              />
              <span className="text-sm text-gray-700">Usado</span>
            </label>
          </div>
        </div>

        {/* Estado da Embalagem */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Embalagem:</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-[#F47920] focus:ring-[#F47920]"
                checked={state.embalado}
                onChange={() => handleCheckboxChange('embalado')}
              />
              <span className="text-sm text-gray-700">Embalado</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-[#F47920] focus:ring-[#F47920]"
                checked={state.desembalado}
                onChange={() => handleCheckboxChange('desembalado')}
              />
              <span className="text-sm text-gray-700">Desembalado</span>
            </label>
          </div>
        </div>

        {/* Funcionamento e Avarias */}
        <div className="space-y-3 pt-2 border-t">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              className="h-4 w-4 rounded border-gray-300 text-[#F47920] focus:ring-[#F47920]"
              checked={state.funcionando}
              onChange={() => handleCheckboxChange('funcionando')}
            />
            <span className="text-sm text-gray-700">Funcionando (ligado e testado)</span>
          </label>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-[#F47920] focus:ring-[#F47920]"
                checked={state.danificado}
                onChange={() => handleCheckboxChange('danificado')}
              />
              <span className="text-sm text-gray-700">Danificado / Com sinais de avaria</span>
            </label>
            {state.danificado && (
              <div className="pl-6">
                <Input 
                  placeholder="Descreva a avaria em detalhes..."
                  value={state.danificado_descricao}
                  onChange={(e) => updateState({ danificado_descricao: e.target.value })}
                  error={!state.danificado_descricao ? "A descrição é obrigatória" : undefined}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-[#F47920] focus:ring-[#F47920]"
                checked={state.outros}
                onChange={() => handleCheckboxChange('outros')}
              />
              <span className="text-sm text-gray-700">Outros</span>
            </label>
            {state.outros && (
              <div className="pl-6">
                <Input 
                  placeholder="Especifique..."
                  value={state.outros_descricao}
                  onChange={(e) => updateState({ outros_descricao: e.target.value })}
                  error={!state.outros_descricao ? "A descrição é obrigatória" : undefined}
                />
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              className="h-4 w-4 rounded border-gray-300 text-[#F47920] focus:ring-[#F47920]"
              checked={state.nao_verificado}
              onChange={() => handleCheckboxChange('nao_verificado')}
            />
            <span className="text-sm text-gray-500 italic">Não foi possível verificar</span>
          </label>
        </div>
      </div>
    </div>
  );
}
