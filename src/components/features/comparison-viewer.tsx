'use client';

import React, { useState } from 'react';
import { ChevronRight, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StageData {
  stageName: string;
  date: string;
  responsible: string;
  conditions: { label: string; value: string; isAlert?: boolean }[];
  photos: { url: string; label: string }[];
}

interface ComparisonViewerProps {
  previousStage: StageData;
  currentStage: StageData;
}

export function ComparisonViewer({ previousStage, currentStage }: ComparisonViewerProps) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const renderStageInfo = (data: StageData, isCurrent: boolean) => (
    <div className={cn("p-4 rounded-lg border", isCurrent ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200")}>
      <div className="flex items-center justify-between mb-3 border-b pb-2">
        <div>
          <span className={cn(
            "text-xs font-bold uppercase tracking-wider",
            isCurrent ? "text-[#F47920]" : "text-gray-500"
          )}>
            {isCurrent ? 'Etapa Atual' : 'Etapa Anterior'}
          </span>
          <h4 className="font-medium text-[#4D4D4D]">{data.stageName}</h4>
        </div>
      </div>
      
      <div className="space-y-1 mb-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          <span>{data.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5" />
          <span>{data.responsible}</span>
        </div>
      </div>

      <div className="space-y-2">
        {data.conditions.map((cond, idx) => (
          <div key={idx} className="text-sm">
            <span className="text-gray-500">{cond.label}: </span>
            <span className={cn("font-medium", cond.isAlert ? "text-red-600" : "text-gray-900")}>
              {cond.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const prevPhotos = previousStage.photos;
  const currPhotos = currentStage.photos;
  const maxPhotos = Math.max(prevPhotos.length, currPhotos.length);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderStageInfo(previousStage, false)}
        {renderStageInfo(currentStage, true)}
      </div>

      {maxPhotos > 0 && (
        <div className="rounded-lg border bg-white p-4">
          <h4 className="font-medium text-[#4D4D4D] mb-4">Comparação de Fotos</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-500 uppercase">Anterior</span>
              {prevPhotos[activePhotoIdx] ? (
                <div className="aspect-square relative rounded bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={prevPhotos[activePhotoIdx].url} alt="Foto anterior" className="object-cover w-full h-full" />
                  <div className="absolute bottom-0 w-full bg-black/50 p-1 text-white text-xs text-center">
                    {prevPhotos[activePhotoIdx].label}
                  </div>
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center rounded bg-gray-50 border border-dashed">
                  <span className="text-xs text-gray-400">Sem foto</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <span className="text-xs font-medium text-[#F47920] uppercase">Atual</span>
              {currPhotos[activePhotoIdx] ? (
                <div className="aspect-square relative rounded bg-gray-100 overflow-hidden border-2 border-[#F47920]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currPhotos[activePhotoIdx].url} alt="Foto atual" className="object-cover w-full h-full" />
                  <div className="absolute bottom-0 w-full bg-black/50 p-1 text-white text-xs text-center">
                    {currPhotos[activePhotoIdx].label}
                  </div>
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center rounded bg-gray-50 border border-dashed">
                  <span className="text-xs text-gray-400">Sem foto</span>
                </div>
              )}
            </div>
          </div>
          
          {maxPhotos > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: maxPhotos }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    activePhotoIdx === idx ? "bg-[#F47920]" : "bg-gray-300"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
