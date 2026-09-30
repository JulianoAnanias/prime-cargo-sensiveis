'use client';

import { useState, useCallback } from 'react';

type GeolocationStatus = 'idle' | 'capturing' | 'captured' | 'denied' | 'unavailable' | 'imprecise';

export function useGeolocation() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const capture = useCallback(() => {
    setStatus('capturing');
    setError(null);

    if (!navigator.geolocation) {
      setStatus('unavailable');
      setError('Geolocalização não é suportada por este navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAccuracy(position.coords.accuracy);
        setTimestamp(position.timestamp);
        
        // Define warning if accuracy is poor (e.g. > 100 meters)
        if (position.coords.accuracy > 100) {
          setStatus('imprecise');
        } else {
          setStatus('captured');
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setError('Permissão negada para acessar a localização.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setStatus('unavailable');
          setError('Informação de localização não está disponível.');
        } else {
          setStatus('unavailable');
          setError('Tempo de requisição esgotado ou erro desconhecido.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  return { latitude, longitude, accuracy, timestamp, status, error, capture };
}
