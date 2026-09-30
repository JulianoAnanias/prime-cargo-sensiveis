'use client';
export default function VideoViewer() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 bg-gray-800 flex justify-between items-center">
        <h1 className="font-bold text-[#F47920]">Prime Cargo - Transmissão ao Vivo</h1>
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span className="text-xs">Conexão Boa</span></div>
      </header>
      <main className="flex-1 flex items-center justify-center relative">
        <p className="text-gray-500">Aguardando início da transmissão...</p>
      </main>
    </div>
  );
}
