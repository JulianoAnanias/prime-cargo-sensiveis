'use client';

import { useState, useRef, useCallback } from 'react';

export interface PhotoData {
  id: string;
  url: string;
  blob: Blob;
  origin: 'camera' | 'file';
  timestamp: number;
}

export function useCamera() {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File, origin: 'camera' | 'file') => {
    const url = URL.createObjectURL(file);
    const newPhoto: PhotoData = {
      id: crypto.randomUUID(),
      url,
      blob: file,
      origin,
      timestamp: Date.now()
    };
    setPhotos(prev => [...prev, newPhoto]);
  }, []);

  const handleInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, origin: 'camera' | 'file') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processFile(file, origin);
    }
    setIsCapturing(false);
    if (inputRef.current) inputRef.current.value = '';
  }, [processFile]);

  const capturePhoto = useCallback(() => {
    setIsCapturing(true);
    // Cria input dinâmico para garantir o atributo capture='environment' no mobile
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Prefere câmera traseira
    input.onchange = (e: any) => handleInputChange(e, 'camera');
    input.oncancel = () => setIsCapturing(false);
    input.click();
  }, [handleInputChange]);

  const selectFile = useCallback(() => {
    setIsCapturing(true);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => handleInputChange(e, 'file');
    input.oncancel = () => setIsCapturing(false);
    input.click();
  }, [handleInputChange]);

  const removePhoto = useCallback((id: string) => {
    setPhotos(prev => {
      const p = prev.find(photo => photo.id === id);
      if (p) URL.revokeObjectURL(p.url);
      return prev.filter(photo => photo.id !== id);
    });
  }, []);

  return { capturePhoto, selectFile, photos, removePhoto, isCapturing };
}
