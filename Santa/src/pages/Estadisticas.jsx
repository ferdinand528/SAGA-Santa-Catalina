import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BarChart3, TrendingUp, DollarSign, 
  AlertCircle, CheckCircle2, Loader2, Filter 
} from 'lucide-react';

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const Estadisticas = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Filtros de Periodo
  const [mesFiltro, setMesFiltro] = useState(MESES[new Date().getMonth()]);
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear());

  // Estado de Resultados
  const [balance, setBalance] = useState({
    proyectado: 0,
    recaudado: 0,
    pendiente: 0,
    totalAlumnos: 0,
    porcentaje: 0
  });

  useEffect(() => {
    validarYFetch();
  }, [mesFiltro, anioFiltro]);

  async function validarYFetch() {
    try {
      // 1. Seguridad de Rol
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
      
      if (profile.rol !== 'director' && profile.rol !== 'administrador') {
        navigate('/dashboard');
        return;
      }
      setChecking(false);
      setLoading(true);

      // 2. Obtener Proyectado (Convenios de Alumnos)
      const { data: alumnos } = await supabase.from('alumnos').select('monto_inicial');
      const totalProyectado = alumnos.reduce((acc, curr) => acc + (parseFloat(curr.monto_inicial) || 0), 0);

      // 3. Obtener Recaudado (Pagos del mes)
      const { data: pagos } = await supabase
        .from('pagos')
        .select('monto')
        .eq('mes', mesFiltro)
        .eq('anio', anioFiltro);
      
      const totalRecaudado = pagos.reduce((acc, curr) => acc + (parseFloat(curr.monto) || 0), 0);

      // 4. Calcular métricas
      const diff = totalProyectado - totalRecaudado;
      const pct = totalProyectado > 0 ? (totalRecaudado / totalProyectado) * 100 : 0;

      setBalance({
        proyectado: totalProyectado,
        recaudado: totalRecaudado,
        pendiente: diff > 0 ? diff : 0,
        totalAlumnos: alumnos.length,
        porcentaje: pct.toFixed(1)
      });

    } catch (err) {
      console.error("Error en balance:", err);
    } finally {
      setLoading(false);
    }
  }

  if (checking || loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fcfaf7]">
      <Loader2 className="animate-spin text-red-500 mb-4" size={32} />
      <p className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Calculando Balance Financiero...</p>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent animate-fade-in">
      <div className="max-w-6xl mx-auto">
        
        {/* NAVEGACIÓN */}
        <button onClick={() => navigate('/reportes')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-red-600 transition">
          <ArrowLeft size={16} /> Volver a Reportes
        </button>

        {/* CABECERA Y FILTROS */}
        <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 size={28} className="text-red-500" />
              <h1 className="text-4xl font-black text-[#1a3a5f] uppercase tracking-tighter leading-none">
                Balance Financiero
              </h1>
            </div>
            <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em] ml-1">
              S.A.G.A v1.8 • Análisis de Recaudación vs Proyectado
            </p>
          </div>

          <div className="flex gap-3 bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
            <select 
              className="p-3 bg-transparent font-black text-[10px] uppercase outline-none border-none focus:ring-0"
              value={mesFiltro} onChange={e => setMesFiltro(e.target.value)}
            >
              {MESES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select 
              className="p-3 bg-transparent font-black text-[10px] uppercase outline-none border-none focus:ring-0"
              value={anioFiltro} onChange={e => setAnioFiltro(e.target.value)}
            >
              {[2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </header>

        {/* INDICADOR DE CUMPLIMIENTO */}
        <div className="bg-white p-10 rounded-4xl shadow-sm border border-gray-100 mb-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Objetivo de Recaudación</p>
              <h2 className="text-4xl font-black text-[#1a3a5f] tracking-tighter">{balance.porcentaje}%</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alumnos con Convenio</p>
              <p className="text-xl font-black text-[#1a3a5f] uppercase">{balance.totalAlumnos}</p>
            </div>
          </div>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000" 
              style={{ width: `${balance.porcentaje}%` }}
            ></div>
          </div>
        </div>

        {/* GRILLA DE VALORES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* RECAUDADO */}
          <div className="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm border-t-8 border-t-emerald-500">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle2 size={14}/> Ingresos Cobrados
            </p>
            <p className="text-4xl font-black text-[#1a3a5f] tracking-tighter">${balance.recaudado}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase mt-4">Efectivo + Transf + Cheques</p>
          </div>

          {/* PROYECTADO */}
          <div className="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm border-t-8 border-t-blue-500">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp size={14}/> Total Proyectado
            </p>
            <p className="text-4xl font-black text-[#1a3a5f] tracking-tighter">${balance.proyectado}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase mt-4">Suma de Convenios Vigentes</p>
          </div>

          {/* PENDIENTE */}
          <div className="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm border-t-8 border-t-orange-500">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertCircle size={14}/> Pendiente de Cobro
            </p>
            <p className="text-4xl font-black text-orange-600 tracking-tighter">${balance.pendiente}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase mt-4">Morosidad Estimada del Mes</p>
          </div>

        </div>

        {/* NOTA DE AUDITORÍA */}
        <div className="mt-12 p-8 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
            <DollarSign size={20}/>
          </div>
          <p className="text-[9px] font-bold text-blue-600 uppercase leading-relaxed tracking-wider">
            Este balance se genera cruzando los montos de convenio de cada legajo contra los recibos de pago emitidos. 
            Como Director, usá este dato para identificar desvíos en el flujo de caja antes del cierre de mes.
          </p>
        </div>

      </div>

      <footer className="mt-20 py-10 text-center opacity-30">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
          auditoría financiera <span className="mx-2 text-red-500">|</span> santa catalina 2026
        </p>
      </footer>
    </div>
  );
};

export default Estadisticas;