import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PieChart, Filter, Loader2, Download } from 'lucide-react';

const ReporteObraSocial = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [datos, setDatos] = useState([]);
  const [mesFiltro, setMesFiltro] = useState("Enero");
  const [anioFiltro, setAnioFiltro] = useState(2026);

  useEffect(() => {
    fetchReporte();
  }, [mesFiltro, anioFiltro]);

  async function fetchReporte() {
    setLoading(true);
    try {
      // Consulta con join para traer la obra social del alumno
      const { data, error } = await supabase
        .from('pagos')
        .select(`
          monto,
          alumnos (obra_social)
        `)
        .eq('mes', mesFiltro)
        .eq('anio', anioFiltro);

      if (error) throw error;

      // Agrupamos por Obra Social
      const agrupado = data.reduce((acc, pago) => {
        const os = pago.alumnos.obra_social || "PARTICULAR";
        acc[os] = (acc[os] || 0) + parseFloat(pago.monto);
        return acc;
      }, {});

      setDatos(Object.entries(agrupado).sort((a, b) => b[1] - a[1]));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#fcfaf7] animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/reportes')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-purple-600 transition">
          <ArrowLeft size={16} /> Volver a Reportes
        </button>

        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#1a3a5f] uppercase tracking-tighter">Reporte por Obra Social</h1>
            <p className="text-purple-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">S.A.G.A v1.8 • Análisis de Convenios</p>
          </div>
          
          <div className="flex gap-3">
            <select className="p-4 bg-white rounded-2xl font-bold text-xs shadow-sm border-none outline-none" value={mesFiltro} onChange={e => setMesFiltro(e.target.value)}>
              {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="p-4 bg-white rounded-2xl font-bold text-xs shadow-sm border-none outline-none" value={anioFiltro} onChange={e => setAnioFiltro(e.target.value)}>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            {datos.map(([os, total]) => (
              <div key={os} className="bg-white p-6 rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm hover:border-purple-200 transition-all">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Institución</p>
                  <h3 className="text-lg font-black text-[#1a3a5f] uppercase tracking-tight">{os}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-purple-600 tracking-tighter">${total}</p>
                </div>
              </div>
            ))}
            {datos.length === 0 && !loading && (
              <div className="p-20 bg-white rounded-4xl border-2 border-dashed border-gray-100 text-center">
                <PieChart className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-[10px] font-black text-gray-300 uppercase">Sin datos para este periodo</p>
              </div>
            )}
          </div>
          
          <div className="bg-[#1a3a5f] p-10 rounded-4xl text-white shadow-2xl h-fit">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Resumen Ejecutivo</h3>
            <p className="text-white/60 text-xs leading-relaxed">
              Este reporte agrupa los cobros efectivos realizados durante el mes. 
              Utilizá estos totales para realizar el seguimiento de facturación contra las liquidaciones bancarias de cada obra social.
            </p>
            <div className="mt-8 pt-8 border-t border-white/10 flex justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Total Mes</span>
              <span className="text-2xl font-black tracking-tighter">${datos.reduce((a, b) => a + b[1], 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReporteObraSocial;