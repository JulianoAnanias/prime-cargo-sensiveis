'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, X } from 'lucide-react';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  accuracy?: number;
  date?: string;
  driver?: string;
  client?: string;
  address?: string;
}

export function LocationMap({
  latitude,
  longitude,
  accuracy,
  date,
  driver,
  client,
  address,
}: LocationMapProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const delta = 0.004;
  const bbox = `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const wazeUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;

  return (
    <>
      {/* Mini Card no Item da Entrega */}
      <div className="mt-3 p-3 bg-orange-50/60 border border-[#F47920]/30 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#F47920]">
            <MapPin className="w-4 h-4 text-[#F47920] flex-shrink-0 animate-bounce" />
            <span>Ponto da Baixa Registrado Automaticamente</span>
          </div>
          {accuracy && (
            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border text-gray-600 font-medium">
              Precisão: ~{accuracy}m
            </span>
          )}
        </div>

        <div className="text-[11px] text-gray-600 flex flex-wrap gap-x-3 gap-y-1">
          <span>Lat: {latitude.toFixed(5)}</span>
          <span>Lng: {longitude.toFixed(5)}</span>
          {date && <span>Horário: {date}</span>}
        </div>

        {/* Prévia do Mini Mapa */}
        <div
          onClick={() => setModalOpen(true)}
          className="relative h-28 w-full rounded-lg overflow-hidden border border-gray-200 cursor-pointer group shadow-inner"
        >
          <iframe
            title="Mapa da Baixa"
            src={embedUrl}
            className="w-full h-full border-0 pointer-events-none"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 flex items-center justify-center transition-colors">
            <span className="bg-white/95 text-[#4D4D4D] font-bold text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#F47920]" />
              Ver Ponto no Mapa
            </span>
          </div>
        </div>
      </div>

      {/* Modal do Mapa Ampliado */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#F47920]" />
                  Localização Exata da Baixa
                </h3>
                <p className="text-[11px] text-gray-400">
                  {client || 'Entrega Concluída'} {date ? `— ${date}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Iframe Mapa Expandido */}
            <div className="relative h-64 sm:h-80 w-full bg-gray-100">
              <iframe
                title="Mapa Ampliado da Baixa"
                src={embedUrl}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>

            {/* Detalhes & Ações */}
            <div className="p-4 bg-gray-50 border-t space-y-3">
              <div className="text-xs text-gray-700 space-y-1">
                {driver && <p><span className="font-bold">Motorista:</span> {driver}</p>}
                {address && <p><span className="font-bold">Local:</span> {address}</p>}
                <p>
                  <span className="font-bold">Coordenadas:</span> {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  {accuracy && ` (Precisão do GPS: ${accuracy} metros)`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir no Google Maps
                </a>
                <a
                  href={wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Abrir no Waze
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
