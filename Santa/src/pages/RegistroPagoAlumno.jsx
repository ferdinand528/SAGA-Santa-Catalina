import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, DollarSign, Calendar, 
  Loader2, History, CheckCircle2, Info, CreditCard 
} from 'lucide-react';

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Opciones de pago requeridas
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
    metodo_pago: 'Efectivo' // Valor por defecto
  });

  useEffect(() => {
    fetchDatos();
  }, [alumnoId, anioFiltro]);

  async function fetchDatos() {
    try {
      const { data: alu } = await supabase.from('alumnos').select('nombre, apellido, monto_inicial').eq('id', alumnoId).single();
      if (alu) {
        setAlumno(alu);
        if (!form.monto) setForm(prev => ({ ...prev, monto: alu.monto_inicial }));
      }

      const { data: pagos } = await supabase
        .from('pagos')
        .select('*')
        .eq('alumno_id', alumnoId)
        .eq('anio', anioFiltro)
        .order('fecha_registro', { ascending: false });
      
      setHistorial(pagos || []);
    } catch (err) { console.error(err); } finally { setFetching(false); }
  }

  const handlePago = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('pagos').insert([{
        alumno_id: alumnoId,
        ...form,
        registrado_por: user.id
      }]);
      alert("Pago registrado y categorizado con éxito.");
      fetchDatos(); 
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  if (fetching && !alumno) return <div className="h-screen flex items-center justify-center font-black text-emerald-500 uppercase text-xs">Abriendo Tesorería...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#fcfaf7] animate-fade-in">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* COLUMNA FORMULARIO DE COBRO */}
        <div className="space-y-6">
          <button onClick={() => navigate('/cobranzas')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-4 hover:text-emerald-500 transition">
            <ArrowLeft size={16} /> Volver a Cobranzas
          </button>

          <form onSubmit={handlePago} className="bg-white rounded-4xl shadow-2xl border border-white overflow-hidden">
            <div className="bg-emerald-500 p-8 text-white flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Registrar Cobro</h2>
                <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mt-1">
                  {alumno?.apellido}, {alumno?.nombre}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl border border-white/30 shadow-inner">
                <CreditCard size={24}/>
              </div>
            </div>

            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Mes</label>
                  <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none border border-transparent focus:border-emerald-200" value={form.mes} onChange={e => setForm({...form, mes: e.target.value})}>
                    {MESES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Año</label>
                  <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none" value={form.anio} onChange={e => setForm({...form, anio: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Monto ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                    <input required type="number" className="w-full pl-10 p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-100" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Medio de Pago</label>
                  <select 
                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none border border-transparent focus:border-emerald-200"
                    value={form.metodo_pago}
                    onChange={e => setForm({...form, metodo_pago: e.target.value})}
                  >
                    {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* VALOR DE REFERENCIA */}
              <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info size={16} className="text-emerald-500"/>
                  <div>
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">Convenio Vigente</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">Sujeto a actualización</p>
                  </div>
                </div>
                <p className="text-xl font-black text-emerald-600 tracking-tighter">
                  ${alumno?.monto_inicial || '0'}
                </p>
              </div>

              <button disabled={loading} className="w-full bg-emerald-500 text-white p-6 rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20}/>}
                {loading ? "PROCESANDO..." : "CONFIRMAR INGRESO v1.8"}
              </button>
            </div>
          </form>
        </div>

        {/* COLUMNA HISTORIAL */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-4xl border border-gray-100 shadow-sm min-h-[500px]">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <History size={18} className="text-gray-400"/>
                <h3 className="text-sm font-black text-[#1a3a5f] uppercase tracking-widest">Cronología de Cobros</h3>
              </div>
              <select className="p-3 bg-gray-50 rounded-2xl text-[10px] font-black uppercase border-none outline-none" value={anioFiltro} onChange={e => setAnioFiltro(e.target.value)}>
                {[2024, 2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              {historial.length > 0 ? historial.map(pago => (
                <div key={pago.id} className="flex items-center justify-between p-5 bg-white rounded-3xl border border-gray-50 hover:border-emerald-100 shadow-sm transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all"><CheckCircle2 size={16}/></div>
                    <div>
                      <p className="text-xs font-black text-gray-800 uppercase leading-none">{pago.mes} {pago.anio}</p>
                      <p className="text-[8px] font-bold text-emerald-500 uppercase mt-2">{pago.metodo_pago}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-emerald-600">${pago.monto}</p>
                    <p className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">Registrado: {new Date(pago.fecha_registro).toLocaleDateString()}</p>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-4xl">
                  <DollarSign size={40} className="text-gray-100 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Sin registros contables en {anioFiltro}</p>
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