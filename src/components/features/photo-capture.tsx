'use client';

import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type PhotoType = 'geral' | 'identificacao' | 'evidencia_nc';

export interface Photo {
  id: string;
  url: string;
  type: PhotoType;
  origin: 'camera' | 'arquivo';
  progress?: number;
}

interface PhotoCaptureProps {
  photos: Photo[];
  onAddPhoto: (photo: Photo) => void;
  onRemovePhoto: (id: string) => void;
  minPhotos?: number;
  maxPhotos?: number;
  label?: string;
}

export function PhotoCapture({
  photos,
  onAddPhoto,
  onRemovePhoto,
  minPhotos = 3,
  maxPhotos = 10,
  label = 'Fotos',
}: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, origin: 'camera' | 'arquivo') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // In a real app, you'd upload the file here and get a URL.
      // We simulate this with an object URL and a fake upload progress.
      const url = URL.createObjectURL(file);
      const newPhoto: Photo = {
        id: Math.random().toString(36).substring(2, 9),
        url,
        type: 'geral',
        origin,
        progress: 0,
      };
      
      onAddPhoto(newPhoto);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200);
    });
    
    // Reset inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const getPhotoTypeLabel = (type: PhotoType) => {
    switch(type) {
      case 'geral': return 'Geral';
      case 'identificacao': return 'Identificação';
      case 'evidencia_nc': return 'Evidência NC';
      default: return 'Foto';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#4D4D4D]">{label}</h3>
        <span className={cn(
          "text-xs font-medium",
          photos.length < minPhotos ? "text-red-500" : "text-green-600"
        )}>
          {photos.length}/{minPhotos} fotos obrigatórias
        </span>
      </div>

      <div className="flex gap-2">
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          ref={cameraInputRef}
          onChange={(e) => handleFileChange(e, 'camera')}
        />
        <Button 
          type="button" 
          variant="primary" 
          className="flex-1 gap-2"
          onClick={() => cameraInputRef.current?.click()}
          disabled={photos.length >= maxPhotos}
        >
          <Camera className="h-4 w-4" />
          Câmera
        </Button>
        
        <input 
          type="file" 
          accept="image/*" 
          multiple
          className="hidden" 
          ref={fileInputRef}
          onChange={(e) => handleFileChange(e, 'arquivo')}
        />
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1 gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={photos.length >= maxPhotos}
        >
          <ImageIcon className="h-4 w-4" />
          Galeria
        </Button>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg border bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={photo.url} 
                alt={`Foto ${photo.type}`} 
                className="h-full w-full object-cover"
              />
              
              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[10px] text-white">
                <div className="flex items-center justify-between">
                  <span>{getPhotoTypeLabel(photo.type)}</span>
                  <span className="text-gray-300">
                    {photo.origin === 'camera' ? 'Câmera' : 'Arquivo'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemovePhoto(photo.id)}
                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-90 hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>

              {photo.progress !== undefined && photo.progress < 100 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="w-3/4 rounded-full bg-gray-200">
                    <div 
                      className="h-1.5 rounded-full bg-[#F47920] transition-all"
                      style={{ width: `${photo.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
