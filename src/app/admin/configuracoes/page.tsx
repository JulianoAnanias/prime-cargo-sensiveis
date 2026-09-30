'use client';
export default function AdminConfig() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] p-8">
      <h1 className="text-2xl font-bold text-[#4D4D4D] mb-6">Configurações do Sistema</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-bold mb-4">Grupos de Email (Sensíveis)</h2>
          <textarea className="w-full border rounded p-2 text-sm" rows={5} placeholder="email1@prime.com, email2@prime.com"></textarea>
          <button className="mt-4 bg-[#F47920] text-white px-4 py-2 rounded">Salvar</button>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-bold mb-4">Configurações de App</h2>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Exigir fotos mínimas (Frontal/Lacre)</label>
        </div>
      </div>
    </div>
  );
}
