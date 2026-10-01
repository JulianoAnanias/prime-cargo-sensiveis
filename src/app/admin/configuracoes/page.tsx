'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Plus, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  ShieldCheck, 
  Bell, 
  AlertTriangle, 
  Clock, 
  Search, 
  Check, 
  X, 
  Loader2,
  FileText,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailRecipient {
  id: number;
  nome: string;
  email: string;
  tipo: 'todas' | 'avarias_apenas' | 'resumo';
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

interface EmailLog {
  id: number;
  tipo: string;
  destinatarios: string;
  assunto: string;
  status: string;
  detalhes: string;
  criado_em: string;
}

export default function AdminEmailConfigPage() {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modais
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EmailRecipient | null>(null);

  // Formulário
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTipo, setFormTipo] = useState<'todas' | 'avarias_apenas' | 'resumo'>('todas');
  const [formAtivo, setFormAtivo] = useState(true);
  const [saving, setSaving] = useState(false);

  // Envio de teste
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Feedback de ações
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchEmailData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/email/config');
      if (res.ok) {
        const json = await res.json();
        setRecipients(json.data || []);
        setLogs(json.logs || []);
      }
    } catch (err) {
      console.error('Erro ao buscar configurações de email:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailData();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Abrir Modal de Adicionar
  const handleOpenAdd = () => {
    setFormNome('');
    setFormEmail('');
    setFormTipo('todas');
    setFormAtivo(true);
    setShowAddModal(true);
  };

  // Salvar Novo Destinatário
  const handleCreateRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome || !formEmail) return;

    setSaving(true);
    try {
      const res = await fetch('/api/email/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formNome,
          email: formEmail,
          tipo: formTipo,
          ativo: formAtivo,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        showNotification('Destinatário cadastrado com sucesso!');
        fetchEmailData();
      } else {
        const err = await res.json();
        showNotification(err.error || 'Erro ao cadastrar', 'error');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Abrir Modal de Editar
  const handleOpenEdit = (item: EmailRecipient) => {
    setEditingItem(item);
    setFormNome(item.nome);
    setFormEmail(item.email);
    setFormTipo(item.tipo);
    setFormAtivo(item.ativo);
    setShowEditModal(true);
  };

  // Salvar Edição
  const handleUpdateRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSaving(true);
    try {
      const res = await fetch('/api/email/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          nome: formNome,
          email: formEmail,
          tipo: formTipo,
          ativo: formAtivo,
        }),
      });

      if (res.ok) {
        setShowEditModal(false);
        setEditingItem(null);
        showNotification('Destinatário atualizado com sucesso!');
        fetchEmailData();
      } else {
        const err = await res.json();
        showNotification(err.error || 'Erro ao atualizar', 'error');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Alternar Status Ativo / Inativo
  const handleToggleStatus = async (item: EmailRecipient) => {
    try {
      const res = await fetch('/api/email/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          ativo: !item.ativo,
        }),
      });

      if (res.ok) {
        showNotification(`Destinatário ${!item.ativo ? 'ativado' : 'desativado'} com sucesso!`);
        fetchEmailData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Excluir Destinatário
  const handleDeleteRecipient = async (id: number) => {
    if (!confirm('Deseja realmente remover este e-mail da lista de notificações?')) return;

    try {
      const res = await fetch(`/api/email/config?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showNotification('Destinatário removido com sucesso!');
        fetchEmailData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Enviar E-mail de Teste
  const handleSendTestEmail = async () => {
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setTestResult({
          success: true,
          message: 'E-mail de teste formatado e processado com sucesso para os destinatários ativos!',
        });
        fetchEmailData();
      } else {
        setTestResult({
          success: false,
          message: json.error || 'Falha ao processar e-mail de teste.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Erro de comunicação ao enviar teste: ' + err.message,
      });
    } finally {
      setSendingTest(false);
    }
  };

  const filteredRecipients = recipients.filter(r => 
    r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAtivos = recipients.filter(r => r.ativo).length;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Feedback Toast */}
      {feedback && (
        <div className={cn(
          "fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white transition-all transform animate-bounce",
          feedback.type === 'success' ? "bg-emerald-600" : "bg-red-600"
        )}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#F47920]/10 text-[#F47920] rounded-xl">
              <Mail className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-[#4D4D4D]">
              Gestão de Disparos de E-mail Automáticos
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Controle dos destinatários que recebem as vistorias e alertas de avarias em tempo real assim que os cards são concluídos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchEmailData}
            className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition shadow-sm"
            title="Atualizar lista"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>

          <button
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Send className="w-4 h-4" />
            <span>Enviar E-mail de Teste</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F47920] hover:bg-[#E94E1B] text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Destinatário</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas e Status Operacional */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Destinatários</p>
            <h3 className="text-2xl font-black text-[#4D4D4D] mt-1">{recipients.length}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Cadastrados no banco</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#F47920] flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Recebendo Disparos</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{totalAtivos}</h3>
            <p className="text-[11px] text-emerald-600 mt-0.5">Destinatários ativos</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Disparos em Vistorias</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">{logs.length}</h3>
            <p className="text-[11px] text-blue-600 mt-0.5">Notificações auditadas</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Disparo Automático</p>
            <h3 className="text-sm font-black text-emerald-600 mt-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              HABILITADO
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Ao concluir qualquer card</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Regra de Disparo / Banner Explicativo */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#F47920] text-white rounded-xl shrink-0 mt-0.5">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#4D4D4D] uppercase tracking-wide">
              Como funciona o disparo automático de e-mails?
            </h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Sempre que um motorista ou conferencista conclui um card de vistoria (seja de <strong>Coleta</strong>, <strong>Entrega</strong> ou <strong>Transferência</strong>), o servidor compila o relatório oficial em HTML formatado — com dados do cliente, NF/CT-e, fotos, assinaturas digitais, GPS e indicativo de avaria — e dispara imediatamente para todos os e-mails ativos cadastrados abaixo.
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de Destinatários Cadastrados */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50">
          <h2 className="text-sm font-black text-[#4D4D4D] uppercase tracking-wider flex items-center gap-2">
            <span>Lista de Destinatários Ativos</span>
            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full font-bold">
              {filteredRecipients.length}
            </span>
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#4D4D4D] focus:outline-none focus:ring-2 focus:ring-[#F47920]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 text-[11px] uppercase font-bold border-b border-gray-200">
              <tr>
                <th className="p-4">Destinatário / Setor</th>
                <th className="p-4">E-mail Cadastrado</th>
                <th className="p-4">Regra de Envio</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecipients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 text-xs">
                    {loading ? 'Carregando destinatários...' : 'Nenhum e-mail localizado com este filtro.'}
                  </td>
                </tr>
              ) : (
                filteredRecipients.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition">
                    <td className="p-4">
                      <div className="font-bold text-[#4D4D4D] flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{item.nome}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-gray-600 select-all">
                        {item.email}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.tipo === 'todas' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold">
                          <Check className="w-3.5 h-3.5" /> Todas as Vistorias
                        </span>
                      ) : item.tipo === 'avarias_apenas' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Somente com Avaria / NC
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" /> Resumo Diário
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold transition",
                          item.ativo 
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        )}
                        title="Clique para alternar status"
                      >
                        {item.ativo ? '● Ativo' : '○ Inativo'}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar destinatário"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecipient(item.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Excluir da lista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Histórico Recente de Disparos de E-mail (Audit Log) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-black text-[#4D4D4D] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>Histórico Recente de Disparos (Auditoria)</span>
          </h2>
          <span className="text-xs text-gray-400">Últimos {logs.length} envios registrados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-600 uppercase font-bold border-b border-gray-200">
              <tr>
                <th className="p-3">Data / Hora</th>
                <th className="p-3">Assunto do E-mail</th>
                <th className="p-3">Destinatários</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-400 font-sans">
                    Nenhum disparo registrado até o momento. Conclua uma vistoria ou execute o teste de envio acima.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-500 whitespace-nowrap">
                      {new Date(log.criado_em).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3 font-sans font-bold text-gray-800">
                      {log.assunto}
                    </td>
                    <td className="p-3 text-gray-600 truncate max-w-xs" title={log.destinatarios}>
                      {log.destinatarios}
                    </td>
                    <td className="p-3 text-center font-sans">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        log.status === 'enviado' ? "bg-emerald-100 text-emerald-800" :
                        log.status === 'simulado' ? "bg-blue-100 text-blue-800" :
                        "bg-red-100 text-red-800"
                      )}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Adicionar Destinatário */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-gray-100 animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-[#4D4D4D]">Novo Destinatário de Vistorias</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecipient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nome do Responsável / Setor *</label>
                <input
                  type="text"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Ex: Gestão de Operações Prime Cargo"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">E-mail Corporativo *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="operacoes@primecargo.com.br"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Regra de Disparo</label>
                <select
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value as any)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                >
                  <option value="todas">Todas as Vistorias (Conformes e com Avarias)</option>
                  <option value="avarias_apenas">Somente Alertas de Avarias / Não Conformidades</option>
                  <option value="resumo">Resumo Operacional</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-ativo-add"
                  checked={formAtivo}
                  onChange={(e) => setFormAtivo(e.target.checked)}
                  className="w-4 h-4 text-[#F47920] rounded focus:ring-[#F47920]"
                />
                <label htmlFor="chk-ativo-add" className="text-xs font-bold text-gray-700">
                  Ativar recebimento imediato de e-mails
                </label>
              </div>

              <div className="flex gap-2 pt-3">
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
                  <span>{saving ? 'Gravando...' : 'Cadastrar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Editar Destinatário */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-gray-100 animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-[#4D4D4D]">Editar Destinatário</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRecipient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nome do Responsável / Setor *</label>
                <input
                  type="text"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">E-mail Corporativo *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Regra de Disparo</label>
                <select
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value as any)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F47920]"
                >
                  <option value="todas">Todas as Vistorias (Conformes e com Avarias)</option>
                  <option value="avarias_apenas">Somente Alertas de Avarias / Não Conformidades</option>
                  <option value="resumo">Resumo Operacional</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-ativo-edit"
                  checked={formAtivo}
                  onChange={(e) => setFormAtivo(e.target.checked)}
                  className="w-4 h-4 text-[#F47920] rounded focus:ring-[#F47920]"
                />
                <label htmlFor="chk-ativo-edit" className="text-xs font-bold text-gray-700">
                  Destinatário Ativo (recebendo notificações)
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
                  <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Disparo de E-mail de Teste */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-gray-100 animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Send className="w-5 h-5" />
                <h3 className="text-lg font-black text-[#4D4D4D]">Disparo de Teste</h3>
              </div>
              <button onClick={() => setShowTestModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Ao clicar no botão abaixo, o sistema irá gerar uma notificação simulada de vistoria oficial e processar o envio para todos os <strong>{totalAtivos} destinatário(s) ativos</strong> da lista.
            </p>

            {testResult && (
              <div className={cn(
                "p-3.5 rounded-xl mb-4 text-xs font-bold border flex items-start gap-2",
                testResult.success 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                  : "bg-red-50 border-red-200 text-red-800"
              )}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="w-1/2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={sendingTest || totalAtivos === 0}
                className="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5"
              >
                {sendingTest && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{sendingTest ? 'Enviando...' : 'Enviar Teste Agora'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
