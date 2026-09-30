'use client';
export default function OperacaoDetalhe() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] p-8">
      <h1 className="text-2xl font-bold text-[#4D4D4D] mb-6">Operação #12345</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-bold text-lg mb-4">Detalhes</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Cliente:</span> Cliente S/A</div>
              <div><span className="text-gray-500">Documento:</span> NF 12345</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-bold text-lg mb-4">Galeria de Fotos</h2>
            <div className="grid grid-cols-4 gap-2">
              <div className="aspect-square bg-gray-200 rounded"></div>
              <div className="aspect-square bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-bold text-lg mb-4">Linha do Tempo</h2>
            <div className="border-l-2 border-[#F47920] ml-3 pl-4 space-y-4">
              <div className="relative"><div className="w-3 h-3 bg-[#F47920] rounded-full absolute -left-[23px] top-1"></div><p className="text-sm font-bold">Vistoria Iniciada</p><p className="text-xs text-gray-500">14:00</p></div>
              <div className="relative"><div className="w-3 h-3 bg-[#F47920] rounded-full absolute -left-[23px] top-1"></div><p className="text-sm font-bold">Concluído</p><p className="text-xs text-gray-500">14:30</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
