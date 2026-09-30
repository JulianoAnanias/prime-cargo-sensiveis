'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, ShieldCheck, Mail, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

interface UsuarioItem {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  situacao: string;
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState('motorista');
  const [saving, setSaving] = useState(false);

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const json = await res.json();
        setUsuarios(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email) return;

    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, perfil, situacao: 'ativo' })
      });

      if (res.ok) {
        setShowAddModal(false);
        setNome('');
        setEmail('');
        carregarUsuarios();
      } else {
        alert('Erro ao cadastrar usuário no SharePoint.');
      }
    } catch (err: any) {
      alert('Erro de conexão: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#4D4D4D] flex items-center gap-2">
            Gestão de Usuários & Motoristas
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Controle de acessos sincronizado em tempo real com o Microsoft SharePoint (Cloudlog)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={carregarUsuarios}
            className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F47920] hover:bg-[#E94E1B] text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Novo Usuário</span>
          </button>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold border-b border-gray-200">
              <tr>
                <th className="p-4">Colaborador</th>
                <th className="p-4">E-mail Cadastrado</th>
                <th className="p-4">Perfil de Acesso</th>
                <th className="p-4">Situação</th>
                <th className="p-4 text-right">Armazenamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/80 transition">
                  <td className="p-4 font-bold text-[#4D4D4D]">
                    {u.nome}
                  </td>
                  <td className="p-4 text-gray-600 text-xs">
                    {u.email}
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      u.perfil === 'gestao' || u.perfil === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : u.perfil === 'qualidade'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {u.perfil}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {u.situacao || 'Ativo'}
                    </span>
                  </td>
                  <td className="p-4 text-right text-xs text-gray-400 font-medium">
                    SharePoint Online
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro de Novo Usuário */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-gray-100">
            <h3 className="text-lg font-black text-[#4D4D4D] mb-4">Novo Usuário / Motorista</h3>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">E-mail Cadastrado</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos.motorista@primecargo.com.br"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Perfil</label>
                <select
                  value={perfil}
                  onChange={(e) => setPerfil(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                >
                  <option value="motorista">Motorista / Campo</option>
                  <option value="gestao">Gestão / Operações (ADM)</option>
                  <option value="qualidade">Qualidade (Auditoria IA)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 py-3 bg-[#F47920] hover:bg-[#E94E1B] text-white font-bold rounded-xl text-xs transition shadow-sm"
                >
                  {saving ? 'Gravando...' : 'Salvar no SharePoint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
