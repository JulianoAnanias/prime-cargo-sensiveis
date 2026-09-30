'use client';
export default function AdminUsuarios() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] p-8">
      <h1 className="text-2xl font-bold text-[#4D4D4D] mb-6">Gestão de Usuários</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600"><tr><th className="p-4">Nome</th><th className="p-4">Email</th><th className="p-4">Perfil</th><th className="p-4">Situação</th><th className="p-4">Ações</th></tr></thead>
          <tbody>
            <tr className="border-t hover:bg-gray-50">
              <td className="p-4">João Motorista</td><td className="p-4">joao@prime.com</td><td className="p-4">Motorista</td><td className="p-4">Ativo</td><td className="p-4"><button className="text-blue-500">Editar</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
