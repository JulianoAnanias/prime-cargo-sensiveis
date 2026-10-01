'use client';

import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  Scale, 
  Box, 
  Maximize,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  categoria: string;
  capacidadePesoKg: number;
  comprimentoMetros: number;
  larguraMetros: number;
  alturaMetros: number;
  cubagemM3?: number;
  status: 'ativo' | 'inativo' | 'manutencao';
  observacoes?: string;
}

const CATEGORIAS_VEICULO = [
  'VUC',
  'Toco',
  'Truck',
  'Carreta',
  'Bitrem',
  'Van/Fiorino',
  'Outro'
];

export default function VeiculosAdminPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todos');

  // Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    categoria: 'VUC',
    capacidadePesoKg: 3500,
    comprimentoMetros: 4.5,
    larguraMetros: 2.2,
    alturaMetros: 2.3,
    status: 'ativo' as 'ativo' | 'inativo' | 'manutencao',
    observacoes: ''
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Carrega veículos da API
  const fetchVeiculos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/veiculos');
      if (res.ok) {
        const json = await res.json();
        setVeiculos(json.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar veículos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVeiculos();
  }, []);

  const openCreateModal = () => {
    setEditingVeiculo(null);
    setFormData({
      placa: '',
      modelo: '',
      categoria: 'VUC',
      capacidadePesoKg: 3500,
      comprimentoMetros: 4.5,
      larguraMetros: 2.2,
      alturaMetros: 2.3,
      status: 'ativo',
      observacoes: ''
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (veic: Veiculo) => {
    setEditingVeiculo(veic);
    setFormData({
      placa: veic.placa,
      modelo: veic.modelo,
      categoria: veic.categoria,
      capacidadePesoKg: veic.capacidadePesoKg,
      comprimentoMetros: veic.comprimentoMetros,
      larguraMetros: veic.larguraMetros,
      alturaMetros: veic.alturaMetros,
      status: veic.status,
      observacoes: veic.observacoes || ''
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placa || !formData.modelo) {
      setModalError('Placa e Modelo são obrigatórios.');
      return;
    }

    setSaving(true);
    setModalError(null);

    try {
      const url = editingVeiculo ? `/api/veiculos/${editingVeiculo.id}` : '/api/veiculos';
      const method = editingVeiculo ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error || 'Erro ao salvar veículo.');
        return;
      }

      setFeedbackMsg({
        type: 'success',
        text: editingVeiculo ? 'Veículo atualizado com sucesso!' : 'Veículo cadastrado com sucesso!'
      });
      setTimeout(() => setFeedbackMsg(null), 4000);

      setIsModalOpen(false);
      fetchVeiculos();
    } catch (err: any) {
      setModalError('Erro de conexão ao salvar veículo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, placa: string) => {
    if (!confirm(`Deseja realmente excluir o veículo com placa ${placa}?`)) return;

    try {
      const res = await fetch(`/api/veiculos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedbackMsg({ type: 'success', text: `Veículo ${placa} excluído com sucesso!` });
        setTimeout(() => setFeedbackMsg(null), 4000);
        fetchVeiculos();
      } else {
        alert('Não foi possível excluir o veículo.');
      }
    } catch (err) {
      alert('Erro de conexão ao excluir.');
    }
  };

  // Cálculo da cubagem no formulário
  const calculatedCubagem = Number(
    (formData.comprimentoMetros * formData.larguraMetros * formData.alturaMetros).toFixed(2)
  );

  // Filtragem
  const filteredVeiculos = veiculos.filter(v => {
    const matchesSearch = 
      v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modelo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = selectedCategoria === 'todos' || v.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#4D4D4D] flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-[#F47920]" />
            <span>Gestão da Frota de Veículos</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Cadastro de veículos com especificações técnicas de peso, dimensões do baú e volumetria
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-[#F47920] hover:bg-[#E94E1B] text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm transition text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Veículo</span>
        </button>
      </div>

      {/* Alerta de Feedback */}
      {feedbackMsg && (
        <div className={cn(
          "p-4 rounded-xl border flex items-center gap-2 text-xs",
          feedbackMsg.type === 'success' ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
        )}>
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por placa ou modelo..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F47920]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-xs font-semibold text-gray-500 shrink-0">Categoria:</span>
          <button
            onClick={() => setSelectedCategoria('todos')}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-bold transition shrink-0",
              selectedCategoria === 'todos' ? "bg-[#F47920] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Todas ({veiculos.length})
          </button>
          {CATEGORIAS_VEICULO.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoria(cat)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition shrink-0",
                selectedCategoria === cat ? "bg-[#F47920] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Veículos */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#F47920] mb-2" />
            <p className="text-xs">Carregando frota de veículos...</p>
          </div>
        ) : filteredVeiculos.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Truck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-600">Nenhum veículo encontrado.</p>
            <p className="text-xs text-gray-400 mt-1">Clique em "Cadastrar Novo Veículo" para adicionar à frota.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Placa</th>
                  <th className="py-3.5 px-4">Modelo / Descrição</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Capacidade (Peso)</th>
                  <th className="py-3.5 px-4">Dimensões do Baú (C x L x A)</th>
                  <th className="py-3.5 px-4">Cubagem</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVeiculos.map((v) => (
                  <tr key={v.id} className="hover:bg-orange-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#4D4D4D]">
                      {v.placa}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      {v.modelo}
                      {v.observacoes && (
                        <span className="block text-[10px] text-gray-400 truncate max-w-xs">{v.observacoes}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block bg-orange-100 text-[#F47920] font-bold px-2 py-0.5 rounded-md text-[11px]">
                        {v.categoria}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-700">
                      {v.capacidadePesoKg ? `${v.capacidadePesoKg.toLocaleString('pt-BR')} kg` : 'N/D'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 font-mono">
                      {v.comprimentoMetros}m x {v.larguraMetros}m x {v.alturaMetros}m
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700 font-mono">
                      {v.cubagemM3 ? `${v.cubagemM3} m³` : 'N/D'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded-full font-bold text-[10px] uppercase",
                        v.status === 'ativo' ? "bg-emerald-100 text-emerald-800" :
                        v.status === 'manutencao' ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
                      )}>
                        {v.status === 'ativo' ? 'Ativo' : v.status === 'manutencao' ? 'Manutenção' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(v)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Editar especificações"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id, v.placa)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Excluir veículo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Cadastro / Edição de Veículo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#F47920]" />
                  <span>{editingVeiculo ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Preencha os dados técnicos da unidade de transporte
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Placa do Veículo *
                  </label>
                  <input
                    type="text"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                    placeholder="Ex: ABC-1D23"
                    className="w-full uppercase font-mono font-bold p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F47920] focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#F47920] focus:bg-white focus:outline-none"
                    required
                  >
                    {CATEGORIAS_VEICULO.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Modelo / Fabricante / Carroceria *
                </label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  placeholder="Ex: Mercedes-Benz Accelo 1016 Baú Refrigerado"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F47920] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              {/* Especificações de Peso e Dimensões */}
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-3">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#F47920]" />
                  <span>Capacidade & Medidas do Baú</span>
                </span>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Capacidade Máxima de Peso (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.capacidadePesoKg}
                    onChange={(e) => setFormData({ ...formData, capacidadePesoKg: Number(e.target.value) })}
                    placeholder="Ex: 4500"
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#F47920] focus:outline-none"
                    min={0}
                    step={100}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Comprimento (m)
                    </label>
                    <input
                      type="number"
                      value={formData.comprimentoMetros}
                      onChange={(e) => setFormData({ ...formData, comprimentoMetros: Number(e.target.value) })}
                      placeholder="Ex: 5.2"
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#F47920] focus:outline-none"
                      min={0}
                      step={0.1}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Largura (m)
                    </label>
                    <input
                      type="number"
                      value={formData.larguraMetros}
                      onChange={(e) => setFormData({ ...formData, larguraMetros: Number(e.target.value) })}
                      placeholder="Ex: 2.2"
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#F47920] focus:outline-none"
                      min={0}
                      step={0.1}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Altura (m)
                    </label>
                    <input
                      type="number"
                      value={formData.alturaMetros}
                      onChange={(e) => setFormData({ ...formData, alturaMetros: Number(e.target.value) })}
                      placeholder="Ex: 2.4"
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#F47920] focus:outline-none"
                      min={0}
                      step={0.1}
                      required
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-orange-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                    <Box className="w-4 h-4 text-[#F47920]" />
                    <span>Cubagem Calculada:</span>
                  </span>
                  <span className="font-bold font-mono text-emerald-700 text-sm">
                    {calculatedCubagem} m³
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Situação Operacional
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#F47920] focus:bg-white focus:outline-none"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="manutencao">Em Manutenção</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Observações Internas
                  </label>
                  <input
                    type="text"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Ex: Plataforma elevatória, suspensão pneumática"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F47920] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-xs font-bold bg-[#F47920] hover:bg-[#E94E1B] text-white rounded-xl shadow-md transition disabled:opacity-60 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingVeiculo ? 'Salvar Alterações' : 'Cadastrar Veículo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
