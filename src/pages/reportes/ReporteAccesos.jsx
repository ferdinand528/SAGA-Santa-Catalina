import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Clock, User, Loader2 } from 'lucide-react';

const ReporteAccesos = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('logs_acceso')
        .select('*, perfiles(nombre_completo, rol)')
        .order('fecha_ingreso', { ascending: false })
        .limit(100);

      if (!error) setLogs(data);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center animate-pulse font-black text-[#84bd00]">GENERANDO AUDITORÍA...</div>;

  return (
    <div className="min-h-screen p-6 md:p-12 bg-transparent font-sans text-[#1a3a5f]">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <button onClick={() => navigate('/reportes')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-4 hover:text-[#84bd00] transition">
            <ArrowLeft size={16} /> Volver a Reportes
          </button>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Auditoría de <span className="text-[#84bd00]">Accesos</span></h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 italic">Historial de entradas al sistema v4.0</p>
        </header>

        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-6 text-[9px] font-black text-gray-400 uppercase">Personal</th>
                <th className="p-6 text-[9px] font-black text-gray-400 uppercase">Rol</th>
                <th className="p-6 text-[9px] font-black text-gray-400 uppercase text-right">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-6 flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-xl text-[#1a3a5f]"><User size={14}/></div>
                    <span className="font-black text-xs uppercase">{log.perfiles?.nombre_completo}</span>
                  </td>
                  <td className="p-6">
                    <span className="bg-blue-50 text-[#1a3a5f] px-3 py-1 rounded-full text-[8px] font-black uppercase italic">
                      {log.perfiles?.rol}
                    </span>
                  </td>
                  <td className="p-6 text-right font-mono text-[10px] text-gray-500 font-bold">
                    <div className="flex items-center justify-end gap-2">
                      <Clock size={12} className="text-[#84bd00]"/>
                      {new Date(log.fecha_ingreso).toLocaleString('es-AR')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReporteAccesos;