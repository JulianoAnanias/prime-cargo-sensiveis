'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AssinaturaPadProps {
  onSave: (data: { signatureDataUrl: string; name: string; document: string; date: string }) => void;
  purpose: 'concordancia' | 'ciencia_nc' | 'responsavel_prime' | 'termo_abertura';
  agreementText: string;
}

export function AssinaturaPad({ onSave, purpose, agreementText }: AssinaturaPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasAssinatura, setHasAssinatura] = useState(false);
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [savedDataUrl, setSavedDataUrl] = useState<string | null>(null);

  const purposeLabels = {
    concordancia: 'Concordância',
    ciencia_nc: 'Ciência de Não Conformidade',
    responsavel_prime: 'Responsável Prime Cargo',
    termo_abertura: 'Termo de Abertura',
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions to match container while maintaining aspect ratio
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = 200; // Fixed height for mobile touch area
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000000';
    }
  }, [savedDataUrl]); // Re-init when returning to edit mode

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
      // Prevent scrolling while drawing
      e.preventDefault();
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasAssinatura(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
      e.preventDefault();
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasAssinatura(false);
    setSavedDataUrl(null);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSavedDataUrl(dataUrl);
    
    const now = new Date();
    onSave({
      signatureDataUrl: dataUrl,
      name,
      document,
      date: now.toISOString(),
    });
  };

  if (savedDataUrl) {
    return (
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-[#4D4D4D]">{purposeLabels[purpose]}</h3>
          <span className="text-xs text-green-600 font-medium">Assinado</span>
        </div>
        
        <div className="rounded border bg-gray-50 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={savedDataUrl} alt="Assinatura" className="h-[100px] w-full object-contain" />
        </div>
        
        <div className="text-sm text-gray-600">
          <p><strong>Nome:</strong> {name}</p>
          <p><strong>CPF/RG:</strong> {document}</p>
          <p><strong>Data/Hora:</strong> {new Date().toLocaleString('pt-BR')}</p>
        </div>
        
        <Button variant="outline" size="sm" onClick={() => setSavedDataUrl(null)}>
          Assinar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-white">
      <div>
        <h3 className="font-medium text-[#4D4D4D]">{purposeLabels[purpose]}</h3>
        <div className="mt-2 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
          <p className="whitespace-pre-line">{agreementText}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Input 
          label="Nome Completo" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Digite o nome de quem está assinando"
        />
        <Input 
          label="CPF ou RG" 
          value={document} 
          onChange={(e) => setDocument(e.target.value)} 
          placeholder="000.000.000-00"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#4D4D4D]">Assinatura</label>
        <div className="w-full overflow-hidden rounded-md border border-gray-300 bg-gray-50 touch-none">
          <canvas
            ref={canvasRef}
            className="w-full cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={handleClear}
        >
          Limpar
        </Button>
        <Button 
          variant="primary" 
          className="flex-1" 
          onClick={handleSave}
          disabled={!hasAssinatura || !name || !document}
        >
          Confirmar
        </Button>
      </div>
    </div>
  );
}
