import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, User, Heart, Calendar, History, 
  Pill, Printer, Edit3, ClipboardList, Send, FileText 
} from 'lucide-react';

const FichaAlumno = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alumno, setAlumno] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [evoluciones, setEvoluciones] = useState([]);
  const [nuevaActividad, setNuevaActividad] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Nombres de meses para el reporte
  const nombresMeses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const [mesReporte, setMesReporte] = useState(new Date().getMonth() + 1);
  const [anioReporte, setAnioReporte] = useState(new Date().getFullYear());

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: p } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
      setPerfil(p);
      const { data: alu } = await supabase.from('alumnos').select('*, datos_medicos(*)').eq('id', id).single();
      setAlumno(alu);
      const { data: evos } = await supabase.from('evoluciones').select('*, perfiles(nombre_completo)').eq('alumno_id', id).order('fecha', { ascending: false });
      setEvoluciones(evos || []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const guardarActividad = async () => {
    if (!nuevaActividad.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('evoluciones').insert([{
        alumno_id: id, profesional_id: perfil.id,
        contenido: nuevaActividad, area: perfil.profesion || 'Docencia'
      }]);
      if (!error) {
        setNuevaActividad("");
        const { data } = await supabase.from('evoluciones').select('*, perfiles(nombre_completo)').eq('alumno_id', id).order('fecha', { ascending: false });
        setEvoluciones(data || []);
      }
    } finally { setSaving(false); }
  };

  // Lógica de filtrado por periodo
  const actividadesFiltradas = evoluciones.filter(e => {
    const fecha = new Date(e.fecha);
    return (fecha.getMonth() + 1) === parseInt(mesReporte) && 
           fecha.getFullYear() === parseInt(anioReporte);
  });

  if (loading || !alumno) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse">Santa Catalina...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex justify-between items-start mb-10 print:hidden">
          <button onClick={() => navigate('/legajos')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-blue-600 transition">
            <ArrowLeft size={18} /> Volver
          </button>
          <div className="text-right">
            <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter leading-none">{alumno.apellido}, {alumno.nombre}</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">I.A.D. SANTA CATALINA</p>
          </div>
        </header>

        {/* PANEL DE CONTROL DEL DIRECTOR (No se imprime) */}
        {perfil?.rol === 'director' && (
          <div className="mb-8 bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl print:hidden flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-2xl"><FileText size={32}/></div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Reporte de Actividades</h3>
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Configurar periodo para imprimir</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-blue-700 p-2 rounded-2xl">
              <select className="bg-transparent border-none text-xs font-black outline-none cursor-pointer px-2" value={mesReporte} onChange={(e) => setMesReporte(e.target.value)}>
                {nombresMeses.map((mes, idx) => (
                  <option key={mes} value={idx + 1}>{mes.toUpperCase()}</option>
                ))}
              </select>

              <select className="bg-white text-blue-600 rounded-xl px-4 py-2 text-xs font-black outline-none" value={anioReporte} onChange={(e) => setAnioReporte(e.target.value)}>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>

              <button onClick={() => window.print()} className="bg-green-500 text-white px-6 py-2 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-green-600 transition flex items-center gap-2">
                <Printer size={16}/> Imprimir
              </button>
            </div>
          </div>
        )}

        {/* SECCIÓN DE DATOS MÉDICOS (No se imprime) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden mb-8">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-sm border border-blue-50 flex flex-col justify-between">
           <div>
            <h3 className="text-[10px] font-black text-blue-600 uppercase mb-4 flex items-center gap-2"><Heart size={14}/> Ficha Médica</h3>
              <p className="text-sm font-black text-red-600 uppercase">{alumno.datos_medicos?.diagnostico || "Sin diagnóstico"}</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1"><Pill size={12}/> Medicación</p>
              <p className="text-xs font-bold text-red-800 italic">{alumno.datos_medicos?.medicamentos || "No registra"}</p>
        </div>
        </div>
    
    {/* Botón de Acción Versión 2.0 */}
    <button 
      onClick={() => window.open(`/alumno/${id}/ficha-medica`, '_blank')}
      className="mt-6 w-full bg-red-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-lg shadow-red-100 active:scale-95"
    >
      <Printer size={14}/> Generar Ficha Médica
    </button>
  </div>
  
  <div className="lg:col-span-2">
    {/* Tu código de "Nueva Actividad" se mantiene igual... */}
    <div className="bg-orange-50/90 backdrop-blur-sm p-8 rounded-[2.5rem] border border-orange-100">
       {/* ... contenido previo ... */}
    </div>
  </div>
</div>

        {/* --- REPORTE IMPRIMIBLE (Glassmorphism en pantalla, Blanco Puro en papel) --- */}
        <div className="bg-white/90 backdrop-blur-sm p-10 md:p-16 rounded-[2.5rem] border border-gray-100 shadow-sm print:shadow-none print:border-none print:bg-white print:p-0">
          
          {/* TÍTULO REQUERIDO: Actividades del Mes */}
          <div className="mb-10 pb-6 border-b-2 border-blue-600">
            <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">
              Actividades del Mes: {nombresMeses[mesReporte - 1]} del {anioReporte}
            </h2>
            <div className="flex justify-between items-end mt-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Legajo Pedagógico • {alumno.apellido}, {alumno.nombre}</p>
              <p className="text-[10px] font-black text-blue-600 uppercase print:block hidden">I.A.D. Santa Catalina</p>
            </div>
          </div>

          {/* LISTADO DE ACTIVIDADES POR DÍA */}
          <div className="space-y-8">
            {actividadesFiltradas.length > 0 ? (
              actividadesFiltradas.map((e) => (
                <div key={e.id} className="pb-6 border-b border-gray-100 last:border-0 print:break-inside-avoid">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white p-2 rounded-lg font-black text-[10px] uppercase">Día {new Date(e.fecha).getDate()}</div>
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{e.area || "Docencia"}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{new Date(e.fecha).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium italic bg-gray-50/50 p-4 rounded-2xl border border-gray-100 print:bg-white print:border-none print:p-0">
                    "{e.contenido}"
                  </p>
                  <p className="text-[9px] font-black text-gray-400 mt-4 text-right uppercase tracking-widest">
                    Responsable: {e.perfiles?.nombre_completo}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center py-20 text-gray-300 font-black uppercase text-xs">Sin registros en el periodo seleccionado</p>
            )}
          </div>

          {/* FIRMAS AL PIE (Solo impresión) */}
          <div className="hidden print:flex justify-between mt-32 px-10">
             <div className="text-center">
                <div className="w-48 border-b-2 border-gray-300 mb-2"></div>
                <p className="text-[9px] font-black uppercase text-gray-400">Dirección</p>
             </div>
             <div className="text-center">
                <div className="w-48 border-b-2 border-gray-300 mb-2"></div>
                <p className="text-[9px] font-black uppercase text-gray-400">Firma del Familiar</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FichaAlumno;