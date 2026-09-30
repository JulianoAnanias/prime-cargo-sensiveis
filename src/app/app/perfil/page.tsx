'use client';
import { User, LogOut, RefreshCcw } from 'lucide-react';

export default function PerfilPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <header className="bg-[#F47920] text-white p-6 rounded-b-2xl shadow-md flex items-center gap-4">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"><User className="w-8 h-8"/></div>
        <div>
          <h1 className="text-xl font-bold">João Motorista</h1>
          <p className="text-sm opacity-90">joao@primecargo.com.br</p>
        </div>
      </header>
      <main className="p-4 space-y-4 mt-4">
        <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-bold text-[#4D4D4D]">Sincronização</h3>
            <p className="text-sm text-gray-500">2 itens pendentes</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold"><RefreshCcw className="w-4 h-4"/> Sincronizar</button>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
          <h3 className="font-bold text-[#4D4D4D]">Versão do App</h3>
          <p className="text-sm text-gray-500">v1.0.0 (2026)</p>
        </div>
        <button className="w-full bg-red-50 text-red-600 p-4 rounded-xl shadow-sm flex items-center justify-center gap-2 font-bold mt-8">
          <LogOut className="w-5 h-5"/> Sair da Conta
        </button>
      </main>
    </div>
  );
}
