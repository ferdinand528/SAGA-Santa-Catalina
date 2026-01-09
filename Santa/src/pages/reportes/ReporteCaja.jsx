import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign } from 'lucide-react';

const ReporteCaja = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent font-sans text-gray-800 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <button onClick={() => navigate('/reportes')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-emerald-500 transition bg-white/50 px-4 py-2 rounded-full shadow-sm">
            <ArrowLeft size={18} /> Volver a Reportes
          </button>
          <h1 className="text-4xl font-black tracking-tighter uppercase mt-6 leading-none">
            Reporte de <span className="text-emerald-500">Cobranzas</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Control de Ingresos • v2.0</p>
        </header>

        <div className="bg-white rounded-[3rem] p-20 shadow-xl border border-gray-100 text-center">
          <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto mb-6">
            <DollarSign size={32} />
          </div>
          <h2 className="text-xl font-black uppercase text-gray-400 tracking-tighter">Módulo en Desarrollo</h2>
          <p className="text-[10px] font-bold text-gray-300 uppercase mt-2">Aquí se visualizarán los pagos y morosidad.</p>
        </div>
      </div>
    </div>
  );
};

export default ReporteCaja;