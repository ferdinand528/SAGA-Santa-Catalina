import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, DollarSign, Loader2, 
  TrendingUp, BarChart3, Wallet, UserCheck, Calendar
} from 'lucide-react';

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const GestionAranceles = () => {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [guardando, setGuardando] = useState(null);
  
  // 📅 Estados para el período (Mes y Año)
  const [mesGlobal, setMesGlobal] = useState(MESES[new Date().getMonth()]);
  const [anioGlobal, setAnioGlobal] = useState(new Date().getFullYear());

  // 🛡️ SEGURIDAD Y BALANCE
  const [perfil, setPerfil] = useState(null);
  const [balance, setBalance] = useState({ mensual: 0, anual: 0 });

  const fetchDatos = useCallback(async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }
      
      const { data: p } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
      if (p?.rol?.toLowerCase() !== 'director') {
        alert("Acceso denegado: Esta sección es exclusiva de la Dirección.");
        navigate('/dashboard');
        return;
      }
      setPerfil(p);

      const { data: aluData, error: aluError } = await supabase
        .from('alumnos')
        .select('id, nombre, apellido, dni, monto_cuota, dni_tutor, nombre_tutor_facturacion')
        .eq('activo', true)
        .order('apellido', { ascending: true });
      if (aluError) throw aluError;
      setAlumnos(aluData || []);

      const { data: pagosData } = await supabase.from('pagos').select('monto, mes, anio');
      if (pagosData) {
        const mesActualNombre = MESES[new Date().getMonth()];
        const anioActual = new Date().getFullYear();

        const mensual = pagosData
          .filter(p => p.mes === mesActualNombre && Number(p.anio) === anioActual)
          .reduce((acc, curr) => acc + Number(curr.monto), 0);

        const anual = pagosData
          .filter(p => Number(p.anio) === anioActual)
          .reduce((acc, curr) => acc + Number(curr.monto), 0);

        setBalance({ mensual, anual });
      }

    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchDatos(); }, [fetchDatos]);

  const actualizarCuota = async (id, nuevoMonto) => {
    setGuardando(id);
    try {
      const { error } = await supabase
        .from('alumnos')
        .update({ monto_cuota: nuevoMonto })
        .eq('id', id);
      if (error) throw error;
      setAlumnos(prev => prev.map(a => a.id === id ? { ...a, monto_cuota: nuevoMonto } : a));
    } catch (error) {
      alert("Error al actualizar cuota: " + error.message);
    } finally {
      setGuardando(null);
    }
  };

  const filtrados = alumnos.filter(a => 
    `${a.apellido} ${a.nombre}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-[#84bd00] animate-pulse bg-[#fcfaf7]">
      SINCRONIZANDO TESORERÍA v4.0...
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-12 bg-transparent font-sans text-[#1a3a5f]">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-8">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-4 hover:text-[#1a3a5f] transition bg-white px-4 py-2 rounded-full shadow-sm">
              <ArrowLeft size={16} /> Volver al Panel
            </button>
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">
              Gestión <span className="text-[#84bd00]">Aranceles</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 italic font-black">
              SANTA CATALINA • REGISTRO DE PRESTACIONES
            </p>
          </div>

          <div className="flex flex-wrap gap-4 w-full xl:w-auto">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white flex items-center gap-4 min-w-[220px]">
              <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-100">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Recaudación {mesGlobal}</p>
                <p className="text-xl font-black text-emerald-600 mt-1 font-mono">${balance.mensual.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-[#1a3a5f] p-6 rounded-3xl shadow-xl flex items-center gap-4 min-w-[220px]">
              <div className="bg-white/10 text-[#84bd00] p-3 rounded-2xl">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">Total Anual {anioGlobal}</p>
                <p className="text-xl font-black text-white mt-1 font-mono">${balance.anual.toLocaleString()}</p>
              </div>
            </div>

            <button 
              onClick={() => navigate('/cobranzas')}
              className="bg-[#84bd00] text-white px-8 py-5 rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-[#1a3a5f] transition-all flex items-center gap-3"
            >
              <Wallet size={20}/> Ver Historial
            </button>
          </div>
        </header>

        <div className="bg-white/90 backdrop-blur-xl rounded-[3.5rem] shadow-sm border border-white p-10">
          {/* BUSCADOR Y SELECTOR DE PERÍODO GLOBAL */}
          <div className="flex flex-col md:flex-row gap-6 mb-10 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
              <input 
                type="text" 
                placeholder="BUSCAR ALUMNO..." 
                className="w-full pl-20 pr-10 py-8 bg-gray-50/50 rounded-[2.5rem] outline-none font-bold text-sm uppercase focus:ring-4 focus:ring-[#84bd00]/5 transition-all" 
                value={busqueda} 
                onChange={(e) => setBusqueda(e.target.value)} 
              />
            </div>
            <div className="flex gap-3 bg-gray-100 p-2 rounded-[2rem]">
                <select className="bg-white px-6 py-4 rounded-full font-black text-[10px] uppercase outline-none" value={mesGlobal} onChange={(e) => setMesGlobal(e.target.value)}>
                    {MESES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input type="number" className="bg-white px-6 py-4 rounded-full font-black text-[10px] w-24 text-center outline-none" value={anioGlobal} onChange={(e) => setAnioGlobal(e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="pb-8 px-4">Alumno / Responsable</th>
                  <th className="pb-8 px-4 text-center">Período a Cobrar</th>
                  <th className="pb-8 px-4 text-center">Cuota Base ($)</th>
                  <th className="pb-8 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/30 transition-all group">
                    <td className="py-8 px-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 p-3 rounded-2xl text-gray-400 group-hover:bg-[#84bd00] group-hover:text-white transition-all">
                          <UserCheck size={20} />
                        </div>
                        <div>
                          <p className="font-black uppercase text-sm text-[#1a3a5f]">{a.apellido}, {a.nombre}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">DNI: {a.dni_tutor || a.dni}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* 📅 NUEVA COLUMNA: MES Y AÑO */}
                    <td className="py-8 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase italic">
                                {mesGlobal}
                            </span>
                            <span className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl font-black text-[10px]">
                                {anioGlobal}
                            </span>
                        </div>
                    </td>

                    <td className="py-8 px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <input 
                          type="number"
                          className="w-32 p-3 bg-gray-50 rounded-xl font-black text-sm text-[#1a3a5f] border-2 border-transparent focus:border-[#84bd00] outline-none text-center shadow-inner"
                          value={a.monto_cuota}
                          onChange={(e) => setAlumnos(prev => prev.map(item => item.id === a.id ? { ...item, monto_cuota: e.target.value } : item))}
                          onBlur={(e) => actualizarCuota(a.id, e.target.value)}
                        />
                        {guardando === a.id && <Loader2 size={14} className="animate-spin text-[#84bd00]" />}
                      </div>
                    </td>
                    <td className="py-8 px-4 text-right">
                      <button 
                        onClick={() => navigate(`/registrar-pago/${a.id}`, { state: { mes: mesGlobal, anio: anioGlobal } })}
                        className="bg-emerald-100 text-emerald-600 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-2 ml-auto"
                      >
                        <DollarSign size={16} /> Registrar Pago
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionAranceles;