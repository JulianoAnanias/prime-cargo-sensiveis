'use client';

import React, { useState } from 'react';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PhotoCapture, Photo } from './photo-capture';
import { AssinaturaPad } from './signature-pad';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

export interface NaoConformidade {
  id: string;
  description: string;
  stageRegistered: string;
  previousPhotos: string[];
}

interface NaoConformidadeCheckProps {
  nonConformities: NaoConformidade[];
  onComplete: (data: any) => void;
}

export function NaoConformidadeCheck({ nonConformities, onComplete }: NaoConformidadeCheckProps) {
  const [checks, setChecks] = useState<Record<string, {
    status: string;
    reason: string;
    observation: string;
    photos: Photo[];
  }>>({});
  
  const [clientAssinatura, setClientAssinatura] = useState<any>(null);

  if (!nonConformities || nonConformities.length === 0) {
    return null;
  }

  const updateCheck = (ncId: string, field: string, value: any) => {
    setChecks(prev => ({
      ...prev,
      [ncId]: {
        ...(prev[ncId] || { status: '', reason: '', observation: '', photos: [] }),
        [field]: value
      }
    }));
  };

  const handleAddPhoto = (ncId: string, photo: Photo) => {
    const current = checks[ncId]?.photos || [];
    updateCheck(ncId, 'photos', [...current, photo]);
  };

  const handleRemovePhoto = (ncId: string, photoId: string) => {
    const current = checks[ncId]?.photos || [];
    updateCheck(ncId, 'photos', current.filter(p => p.id !== photoId));
  };

  const isAllChecked = nonConformities.every(nc => {
    const check = checks[nc.id];
    if (!check || !check.status) return false;
    if (check.status === 'nao_verificado' && !check.reason) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Reconferência de Não Conformidades</h3>
        </div>
        <p className="text-sm text-red-600">
          Atenção: Foram identificadas {nonConformities.length} não conformidade(s) em etapas anteriores. 
          É obrigatório verificar o status atual de cada uma.
        </p>
      </div>

      <div className="space-y-6">
        {nonConformities.map((nc, index) => {
          const check = checks[nc.id] || { status: '', reason: '', observation: '', photos: [] };
          
          return (
            <div key={nc.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">NC #{index + 1}</span>
                <h4 className="text-lg font-medium text-[#4D4D4D]">{nc.description}</h4>
                <p className="text-sm text-gray-500">Registrada na etapa: {nc.stageRegistered}</p>
              </div>

              <div className="space-y-4">
                <Select
                  label="Status Atual"
                  value={check.status}
                  onChange={(e) => updateCheck(nc.id, 'status', e.target.value)}
                >
                  <option value="">Selecione o status...</option>
                  <option value="permanece">Permanece</option>
                  <option value="resolvida">Foi resolvida</option>
                  <option value="agravou">Se agravou</option>
                  <option value="nao_verificado">Não foi possível verificar</option>
                </Select>

                {check.status === 'nao_verificado' && (
                  <Textarea
                    label="Motivo (Obrigatório)"
                    placeholder="Explique por que não foi possível verificar..."
                    value={check.reason}
                    onChange={(e) => updateCheck(nc.id, 'reason', e.target.value)}
                    error={!check.reason ? "Motivo é obrigatório" : undefined}
                  />
                )}

                <Textarea
                  label="Observação / Ação Tomada"
                  placeholder="Detalhes adicionais..."
                  value={check.observation}
                  onChange={(e) => updateCheck(nc.id, 'observation', e.target.value)}
                />

                {check.status && check.status !== 'nao_verificado' && (
                  <div className="rounded-lg border p-3 bg-gray-50">
                    <PhotoCapture
                      label="Evidências Atuais (Opcional)"
                      minPhotos={0}
                      maxPhotos={5}
                      photos={check.photos}
                      onAddPhoto={(p) => handleAddPhoto(nc.id, p)}
                      onRemovePhoto={(pid) => handleRemovePhoto(nc.id, pid)}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isAllChecked && (
        <div className="mt-8">
          <AssinaturaPad
            purpose="ciencia_nc"
            agreementText="Declaro estar ciente das não conformidades listadas acima e seus respectivos status atuais após a reconferência."
            onSave={(data) => {
              setClientAssinatura(data);
              onComplete({ checks, signature: data });
            }}
          />
        </div>
      )}
    </div>
  );
}
