import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, Heart, Pill, Printer, ClipboardList, 
  FileText, Camera, X, Image as ImageIcon, Clock,
  Trash2, Edit3 
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
  
  // Estados para Registro Multimedia y Edición v2.0
  const [fotos, setFotos] = useState([]); 
  const [previews, setPreviews] = useState([]); 
  const [editandoId, setEditandoId] = useState(null);

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
      await cargarEvoluciones();
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const cargarEvoluciones = async () => {
    const { data } = await supabase.from('evoluciones')
      .select('*, perfiles(nombre_completo)')
      .eq('alumno_id', id)
      .order('fecha', { ascending: false });
    setEvoluciones(data || []);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (fotos.length + files.length > 5) {
      alert("Máximo 5 fotos por registro.");
      return;
    }
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setFotos([...fotos, ...files]);
    setPreviews([...previews, ...newPreviews]);
  };

  const quitarFoto = (index) => {
    setFotos(fotos.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  // Ayudante de Permisos v2.0
  const puedeEditarDocente = (fechaCreacion) => {
    const diferenciaMinutos = (new Date() - new Date(fechaCreacion)) / (1000 * 60);
    return diferenciaMinutos <= 10;
  };

  const eliminarEvolucion = async (evoId, fotosUrls) => {
    if (!window.confirm("¿Confirmás la eliminación permanente de este registro?")) return;
    try {
      const { error } = await supabase.from('evoluciones').delete().eq('id', evoId);
      if (!error) {
        if (fotosUrls?.length > 0) {
          const paths = fotosUrls.map(url => url.split('/actividades/')[1]);
          await supabase.storage.from('actividades').remove(paths);
        }
        await cargarEvoluciones();
      }
    } catch (err) { console.error("Error al eliminar:", err); }
  };

  const guardarActividad = async () => {
    if (!nuevaActividad.trim()) return;
    setSaving(true);
    try {
      // Separamos fotos ya subidas (URLs) de fotos nuevas (archivos File)
      let urlsFinales = previews.filter(p => p.startsWith('http'));
      const archivosNuevos = fotos.filter(f => f instanceof File);

      for (const file of archivosNuevos) {
        const fileName = `${id}/${Date.now()}-${Math.random()}.${file.name.split('.').pop()}`;
        const { error: upError } = await supabase.storage.from('actividades').upload(fileName, file);
        if (!upError) {
          const { data: { publicUrl } } = supabase.storage.from('actividades').getPublicUrl(fileName);
          urlsFinales.push(publicUrl);
        }
      }

      const payload = {
        alumno_id: id,
        profesional_id: perfil.id,
        contenido: nuevaActividad,
        area: perfil.profesion || 'Docencia',
        fotos: urlsFinales,
      };

      if (editandoId) {
        await supabase.from('evoluciones').update(payload).eq('id', editandoId);
      } else {
        await supabase.from('evoluciones').insert([{ ...payload, fecha: new Date().toISOString() }]);
      }

      setNuevaActividad(""); setFotos([]); setPreviews([]); setEditandoId(null);
      await cargarEvoluciones();
    } finally { setSaving(false); }
  };

  const actividadesFiltradas = evoluciones.filter(e => {
    const fecha = new Date(e.fecha);
    return (fecha.getMonth() + 1) === parseInt(mesReporte) && fecha.getFullYear() === parseInt(anioReporte);
  });

  if (loading || !alumno) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse text-2xl uppercase">Cargando v2.0...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="flex justify-between items-start mb-10 print:hidden">
          <button onClick={() => navigate('/legajos')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-blue-600 transition">
            <ArrowLeft size={18} /> Volver a Legajos
          </button>
          <div className="text-right">
            <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter leading-none">{alumno.apellido}, {alumno.nombre}</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">I.A.D. SANTA CATALINA</p>
          </div>
        </header>

        {/* PANEL DIRECTOR: REPORTE MENSUAL */}
        {perfil?.rol === 'director' && !editandoId && (
          <div className="mb-8 bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl print:hidden flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-2xl"><FileText size={32}/></div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Reporte Mensual</h3>
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mt-1">Gestión Institucional v2.0</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-blue-700/50 p-2 rounded-2xl">
              <select className="bg-transparent border-none text-xs font-black outline-none cursor-pointer px-2" value={mesReporte} onChange={(e) => setMesReporte(e.target.value)}>
                {nombresMeses.map((mes, idx) => (<option key={mes} value={idx + 1}>{mes.toUpperCase()}</option>))}
              </select>
              <select className="bg-white text-blue-600 rounded-xl px-4 py-2 text-xs font-black outline-none" value={anioReporte} onChange={(e) => setAnioReporte(e.target.value)}>
                <option value="2025">2025</option><option value="2026">2026</option>
              </select>
              <button onClick={() => window.print()} className="bg-green-500 text-white px-6 py-2 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-green-600 transition flex items-center gap-2">
                <Printer size={16}/> Imprimir
              </button>
            </div>
          </div>
        )}

        {/* SECCION CENTRAL: FORMULARIO Y FICHA MEDICA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden mb-8">
          <div className="bg-white/90 p-8 rounded-[2.5rem] shadow-sm border border-blue-50 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black text-blue-600 uppercase mb-4 flex items-center gap-2 tracking-widest"><Heart size={14}/> Emergencias</h3>
              <p className="text-sm font-black text-red-600 uppercase italic leading-tight">"{alumno.datos_medicos?.diagnostico || "Sin diagnóstico"}"</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1"><Pill size={12}/> Medicación</p>
                <p className="text-xs font-bold text-red-800 italic">{alumno.datos_medicos?.medicamentos || "No registra"}</p>
              </div>
            </div>
            <button onClick={() => window.open(`/alumno/${id}/ficha-medica`, '_blank')} className="mt-6 w-full bg-red-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-lg active:scale-95">
              <Printer size={14}/> Ficha de Emergencia
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className={`p-8 rounded-[2.5rem] border shadow-sm transition-all ${editandoId ? 'bg-blue-50 border-blue-200 shadow-blue-100' : 'bg-orange-50/90 border-orange-100 shadow-orange-50'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xs font-black uppercase flex items-center gap-2 ${editandoId ? 'text-blue-600' : 'text-orange-600'}`}>
                  <ClipboardList size={18}/> {editandoId ? 'Editando Actividad' : 'Nueva Actividad Diaria'}
                </h3>
                {editandoId && (
                  <button onClick={() => {setEditandoId(null); setNuevaActividad(""); setFotos([]); setPreviews([]);}} className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 hover:underline">
                    <X size={12}/> Cancelar
                  </button>
                )}
              </div>
              
              <textarea className="w-full p-6 bg-white/80 rounded-3xl border border-transparent outline-none font-bold text-sm min-h-[100px] shadow-inner focus:bg-white transition" placeholder="¿Qué trabajaron hoy?..." value={nuevaActividad} onChange={(e) => setNuevaActividad(e.target.value)} />
              
              <div className="mt-4 flex flex-wrap gap-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative w-16 h-16 group">
                    <img src={src} className="w-full h-full object-cover rounded-xl border-2 border-white shadow-sm" alt="Preview" />
                    <button onClick={() => quitarFoto(idx)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:scale-110 transition"><X size={10}/></button>
                  </div>
                ))}
                {fotos.length < 5 && (
                  <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-white transition-all text-gray-400">
                    <Camera size={20} /><span className="text-[8px] font-black uppercase mt-1">Fotos</span>
                    <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>

              <button onClick={guardarActividad} disabled={saving || !nuevaActividad} className={`mt-6 w-full ${editandoId ? 'bg-blue-600' : 'bg-orange-600'} text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:opacity-90 transition shadow-xl`}>
                {saving ? 'PROCESANDO...' : editandoId ? 'Actualizar Cambios' : 'Registrar Actividad'}
              </button>
            </div>
          </div>
        </div>

        {/* LISTADO: COMENTARIO + MINIATURAS JUNTOS v2.0 */}
        <div className="bg-white/90 p-10 md:p-16 rounded-[2.5rem] border border-gray-100 shadow-sm print:p-0 print:border-none print:shadow-none">
          <div className="mb-10 pb-6 border-b-2 border-blue-600">
            <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Historial Pedagógico</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase mt-4 tracking-widest italic">Actividades del Mes Seleccionado</p>
          </div>

          <div className="space-y-12">
            {actividadesFiltradas.length > 0 ? (
              actividadesFiltradas.map((e) => (
                <div key={e.id} className="pb-8 border-b border-gray-100 last:border-0 print:break-inside-avoid">
                  
                  {/* Metadata y Controles de Rol v2.0 */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-900 text-white px-3 py-1 rounded-lg font-black text-[9px] uppercase shadow-md flex items-center gap-1 tabular-nums">
                        <Clock size={12}/> {new Date(e.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">{e.area}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter italic">Por: {e.perfiles?.nombre_completo}</p>
                      
                      <div className="flex gap-2 print:hidden">
                        {(perfil?.rol === 'director' || (perfil?.rol === 'docente' && puedeEditarDocente(e.fecha))) && (
                          <button 
                            onClick={() => {
                              setEditandoId(e.id);
                              setNuevaActividad(e.contenido);
                              setFotos(e.fotos || []);
                              setPreviews(e.fotos || []);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            className="text-blue-400 hover:text-blue-600 transition"
                            title="Editar"
                          >
                            <Edit3 size={14}/>
                          </button>
                        )}
                        {perfil?.rol === 'director' && (
                          <button 
                            onClick={() => eliminarEvolucion(e.id, e.fotos)} 
                            className="text-red-300 hover:text-red-600 transition"
                            title="Borrar"
                          >
                            <Trash2 size={14}/>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Contenedor Flex: Texto a la izquierda, Fotos a la derecha v2.0 */}
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 leading-relaxed font-medium italic bg-gray-50/50 p-6 rounded-3xl border border-gray-50 print:bg-white print:p-0 print:border-none">
                        "{e.contenido}"
                      </p>
                    </div>

                    {e.fotos && e.fotos.length > 0 && (
                      <div className="flex md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                        {e.fotos.map((url, i) => (
                          <img 
                            key={i} 
                            src={url} 
                            onClick={() => window.open(url, '_blank')}
                            className="w-20 h-20 object-cover rounded-2xl shadow-md border-2 border-white hover:scale-110 transition-transform cursor-pointer" 
                            alt="Evidencia" 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center opacity-20">
                <ImageIcon size={48} className="mx-auto mb-4 text-gray-400"/>
                <p className="font-black uppercase text-xs tracking-widest">Sin registros en este periodo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FichaAlumno;