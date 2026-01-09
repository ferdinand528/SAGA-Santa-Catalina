import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, DollarSign, 
  Loader2, History, CheckCircle2, Info, CreditCard 
} from 'lucide-react';

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const METODOS_PAGO = ["Efectivo", "Transferencia", "Cheque"];

const RegistroPagoAlumno = () => {
  const { alumnoId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [alumno, setAlumno] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear());
  
  const [form, setForm] = useState({
    mes: MESES[new Date().getMonth()],
    anio: new Date().getFullYear(),
    monto: '',
    metodo_pago: 'Efectivo'
  });

  // 1. DEFINICIÓN DE FUNCIÓN MEMORIZADA (Antes del useEffect para evitar error de Hoisting)
  const fetchDatos = useCallback(async () => {
    if (!alumnoId) return;
    
    try {
      // Carga de datos del alumno
      const { data: alu } = await supabase.from('alumnos').select('nombre, apellido, monto_inicial').eq('id', alumnoId).single();
      if (alu) {
        setAlumno(alu);
        // Autocompletar monto si está vacío
        setForm(prev => ({ ...prev, monto: prev.monto || alu.monto_inicial }));
      }

      // Carga del historial
      const { data: pagos } = await supabase
        .from('pagos')
        .select('*')
        .eq('alumno_id', alumnoId)
        .eq('anio', anioFiltro)
        .order('fecha_registro', { ascending: false });
      
      setHistorial(pagos || []);
    } catch (err) { 
      console.error("Error en Tesorería:", err); 
    } finally { 
      setFetching(false); 
    }
  }, [alumnoId, anioFiltro]);

  // 2. EFECTO DE CARGA
  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

  const handlePago = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('pagos').insert([{
        alumno_id: alumnoId,
        ...form,
        registrado_por: user.id
      }]);

      if (error) throw error;

      alert("Ingreso registrado correctamente en el balance global.");
      fetchDatos(); 
    } catch (err) { 
      alert("Error al registrar: " + err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  if (fetching && !alumno) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fcfaf7]">
      <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
      <p className="font-black text-gray-400 uppercase text-[10px] tracking-widest italic">Sincronizando Tesorería v2.1...</p>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* COLUMNA FORMULARIO DE COBRO */}
        <div className="space-y-6">
          <button onClick={() => navigate('/cobranzas')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-4 hover:text-emerald-600 transition">
            <ArrowLeft size={16} /> Volver a Cobranzas
          </button>

          <form onSubmit={handlePago} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-emerald-600 p-8 text-white flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Registrar Cobro</h2>
                <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mt-1 italic">
                  Legajo: {alumno?.apellido}, {alumno?.nombre}
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-2xl border border-white/30 backdrop-blur-sm">
                <CreditCard size={24}/>
              </div>
            </div>

            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-300 uppercase ml-2 tracking-widest">Período Mensual</label>
                  <select className="w-full p-4 bg-gray-50 rounded-2xl font-black text-xs outline-none border border-transparent focus:border-emerald-200 uppercase" value={form.mes} onChange={e => setForm({...form, mes: e.target.value})}>
                    {MESES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-300 uppercase ml-2 tracking-widest">Ejercicio Anual</label>
                  <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl font-black text-xs outline-none border border-transparent focus:border-emerald-200" value={form.anio} onChange={e => setForm({...form, anio: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-300 uppercase ml-2 tracking-widest">Monto a Cobrar ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                    <input required type="number" className="w-full pl-10 p-4 bg-gray-50 rounded-2xl font-black text-sm outline-none focus:ring-2 focus:ring-emerald-50" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-300 uppercase ml-2 tracking-widest">Medio de Pago</label>
                  <select 
                    className="w-full p-4 bg-gray-50 rounded-2xl font-black text-xs outline-none border border-transparent focus:border-emerald-200 uppercase"
                    value={form.metodo_pago}
                    onChange={e => setForm({...form, metodo_pago: e.target.value})}
                  >
                    {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-emerald-50/30 border border-emerald-100 p-6 rounded-3xl flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <Info size={16} className="text-emerald-500"/>
                  <div>
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">Convenio Activo</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 italic tracking-tighter">Monto base registrado en legajo</p>
                  </div>
                </div>
                <p className="text-2xl font-black text-emerald-600 tracking-tighter">
                  ${alumno?.monto_inicial || '0'}
                </p>
              </div>

              <button disabled={loading} className="w-full bg-emerald-600 text-white p-6 rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-xl shadow-emerald-100 hover:bg-gray-900 transition-all flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20}/>}
                {loading ? "PROCESANDO..." : "Confirmar Ingreso v2.1"}
              </button>
            </div>
          </form>
        </div>

        {/* COLUMNA HISTORIAL */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[500px]">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-3">
                <History size={20} className="text-gray-300"/>
                <h3 className="text-[10px] font-black text-[#1a3a5f] uppercase tracking-[0.2em]">Registro Histórico</h3>
              </div>
              <select className="p-3 bg-gray-50 rounded-2xl text-[10px] font-black uppercase border-none outline-none cursor-pointer" value={anioFiltro} onChange={e => setAnioFiltro(e.target.value)}>
                {[2024, 2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              {historial.length > 0 ? historial.map(pago => (
                <div key={pago.id} className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-gray-50 hover:border-emerald-100 shadow-sm transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                      <CheckCircle2 size={18}/>
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-800 uppercase leading-none tracking-tighter">{pago.mes} {pago.anio}</p>
                      <p className="text-[8px] font-black text-emerald-500 uppercase mt-2 bg-emerald-50 px-2 py-0.5 rounded-md inline-block tracking-widest italic">{pago.metodo_pago}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-emerald-600 tracking-tighter">${pago.monto}</p>
                    <p className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter italic">ID: {pago.id.substring(0,8)}</p>
                  </div>
                </div>
              )) : (
                <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
                  <DollarSign size={48} className="text-gray-100 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">No hay registros de caja para {anioFiltro}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegistroPagoAlumno;