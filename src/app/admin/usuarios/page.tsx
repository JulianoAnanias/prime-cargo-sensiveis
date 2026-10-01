'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  KeyRound, 
  Loader2, 
  Lock, 
  Check, 
  Eye, 
  EyeOff 
} from 'lucide-react';

interface UsuarioItem {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  situacao: string;
  hasPassword?: boolean;
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal de Criação
  const [showAddModal, setShowAddModal] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState('motorista');
  const [initialPassword, setInitialPassword] = useState('');
  const [saving, setSaving] = useState(false);

  // Modal de Edição Básica
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UsuarioItem | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPerfil, setEditPerfil] = useState('motorista');
  const [editSituacao, setEditSituacao] = useState('ativo');
  const [updating, setUpdating] = useState(false);

  // Modal de Gestão de Senha
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState<UsuarioItem | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordActionSuccess, setPasswordActionSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Modal de Confirmação de Exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UsuarioItem | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  // Cadastrar Novo Usuário
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email) return;

    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nome, 
          email, 
          perfil, 
          situacao: 'ativo',
          senha: initialPassword || undefined
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setNome('');
        setEmail('');
        setInitialPassword('');
        carregarUsuarios();
      } else {
        const err = await res.json();
        alert('Erro ao cadastrar usuário no SharePoint: ' + (err.error || ''));
      }
    } catch (err: any) {
      alert('Erro de conexão: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Abrir Modal de Edição
  const openEditModal = (user: UsuarioItem) => {
    setEditingUser(user);
    setEditNome(user.nome);
    setEditEmail(user.email);
    setEditPerfil(user.perfil || 'motorista');
    setEditSituacao(user.situacao || 'ativo');
    setShowEditModal(true);
  };

  // Salvar Alteração do Usuário
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: editNome,
          email: editEmail,
          perfil: editPerfil,
          situacao: editSituacao,
        })
      });

      if (res.ok) {
        setShowEditModal(false);
        setEditingUser(null);
        carregarUsuarios();
      } else {
        const err = await res.json();
        alert('Erro ao atualizar usuário: ' + (err.error || ''));
      }
    } catch (err: any) {
      alert('Erro de comunicação: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Abrir Modal de Gestão de Senha
  const openPasswordModal = (user: UsuarioItem) => {
    setPasswordUser(user);
    setNewPassword('');
    setPasswordActionSuccess(null);
    setShowPasswordModal(true);
  };

  // Definir Nova Senha pelo Painel ADM
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser) return;

    if (!newPassword || newPassword.length < 6) {
      alert('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch(`/api/users/${passwordUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novaSenha: newPassword })
      });

      if (res.ok) {
        setPasswordActionSuccess('Nova senha salva com sucesso no SharePoint!');
        setNewPassword('');
        carregarUsuarios();
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordActionSuccess(null);
        }, 1500);
      } else {
        const err = await res.json();
        alert('Erro ao salvar nova senha: ' + (err.error || ''));
      }
    } catch (err: any) {
      alert('Erro de comunicação: ' + err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Resetar Senha (Zerar para forçar Primeiro Acesso)
  const handleResetPassword = async () => {
    if (!passwordUser) return;

    const confirmReset = window.confirm(
      `Deseja zerar a senha de ${passwordUser.nome}? No próximo login, o usuário terá que cadastrar uma nova senha (Primeiro Acesso).`
    );
    if (!confirmReset) return;

    setPasswordLoading(true);
    try {
      const res = await fetch(`/api/users/${passwordUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetPassword: true })
      });

      if (res.ok) {
        setPasswordActionSuccess('Senha zerada! O usuário fará o Primeiro Acesso no próximo login.');
        carregarUsuarios();
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordActionSuccess(null);
        }, 1800);
      } else {
        const err = await res.json();
        alert('Erro ao resetar senha: ' + (err.error || ''));
      }
    } catch (err: any) {
      alert('Erro de comunicação: ' + err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Abrir Modal de Exclusão
  const openDeleteModal = (user: UsuarioItem) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  // Confirmar Exclusão no SharePoint
  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setShowDeleteModal(false);
        setDeletingUser(null);
        carregarUsuarios();
      } else {
        const err = await res.json();
        alert('Erro ao excluir usuário: ' + (err.error || ''));
      }
    } catch (err: any) {
      alert('Erro de comunicação: ' + err.message);
    } finally {
      setDeleting(false);
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
            Controle de acessos e credenciais sincronizado em tempo real com o SharePoint
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

      {/* Tabela de Usuários com Status de Senha e Ações */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold border-b border-gray-200">
              <tr>
                <th className="p-4">Colaborador</th>
                <th className="p-4">E-mail Cadastrado</th>
                <th className="p-4">Perfil</th>
                <th className="p-4">Situação</th>
                <th className="p-4">Gestão de Senha</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((u) => {
                const isAtivo = (u.situacao || 'ativo').toLowerCase() === 'ativo';
                return (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-4 font-bold text-[#4D4D4D]">
                      {u.nome}
                    </td>
                    <td className="p-4 text-gray-600 text-xs font-mono">
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
                      {isAtivo ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          <XCircle className="w-3.5 h-3.5" /> Inativo
                        </span>
                      )}
                    </td>
                    {/* Status e Gestão de Senha */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {u.hasPassword ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <KeyRound className="w-3 h-3 text-emerald-600" /> Senha Definida
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> 1º Acesso Pendente
                          </span>
                        )}

                        <button
                          onClick={() => openPasswordModal(u)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-[#F47920] transition"
                          title="Gerenciar Senha deste Usuário"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    {/* Ações: Alterar / Excluir */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition"
                          title="Alterar dados do usuário"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                          <span>Alterar</span>
                        </button>
                        <button
                          onClick={() => openDeleteModal(u)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition border border-red-200"
                          title="Excluir usuário do SharePoint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Cadastro de Novo Usuário */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-gray-100">
            <h3 className="text-lg font-black text-[#4D4D4D] mb-4">Novo Usuário / Motorista</h3>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nome Completo *</label>
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
                <label className="block text-xs font-bold text-gray-600 mb-1">E-mail Cadastrado *</label>
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
                <label className="block text-xs font-bold text-gray-600 mb-1">Perfil de Acesso</label>
                <select
                  value={perfil}
                  onChange={(e) => setPerfil(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                >
                  <option value="gestao">Gestão / Operações (Painel ADM)</option>
                  <option value="qualidade">Qualidade (Auditoria & Relatórios)</option>
                  <option value="motorista">Motorista / Conferente (App Mobile)</option>
                </select>
              </div>

              {perfil !== 'motorista' ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Autenticação Microsoft (Entra ID)</p>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      Usuários de Gestão com e-mail <strong>@primecargo</strong> ou <strong>@primestorage</strong> autenticam diretamente pelo botão da Microsoft. O acesso é liberado automaticamente após este cadastro.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Senha Provisória (Opcional)
                  </label>
                  <input
                    type="password"
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    placeholder="Deixe em branco para o motorista criar no 1º acesso"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                    minLength={6}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Se não definir, o motorista cadastrará sua própria senha na primeira vez que entrar.
                  </p>
                </div>
              )}

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
                  className="w-1/2 py-3 bg-[#F47920] hover:bg-[#E94E1B] text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{saving ? 'Gravando...' : 'Salvar no SharePoint'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Alteração de Dados do Usuário */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-[#4D4D4D]">Alterar Usuário</h3>
              <span className="text-[11px] font-mono text-gray-400">ID: {editingUser.id}</span>
            </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">E-mail Cadastrado</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Perfil</label>
                  <select
                    value={editPerfil}
                    onChange={(e) => setEditPerfil(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  >
                    <option value="motorista">Motorista</option>
                    <option value="gestao">Gestão (ADM)</option>
                    <option value="qualidade">Qualidade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Situação</label>
                  <select
                    value={editSituacao}
                    onChange={(e) => setEditSituacao(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-1/2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-1/2 py-3 bg-[#F47920] hover:bg-[#E94E1B] text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{updating ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Gestão de Senha do Usuário */}
      {showPasswordModal && passwordUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-gray-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 text-[#F47920] rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#4D4D4D]">Gestão de Senha</h3>
                  <p className="text-xs text-gray-500">{passwordUser.nome}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            {passwordActionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordActionSuccess}</span>
              </div>
            )}

            {/* Status Atual */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
              <span className="font-bold text-gray-700 block mb-1">Status da Credencial:</span>
              {passwordUser.hasPassword ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Este usuário já possui uma senha ativa cadastrada.
                </span>
              ) : (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Este usuário ainda não possui senha (fará o Primeiro Acesso).
                </span>
              )}
            </div>

            {/* Opção A: Definir Nova Senha Direta */}
            <form onSubmit={handleSetNewPassword} className="space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Definir Nova Senha Direta
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha (mín. 6 dígitos)"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F47920] focus:bg-white transition"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={passwordLoading || newPassword.length < 6}
                className="w-full py-2.5 bg-[#F47920] hover:bg-[#E94E1B] disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5"
              >
                {passwordLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Gravar Nova Senha no SharePoint</span>
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold text-gray-400 uppercase">ou</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Opção B: Resetar Senha (Zerar para forçar primeiro acesso) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Resetar para Primeiro Acesso
              </label>
              <p className="text-[11px] text-gray-500">
                Limpa a senha atual no SharePoint para que o motorista cadastre sua nova senha no próximo login.
              </p>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={passwordLoading}
                className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                <span>Zerar Senha (Forçar 1º Acesso)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Confirmação de Exclusão */}
      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm border border-gray-100 text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-black text-[#4D4D4D]">Excluir Usuário?</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Você tem certeza que deseja remover <strong>{deletingUser.nome}</strong> ({deletingUser.email})? 
                Esta ação removerá o registro diretamente do SharePoint e revogará o acesso imediatamente.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-1/2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleting}
                className="w-1/2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{deleting ? 'Excluindo...' : 'Sim, Excluir'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
