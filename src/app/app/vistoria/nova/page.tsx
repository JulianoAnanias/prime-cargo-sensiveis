'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Save, Truck, Package, RefreshCcw } from 'lucide-react';

export default function NovaVistoriaWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({});

  const nextStep = () => setStep(s => Math.min(4, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <header className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => step === 1 ? router.back() : prevStep()} className="p-2"><ArrowLeft className="w-6 h-6 text-[#4D4D4D]" /></button>
        <div className="flex gap-1">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-2 w-8 rounded-full ${i <= step ? 'bg-[#F47920]' : 'bg-gray-200'}`} />
          ))}
        </div>
        <button className="p-2 text-[#F47920]"><Save className="w-5 h-5" /></button>
      </header>

      <main className="flex-1 p-6">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#4D4D4D]">Selecione o Procedimento</h2>
            <div className="grid gap-4">
              {[
                { id: 'coleta', label: 'Coleta', icon: Package },
                { id: 'entrega', label: 'Entrega', icon: Truck },
                { id: 'transferencia', label: 'Transferência', icon: RefreshCcw }
              ].map(proc => (
                <button key={proc.id} onClick={() => { setData({...data, procedure: proc.id}); nextStep(); }} className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4 border-2 border-transparent focus:border-[#F47920]">
                  <div className="bg-orange-100 p-3 rounded-full text-[#F47920]"><proc.icon className="w-6 h-6" /></div>
                  <span className="text-lg font-semibold text-[#4D4D4D]">{proc.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#4D4D4D]">Documento</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                <select className="w-full p-3 rounded-lg border border-gray-300 bg-white">
                  <option>Nota Fiscal (NF)</option><option>Número de Coleta</option><option>CT-e</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input type="text" className="w-full p-3 rounded-lg border border-gray-300" placeholder="Digite o número..." />
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#4D4D4D]">Dados do Cliente/Local</h2>
            <div className="space-y-4">
              {['Cliente', 'Local', 'Endereço', 'Contato', 'Setor', 'Telefone', 'Ramal'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                  <input type="text" className="w-full p-3 rounded-lg border border-gray-300" />
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#4D4D4D]">Identificação de Equipamentos</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Veículo (Placa)</label><input type="text" className="w-full p-3 rounded-lg border border-gray-300" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Volumetria</label><input type="text" className="w-full p-3 rounded-lg border border-gray-300" /></div>
            </div>
          </div>
        )}
      </main>

      {step > 1 && (
        <div className="p-4 bg-white border-t flex gap-4">
          <button onClick={prevStep} className="flex-1 py-3 text-[#4D4D4D] font-semibold border rounded-lg">Voltar</button>
          <button onClick={() => step === 4 ? router.push('/app/vistoria/123') : nextStep()} className="flex-1 py-3 bg-[#F47920] text-white font-semibold rounded-lg flex justify-center items-center gap-2">
            {step === 4 ? 'Iniciar Vistoria' : 'Próximo'} {step < 4 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
