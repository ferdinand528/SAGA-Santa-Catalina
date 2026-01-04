import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
// IMPORTACIÓN COMPLETA PARA EVITAR REFERENCE ERROR
import { 
  ArrowLeft, Search, Save, User, Heart, 
  Pill, History, Loader2, FileEdit, AlertCircle 
} from 'lucide-react';

const Evoluciones = () => {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [evolucion, setEvolucion] = useState("");
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchAlumnos(); }, []);

  async function fetchAlumnos() {
    const { data } = await supabase.from('alumnos').select('*').order('apellido');
    setAlumnos(data || []);
  }

  // Cargar historial automáticamente al seleccionar alumno
  useEffect(() => {
    if (alumnoSeleccionado) fetchHistorial(alumnoSeleccionado.id);
  }, [alumnoSeleccionado]);

  async function fetchHistorial(id) {
    const { data } = await supabase.from('evoluciones')
      .select('*').eq('alumno_id', id).order('fecha', { ascending: false });
    setHistorial(data || []);
  }

  const guardarActividad = async () => {
    if (!evolucion) return alert("Por favor, describa la actividad realizada.");
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('evoluciones').insert([{
        alumno_id: alumnoSeleccionado.id,
        detalle: evolucion,
        profesional_id: user.id,
        fecha: new Date().toISOString()
      }]);
      if (error) throw error;
      setEvolucion("");
      fetchHistorial(alumnoSeleccionado.id);
      alert("Actividad registrada correctamente.");
    } catch (err) { alert("Error técnico: " + err.message); } finally { setLoading(false); }
  };

  const filtrados = alumnos.filter(a => `${a.apellido} ${a.nombre}`.toLowerCase().includes(busqueda.toLowerCase()));

  // PANTALLA A: SELECCIÓN DE ALUMNO
  if (!alumnoSeleccionado) return (
    <div className="min-h-screen p-10 flex flex-col items-center justify-center bg-[#fcfaf7] animate-fade-in">
      <div className="w-full max-w-md bg-white p-10 rounded-4xl shadow-2xl border border-gray-100">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-6 hover:text-[#84bd00] transition">
          <ArrowLeft size={14} /> Volver al Dashboard
        </button>
        <h2 className="text-2xl font-black text-[#1a3a5f] uppercase tracking-tighter mb-6">Registro de Actividades</h2>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" placeholder="Buscar alumno por apellido..." 
            className="w-full pl-12 p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-[#84bd00]/10"
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {filtrados.map(a => (
            <button key={a.id} onClick={() => setAlumnoSeleccionado(a)} className="w-full text-left p-4 rounded-xl hover:bg-[#84bd00] hover:text-white transition-all font-black uppercase text-[10px] tracking-widest text-gray-500">
              {a.apellido}, {a.nombre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // PANTALLA B: VISTA UNIFICADA (BASADA EN IMAGE_9858C7)
  return (
    <div className="min-h-screen p-6 md:p-12 animate-fade-in bg-[#fcfaf7]">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER UNIFICADO */}
        <header className="flex justify-between items-start mb-12">
          <button onClick={() => setAlumnoSeleccionado(null)} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-[#84bd00]">
            <ArrowLeft size={14} /> Volver
          </button>
          <div className="text-right">
            <h1 className="text-5xl font-black text-[#1a3a5f] tracking-tighter uppercase leading-none">
              {alumnoSeleccionado.apellido}, {alumnoSeleccionado.nombre}
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">I.A.D. SANTA CATALINA</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* BLOQUE IZQUIERDO: FICHA MÉDICA */}
          <div className="bg-white p-10 rounded-4xl shadow-sm border border-white/50 space-y-8 h-fit">
            <div className="flex items-center gap-2 text-blue-600 mb-4 border-b pb-4">
              <Heart size={16} />
              <h3 className="font-black text-[10px] uppercase tracking-widest">Ficha Médica</h3>
            </div>
            <div>
              <h4 className="text-red-600 font-black text-xl uppercase tracking-tighter">Sin Diagnóstico</h4>
              <p className="text-gray-300 text-[10px] font-bold uppercase mt-1">Carga pendiente de profesional</p>
            </div>
            <div className="pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Pill size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Medicación</span>
              </div>
              <p className="text-red-700 italic font-bold text-sm">No registra</p>
            </div>
          </div>

          {/* BLOQUE DERECHO: CARGA DE ACTIVIDAD (NARANJA #FF6B00) */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-[#fff9f2] p-10 rounded-4xl shadow-sm border border-orange-100/50">
              <div className="flex items-center gap-2 text-[#ff6b00] mb-6">
                <FileEdit size={18} />
                <h3 className="font-black text-[10px] uppercase tracking-widest">Nueva Actividad</h3>
              </div>
              <textarea 
                rows="6" 
                placeholder="Registrar lo realizado hoy..."
                className="w-full bg-white p-8 rounded-3xl outline-none font-bold text-gray-700 shadow-inner border border-orange-50 focus:ring-4 focus:ring-orange-100 transition-all mb-6"
                value={evolucion} onChange={e => setEvolucion(e.target.value)}
              />
              <button 
                onClick={guardarActividad}
                disabled={loading}
                className="w-full bg-[#ff6b00] text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Registrar Actividad"}
              </button>
            </div>

            {/* SECCIÓN INFERIOR: HISTORIAL DE ACTIVIDADES */}
            <div>
              <div className="border-b-2 border-blue-600 pb-4 mb-8">
                <h2 className="text-4xl font-black text-[#1a3a5f] uppercase tracking-tighter">
                  Actividades del Mes: <span className="text-blue-600 text-3xl">Diciembre del 2025</span>
                </h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                  Legajo Pedagógico • {alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {historial.map(h => (
                  <div key={h.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <History size={12}/> {new Date(h.fecha).toLocaleDateString('es-AR')}
                    </p>
                    <p className="text-gray-700 font-bold leading-relaxed text-sm">{h.detalle}</p>
                  </div>
                ))}
                {historial.length === 0 && (
                  <div className="col-span-2 p-12 border-2 border-dashed border-gray-200 rounded-4xl text-center">
                    <AlertCircle size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-gray-300 font-black uppercase text-[10px] tracking-widest">Sin registros este mes</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* FOOTER VERSIÓN 1.5 */}
      <footer className="mt-20 py-6 text-center opacity-40">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
          version 1.5 <span className="mx-2">|</span> diciembre 2025
        </p>
      </footer>
    </div>
  );
};

export default Evoluciones;