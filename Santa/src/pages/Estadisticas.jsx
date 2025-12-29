import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, TrendingUp } from 'lucide-react';

const Estadisticas = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-blue-600 transition">
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="bg-white/90 backdrop-blur-sm p-12 rounded-[3rem] border border-red-50 shadow-xl text-center">
          <div className="bg-red-500 w-20 h-20 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-red-100">
            <TrendingUp size={40} />
          </div>
          <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tighter mb-4">Reportes Institucionales</h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-10 italic">Módulo en Sincronización</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Total Recaudado (Mes)</p>
               <p className="text-4xl font-black text-blue-900">$ ---.---</p>
            </div>
            <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Alumnos Activos</p>
               <p className="text-4xl font-black text-blue-900">--</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;