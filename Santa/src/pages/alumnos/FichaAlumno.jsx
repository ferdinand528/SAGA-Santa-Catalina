import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase'; 
import { 
  ArrowLeft, Heart, Printer, ClipboardList, 
  CheckCircle2, Circle, Loader2, FileEdit, Activity, 
  Image as ImageIcon, Save, Edit3, XCircle, Trash2 // <--- Agregué Trash2
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
  
  const [fotos, setFotos] = useState([]); 
  const [previews, setPreviews] = useState([]); 

  const [editandoId, setEditandoId] = useState(null);
  const [contenidoEditado, setContenidoEditado] = useState("");

  const esGestion = perfil?.rol === 'director' || perfil?.rol === 'administrador';

  // 1. CARGA DE DATOS
  const cargarEvoluciones = useCallback(async () => {
    const { data } = await supabase
      .from('evoluciones')
      .select('*, perfiles(nombre_completo)')
      .eq('alumno_id', id)
      .order('fecha', { ascending: false });
    setEvoluciones(data || []);
  }, [id]);

  const initFicha = useCallback(async () => {
    if (!id) { navigate('/dashboard'); return; }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: p } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
      setPerfil(p);
      const { data: alu } = await supabase.from('alumnos').select('*').eq('id', id).single();
      if (!alu) { navigate('/dashboard'); return; }
      setAlumno(alu);
      await cargarEvoluciones();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [id, navigate, cargarEvoluciones]);

  useEffect(() => {
    initFicha();
  }, [initFicha]);

  // --- NUEVA FUNCIÓN PARA BORRAR ---
  const borrarEvolucion = async (evolucionId) => {
    const confirmar = window.confirm("¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.");
    if (!confirmar) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('evoluciones')
        .delete()
        .eq('id', evolucionId);

      if (error) throw error;
      await cargarEvoluciones();
    } catch (err) {
      alert("Error al borrar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const actualizarEvolucion = async (evolucionId) => {
    if (!contenidoEditado.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('evoluciones')
        .update({ contenido: contenidoEditado })
        .eq('id', evolucionId);
      if (error) throw error;
      setEditandoId(null);
      await cargarEvoluciones();
    } catch (err) {
      alert("Error al actualizar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ... (toggleDoc, handleFileChange y guardarActividad se mantienen igual)
  const toggleDoc = async (campo, valorActual) => {
    if (!esGestion) return;
    try {
      const nuevoValor = !valorActual;
      await supabase.from('alumnos').update({ [campo]: nuevoValor }).eq('id', id);
      setAlumno(prev => ({ ...prev, [campo]: nuevoValor }));
    } catch (error) { console.error(error); }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (fotos.length + files.length > 5) { alert("Máximo 5 fotos."); return; }
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setFotos(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const guardarActividad = async () => {
    if (!nuevaActividad.trim()) return;
    setSaving(true);
    try {
      let urlsFinales = [];
      for (const file of fotos) {
        const fileName = `${id}/${Date.now()}-${Math.random()}.${file.name.split('.').pop()}`;
        const { error: upError } = await supabase.storage.from('actividades').upload(fileName, file);
        if (!upError) {
          const { data: { publicUrl } } = supabase.storage.from('actividades').getPublicUrl(fileName);
          urlsFinales.push(publicUrl);
        }
      }
      await supabase.from('evoluciones').insert([{ 
        alumno_id: id, profesional_id: perfil.id, contenido: nuevaActividad, 
        area: perfil.profesion || 'Docencia', fotos: urlsFinales, fecha: new Date().toISOString() 
      }]);
      setNuevaActividad(""); setFotos([]); setPreviews([]); await cargarEvoluciones();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };

  const docsChecklist = [
    { id: 'doc_dni_alumno', label: 'DNI Alumno' }, { id: 'doc_dni_tutor', label: 'DNI Tutor' },
    { id: 'doc_cuil_alumno', label: 'CUIL Alumno' }, { id: 'doc_cuil_tutor', label: 'CUIL Tutor' },
    { id: 'doc_cud', label: 'Certificado CUD' }, { id: 'doc_historia_clinica', label: 'Hist. Clínica' },
    { id: 'doc_vacunacion', label: 'Carnet Vacunas' }, { id: 'doc_obra_social', label: 'Obra Social' },
    { id: 'doc_anamnesis', label: 'Anamnesis' }, { id: 'doc_permiso_fotos', label: 'Autoriz. Fotos' },
    { id: 'doc_permiso_salidas', label: 'Permiso Salidas' }, { id: 'doc_permiso_transporte', label: 'Transporte' },
    { id: 'doc_informe_evaluacion', label: 'Inf. Evaluación' }, { id: 'doc_plan_tratamiento', label: 'Plan Tratamiento' }
  ];

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fcfaf7]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Sincronizando Legajo v3.1...</p>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-gray-800 bg-[#fcfaf7] animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex justify-between items-start mb-10 print:hidden">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-[#84bd00] transition bg-white px-4 py-2 rounded-full shadow-sm">
            <ArrowLeft size={16} /> VOLVER AL PANEL
          </button>
          <div className="text-right">
            <h1 className="text-4xl font-black text-[#1a3a5f] uppercase tracking-tighter leading-none">
              {alumno?.apellido}, {alumno?.nombre}
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2 italic">SANTA CATALINA • LEGAJO DIGITAL</p>
          </div>
        </header>

        {/* 🛡️ SECCIÓN ADMINISTRATIVA (SOLO DIRECTOR/ADMIN) */}
        {esGestion && (
          <div className="mb-10 bg-white p-8 rounded-[3rem] border border-white shadow-sm print:hidden">
            <div className="flex items-center gap-4 mb-6 border-b pb-4 text-blue-600">
              <ClipboardList size={22}/>
              <h3 className="text-xs font-black uppercase tracking-widest leading-none">Control de Legajo Físico</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {docsChecklist.map((doc) => (
                <button key={doc.id} onClick={() => toggleDoc(doc.id, alumno[doc.id])} className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all ${alumno[doc.id] ? 'border-green-200 bg-green-50' : 'border-gray-50 bg-gray-50'}`}>
                  {alumno[doc.id] ? <CheckCircle2 size={18} className="text-green-500 mb-2" /> : <Circle size={18} className="text-gray-200 mb-2" />}
                  <span className={`text-[8px] font-black uppercase leading-tight text-center ${alumno[doc.id] ? 'text-green-600' : 'text-gray-400'}`}>{doc.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-white space-y-6 h-fit">
            <div className="flex items-center gap-2 text-red-600 border-b pb-4">
              <Heart size={16} />
              <h3 className="font-black text-[10px] uppercase tracking-widest">Salud y Diagnóstico</h3>
            </div>
            <div className="text-center py-4">
              <h4 className="text-red-700 font-black text-xl uppercase tracking-tighter italic">
                &quot;{alumno?.patologia || "SIN DIAGNÓSTICO"}&quot;
              </h4>
            </div>
            <button onClick={() => window.open(`/alumno/${id}/ficha-medica`, '_blank')} className="w-full bg-red-600 text-white p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-red-50 hover:bg-black transition-all">
              <Printer size={18}/> Imprimir Ficha Médica
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#fff9f2] p-10 rounded-[3rem] shadow-sm border border-orange-100">
              <div className="flex items-center gap-2 text-orange-600 mb-6">
                <FileEdit size={18} />
                <h3 className="font-black text-[10px] uppercase tracking-widest">Nueva Evolución Diaria</h3>
              </div>
              <textarea className="w-full p-8 bg-white rounded-[2rem] border-none outline-none font-bold text-gray-700 shadow-inner focus:ring-4 focus:ring-orange-100 transition-all mb-6 min-h-[150px] resize-none" placeholder="Escribí aquí el resumen de hoy..." value={nuevaActividad} onChange={(e) => setNuevaActividad(e.target.value)} />
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                 <label className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase cursor-pointer bg-white px-6 py-4 rounded-2xl shadow-sm hover:bg-orange-50 transition-all border border-orange-50">
                   <ImageIcon size={18} />
                   <span>Cargar Fotos ({fotos.length}/5)</span>
                   <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                 </label>
                 <button onClick={guardarActividad} disabled={saving || !nuevaActividad} className="w-full md:w-auto bg-[#ff6b00] text-white px-10 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#1a3a5f] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {saving ? <Loader2 className="animate-spin" /> : <Save size={18}/>}
                  {saving ? 'GUARDANDO...' : 'REGISTRAR ACTIVIDAD'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 🕒 HISTORIAL CON EDICIÓN Y BORRADO (10 MINUTOS) */}
        <div className="bg-white p-10 md:p-16 rounded-[4rem] border border-gray-100 shadow-sm mb-20">
          <div className="flex items-center gap-3 mb-10 border-b-2 border-blue-600 pb-6">
            <Activity size={24} className="text-blue-600"/>
            <h2 className="text-3xl font-black text-[#1a3a5f] uppercase tracking-tighter">Historial Pedagógico</h2>
          </div>
          
          <div className="space-y-12">
            {evoluciones.map((e) => {
              const ahora = new Date();
              const creacion = new Date(e.fecha);
              const diferenciaMin = (ahora - creacion) / 60000;
              const esPropio = e.profesional_id === perfil?.id;
              const dentroDelTiempo = diferenciaMin <= 10;
              const puedeModificar = esPropio && dentroDelTiempo;

              return (
                <div key={e.id} className="relative pl-8 border-l-2 border-gray-100 pb-10 last:border-0 last:pb-0">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-4 border-blue-500 rounded-full shadow-sm" />
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{e.area}</span>
                      <span className="text-[10px] font-bold text-gray-400">{new Date(e.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}hs</span>
                    </div>
                    
                    {/* BOTONES DE EDICIÓN Y BORRADO */}
                    <div className="flex items-center gap-4">
                      {puedeModificar && editandoId !== e.id && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { setEditandoId(e.id); setContenidoEditado(e.contenido); }}
                            className="flex items-center gap-1 text-[9px] font-black text-orange-500 uppercase bg-orange-50 px-3 py-1 rounded-lg hover:bg-orange-100 transition-all"
                          >
                            <Edit3 size={12}/> Editar
                          </button>
                          <button 
                            onClick={() => borrarEvolucion(e.id)}
                            className="flex items-center gap-1 text-[9px] font-black text-red-500 uppercase bg-red-50 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 size={12}/> Borrar
                          </button>
                          <span className="text-[8px] font-bold text-gray-300 uppercase italic self-center">
                            ({Math.floor(10 - diferenciaMin)} min restante)
                          </span>
                        </div>
                      )}
                      <span className="text-[9px] font-black text-gray-300 uppercase italic">Prof: {e.perfiles?.nombre_completo}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-50 shadow-inner">
                    {editandoId === e.id ? (
                      <div className="space-y-4">
                        <textarea 
                          className="w-full p-6 bg-white rounded-2xl border-2 border-orange-200 outline-none font-medium text-sm text-gray-700"
                          value={contenidoEditado}
                          onChange={(e) => setContenidoEditado(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => actualizarEvolucion(e.id)} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-md shadow-orange-100">
                            <Save size={14}/> Guardar
                          </button>
                          <button onClick={() => setEditandoId(null)} className="bg-gray-200 text-gray-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                            <XCircle size={14}/> Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed font-medium italic">&quot;{e.contenido}&quot;</p>
                    )}
                    {e.fotos?.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-6">
                        {e.fotos.map((url, i) => (
                          <img key={i} src={url} alt="Actividad" className="w-24 h-24 object-cover rounded-2xl border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-all" onClick={() => window.open(url, '_blank')} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FichaAlumno;