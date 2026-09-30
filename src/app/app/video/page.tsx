'use client';
import { useState } from 'react';
import { Video, StopCircle, Share2 } from 'lucide-react';

export default function VideoLivePage() {
  const [status, setStatus] = useState('Aguardando início');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="p-4 flex justify-between items-center bg-gray-900">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status === 'Ao vivo' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-sm font-semibold">{status}</span>
        </div>
        <span className="font-mono">00:00:00</span>
      </header>
      <main className="flex-1 flex items-center justify-center bg-gray-800 relative">
        <p className="text-gray-400">Preview da Câmera (WebRTC Placeholder)</p>
      </main>
      <footer className="p-6 bg-gray-900 flex justify-center gap-6">
        {status !== 'Ao vivo' ? (
          <button onClick={() => setStatus('Ao vivo')} className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center"><Video className="w-8 h-8"/></button>
        ) : (
          <button onClick={() => setStatus('Encerrado')} className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center"><StopCircle className="w-8 h-8"/></button>
        )}
        <button onClick={() => navigator.clipboard.writeText('link')} className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center"><Share2 className="w-8 h-8"/></button>
      </footer>
    </div>
  );
}
