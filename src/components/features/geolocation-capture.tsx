'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, MapPinned, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  timestamp: number;
}

interface GeolocationCaptureProps {
  onCapture?: (data: GeolocationData) => void;
  required?: boolean;
}

type GeoState = 'idle' | 'capturing' | 'captured' | 'denied' | 'unavailable' | 'imprecise';

export function GeolocationCapture({ onCapture, required = false }: GeolocationCaptureProps) {
  const [status, setStatus] = useState<GeoState>('idle');
  const [data, setData] = useState<GeolocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleCapture = () => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      setErrorMsg('Geolocalização não é suportada por este navegador.');
      return;
    }

    setStatus('capturing');
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const capturedData = {
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp,
        };
        
        setData(capturedData);
        
        // Let's say precision worse than 1000m is imprecise
        if (accuracy > 1000) {
          setStatus('imprecise');
          setErrorMsg('A precisão da localização está muito baixa. Tente novamente em local aberto.');
        } else {
          setStatus('captured');
        }

        if (onCapture) {
          onCapture(capturedData);
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setStatus('denied');
            setErrorMsg('Permissão de localização negada pelo usuário.');
            break;
          case error.POSITION_UNAVAILABLE:
            setStatus('unavailable');
            setErrorMsg('Informações de localização indisponíveis.');
            break;
          case error.TIMEOUT:
            setStatus('unavailable');
            setErrorMsg('Tempo esgotado ao obter localização.');
            break;
          default:
            setStatus('unavailable');
            setErrorMsg('Ocorreu um erro desconhecido ao obter a localização.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-3 rounded-lg border p-4 bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#4D4D4D]">
          Localização <span className="text-xs text-gray-500 font-normal">{required && '(Obrigatório)'}</span>
        </h3>
        
        {status === 'captured' && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <MapPinned className="h-3 w-3" />
            Registrada
          </span>
        )}
      </div>

      {!data && (
        <Button 
          type="button" 
          variant={status === 'capturing' ? 'secondary' : 'outline'}
          fullWidth
          onClick={handleCapture}
          disabled={status === 'capturing'}
        >
          {status === 'capturing' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Obtendo localização...
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Registrar Localização
            </>
          )}
        </Button>
      )}

      {data && (
        <div className={cn(
          "rounded-md border p-3 text-sm",
          status === 'imprecise' ? "border-yellow-200 bg-yellow-50" : "border-gray-200 bg-gray-50"
        )}>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500 block">Latitude:</span>
              <span className="font-medium">{data.latitude.toFixed(6)}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Longitude:</span>
              <span className="font-medium">{data.longitude.toFixed(6)}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Precisão:</span>
              <span className={cn("font-medium", data.accuracy > 1000 ? "text-yellow-600" : "")}>
                ±{Math.round(data.accuracy)}m
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Horário:</span>
              <span className="font-medium">{new Date(data.timestamp).toLocaleTimeString('pt-BR')}</span>
            </div>
          </div>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="mt-2 w-full text-xs"
            onClick={handleCapture}
          >
            Atualizar Localização
          </Button>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}
    </div>
  );
}
