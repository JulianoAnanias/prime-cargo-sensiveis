'use client';
export default function AdminDashboard() {
  const cards = [
    { title: 'Aguardando próxima etapa', count: 12 },
    { title: 'Entregas parciais', count: 3 },
    { title: 'Reconferências pendentes', count: 5 },
    { title: 'Doc/Anexos incompletos', count: 2 },
    { title: 'Assinaturas pendentes', count: 8 },
    { title: 'Ações da Qualidade', count: 1 },
    { title: 'Falhas de processamento', count: 0 },
    { title: 'Envios pendentes', count: 4 },
  ];
  return (
    <div className="min-h-screen bg-[#F5F5F5] p-8">
      <h1 className="text-2xl font-bold text-[#4D4D4D] mb-8">Dashboard Gestão Prime Cargo</h1>
      <div className="grid grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#F47920]">
            <p className="text-sm text-gray-500 font-semibold h-10">{c.title}</p>
            <p className="text-3xl font-bold text-[#4D4D4D] mt-2">{c.count}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-[#4D4D4D] mb-4">Feed de Atividades Recentes</h2>
        <div className="space-y-4">
          <p className="text-sm border-b pb-2">Vistoria #1234 concluída por João Motorista (há 5 min)</p>
          <p className="text-sm border-b pb-2">Nova reconferência solicitada para Cliente S/A (há 12 min)</p>
        </div>
      </div>
    </div>
  );
}
