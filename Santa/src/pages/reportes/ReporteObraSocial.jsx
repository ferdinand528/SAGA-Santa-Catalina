import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PieChart, Loader2 } from 'lucide-react';

const ReporteObraSocial = () => {
  const navigate = useNavigate();
  // CORRECCIÓN: Nace en true para evitar el setState síncrono en el effect
  const [loading, setLoading] = useState(true);
  const [datos, setDatos] = useState([]);
  const [mesFiltro, setMesFiltro] = useState("Enero");
  const [anioFiltro, setAnioFiltro] = useState(2026);

  // 1. DEFINICIÓN MEMORIZADA (Elimina el warning de exhaustive-deps)
  const fetchReporte = useCallback(async () => {
    // Solo activamos loading si la función es llamada por un cambio de filtro posterior
    setLoading(prev => !prev ? true : true); 

    try {
      const { data, error } = await supabase
        .from('pagos')
        .select(`
          monto,
          alumnos (obra_social)
        `)
        .eq('mes', mesFiltro)
        .eq('anio', anioFiltro);

      if (error) throw error;

      const agrupado = data.reduce((acc, pago) => {
        const os = pago.alumnos?.obra_social || "PARTICULAR";
        acc[os] = (acc[os] || 0) + parseFloat(pago.monto);
        return acc;
      }, {});

      setDatos(Object.entries(agrupado).sort((a, b) => b[1] - a[1]));
    } catch (err) { 
      console.error("Error en reporte OS:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [mesFiltro, anioFiltro]);

  // 2. EFECTO CON DEPENDENCIA ESTABLE
  useEffect(() => {
    fetchReporte();
  }, [fetchReporte]);

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#fcfaf7] animate-fade-in font-sans">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate('/reportes')} 
          className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-purple-600 transition"
        >
          <ArrowLeft size={16} /> Volver a Reportes
        </button>

        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#1a3a5f] uppercase tracking-tighter">
              Reporte <span className="text-purple-600">Obra Social</span>
            </h1>
            <p className="text-purple-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">
              S.A.G.A v2.1 • Análisis de Convenios
            </p>
          </div>
          
          <div className="flex gap-3 bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
            <select 
              className="p-3 bg-transparent font-bold text-xs outline-none cursor-pointer" 
              value={mesFiltro} 
              onChange={e => setMesFiltro(e.target.value)}
            >
              {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select 
              className="p-3 bg-transparent font-bold text-xs outline-none cursor-pointer" 
              value={anioFiltro} 
              onChange={e => setAnioFiltro(e.target.value)}
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </header>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-gray-200">
            <Loader2 className="animate-spin text-purple-500 mb-4" size={32} />
            <p className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Calculando Liquidaciones...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              {datos.map(([os, total]) => (
                <div key={os} className="bg-white p-6 rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm hover:border-purple-200 transition-all group">
                  <div>
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-2">Entidad Pagadora</p>
                    <h3 className="text-lg font-black text-[#1a3a5f] uppercase tracking-tight group-hover:text-purple-600 transition-colors">{os}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-purple-600 tracking-tighter">${total.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {datos.length === 0 && (
                <div className="p-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 text-center">
                  <PieChart className="mx-auto text-gray-100 mb-4" size={48} />
                  <p className="text-[10px] font-black text-gray-300 uppercase italic">Sin registros de cobranza en este periodo</p>
                </div>
              )}
            </div>
            
            <div className="bg-[#1a3a5f] p-10 rounded-[3rem] text-white shadow-2xl h-fit border border-white/10">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Resumen de Caja</h3>
              <p className="text-white/50 text-[11px] leading-relaxed font-medium">
                Este reporte agrupa los cobros efectivos. Utilizá estos valores para cotejar con las liquidaciones de las obras sociales y detectar demoras en los pagos o rechazos de facturación.
              </p>
              <div className="mt-10 pt-8 border-t border-white/10 flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 block mb-1">Total Liquidado</span>
                  <span className="text-3xl font-black tracking-tighter">${datos.reduce((a, b) => a + b[1], 0).toLocaleString()}</span>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl">
                  <PieChart size={24} className="text-purple-400"/>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReporteObraSocial;