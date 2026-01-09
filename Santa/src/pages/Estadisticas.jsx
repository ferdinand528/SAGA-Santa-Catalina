import React, { useEffect, useState, useCallback } from 'react'; // Agregamos useCallback
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BarChart3, TrendingUp, DollarSign, 
  AlertCircle, CheckCircle2, Loader2 
} from 'lucide-react';

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const Estadisticas = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const [mesFiltro, setMesFiltro] = useState(MESES[new Date().getMonth()]);
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear());

  const [balance, setBalance] = useState({
    proyectado: 0,
    recaudado: 0,
    pendiente: 0,
    totalAlumnos: 0,
    porcentaje: 0
  });

  // MEMORIZAMOS LA FUNCIÓN PARA EVITAR EL ERROR DE ESLINT
  const validarYFetch = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }

      const { data: profile } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
      
      if (profile?.rol !== 'director' && profile?.rol !== 'administrador') {
        navigate('/dashboard');
        return;
      }
      
      setChecking(false);
      setLoading(true);

      // Obtener Proyectado
      const { data: alumnos } = await supabase.from('alumnos').select('monto_inicial');
      const totalProyectado = alumnos?.reduce((acc, curr) => acc + (parseFloat(curr.monto_inicial) || 0), 0) || 0;

      // Obtener Recaudado
      const { data: pagos } = await supabase
        .from('pagos')
        .select('monto')
        .eq('mes', mesFiltro)
        .eq('anio', anioFiltro);
      
      const totalRecaudado = pagos?.reduce((acc, curr) => acc + (parseFloat(curr.monto) || 0), 0) || 0;

      const diff = totalProyectado - totalRecaudado;
      const pct = totalProyectado > 0 ? (totalRecaudado / totalProyectado) * 100 : 0;

      setBalance({
        proyectado: totalProyectado,
        recaudado: totalRecaudado,
        pendiente: diff > 0 ? diff : 0,
        totalAlumnos: alumnos?.length || 0,
        porcentaje: pct.toFixed(1)
      });

    } catch (err) {
      console.error("Error en balance:", err);
    } finally {
      setLoading(false);
    }
  }, [mesFiltro, anioFiltro, navigate]); // Dependencias de la función

  useEffect(() => {
    validarYFetch();
  }, [validarYFetch]); // Ahora es seguro usarla aquí

  if (checking || loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fcfaf7]">
      <Loader2 className="animate-spin text-red-500 mb-4" size={32} />
      <p className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Calculando Balance Financiero...</p>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent animate-fade-in">
      <div className="max-w-6xl mx-auto">
        
        <button onClick={() => navigate('/reportes')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-red-600 transition">
          <ArrowLeft size={16} /> Volver a Reportes
        </button>

        <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 size={28} className="text-red-500" />
              <h1 className="text-4xl font-black text-[#1a3a5f] uppercase tracking-tighter leading-none">
                Balance <span className="text-red-500">Financiero</span>
              </h1>
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] ml-1">
              S.A.G.A v2.1 • Análisis de Recaudación vs Proyectado
            </p>
          </div>

          <div className="flex gap-3 bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
            <select 
              className="p-3 bg-transparent font-black text-[10px] uppercase outline-none border-none cursor-pointer"
              value={mesFiltro} onChange={e => setMesFiltro(e.target.value)}
            >
              {MESES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select 
              className="p-3 bg-transparent font-black text-[10px] uppercase outline-none border-none cursor-pointer"
              value={anioFiltro} onChange={e => setAnioFiltro(e.target.value)}
            >
              {[2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </header>

        {/* BARRA DE CUMPLIMIENTO */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 mb-10">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Objetivo Mensual</p>
              <h2 className="text-5xl font-black text-[#1a3a5f] tracking-tighter">{balance.porcentaje}%</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Legajos Activos</p>
              <p className="text-2xl font-black text-[#1a3a5f] uppercase">{balance.totalAlumnos}</p>
            </div>
          </div>
          <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden p-1">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-lg shadow-emerald-100" 
              style={{ width: `${balance.porcentaje}%` }}
            ></div>
          </div>
        </div>

        {/* CARDS DE VALORES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm border-t-8 border-t-emerald-500">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6 flex items-center gap-2">
              <CheckCircle2 size={16}/> Cobrado
            </p>
            <p className="text-4xl font-black text-[#1a3a5f] tracking-tighter">${balance.recaudado.toLocaleString()}</p>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm border-t-8 border-t-blue-500">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp size={16}/> Proyectado
            </p>
            <p className="text-4xl font-black text-[#1a3a5f] tracking-tighter">${balance.proyectado.toLocaleString()}</p>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm border-t-8 border-t-orange-500">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-6 flex items-center gap-2">
              <AlertCircle size={16}/> Pendiente
            </p>
            <p className="text-4xl font-black text-orange-600 tracking-tighter">${balance.pendiente.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;