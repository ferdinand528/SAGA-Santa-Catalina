import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase'; 
import { 
  ArrowLeft, Heart, Printer, ClipboardList, 
  CheckCircle2, Circle, Loader2, FileEdit, Activity, 
  ImageIcon, Save, Edit3, XCircle, Trash2 
} from 'lucide-react';

// --- 🪄 FUNCIÓN DE COMPRESIÓN (Definida fuera para evitar el ReferenceError) ---
const comprimirImagen = (archivo) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(archivo);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.canvas.toBlob((blob) => {
          const fileComprimido = new File([blob], archivo.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(fileComprimido);
        }, 'image/jpeg', 0.7);
      };
    };
  });
};

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

  // 🛡️ Lógica de Roles Estandarizada
  const rolUsuario = perfil?.rol?.toLowerCase();
  const esGestion = ['director', 'administrador', 'coordinacion'].includes(rolUsuario);

  const cargarEvoluciones = useCallback(async () => {
    const { data } = await supabase
      .from('evoluciones')
      .select('id, fecha, contenido, area, fotos, profesional_id, perfiles(nombre_completo)')
      .eq('alumno_id', id)
      .order('fecha', { ascending: false });
    setEvoluciones(data || []);
  }, [id]);

  const initFicha = useCallback(async () => {
    if (!id) { navigate('/dashboard'); return; }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: p } = await supabase
        .from('perfiles')
        .select('id, rol, profesion, nombre_completo')
        .eq('id', user.id)
        .single();
      setPerfil(p);

      const { data: alu, error: aluError } = await supabase
        .from('alumnos')
        .select(`*`)
        .eq('id', id)
        .single();

      if (aluError || !alu) { 
        navigate('/dashboard'); 
        return; 
      }

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

  // 🛡️ POLÍTICA DE LIMPIEZA: Borra de Storage y luego de la DB
  const borrarEvolucion = async (evolucionId) => {
    const confirmar = window.confirm("¿Estás seguro? Se eliminará el registro y sus fotos permanentemente.");
    if (!confirmar) return;

    setSaving(true);
    try {
      const { data: ev } = await supabase
        .from('evoluciones')
        .select('fotos')
        .eq('id', evolucionId)
        .single();

      if (ev?.fotos?.length > 0) {
        const pathsABorrar = ev.fotos.map(url => url.split('actividades/')[1]);
        await supabase.storage.from('actividades').remove(pathsABorrar);
      }

      const { error: errorDB } = await supabase.from('evoluciones').delete().eq('id', evolucionId);
      if (errorDB) throw errorDB;

      await cargarEvoluciones();
    } catch (err) {
      alert("Error en la limpieza: " + err.message);
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
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleDoc = async (campo, valorActual) => {
    if (!esGestion) return; 
    try {
      const nuevoValor = !valorActual;
      await supabase.from('alumnos').update({ [campo]: nuevoValor }).eq('id', id);
      setAlumno(prev => ({ ...prev, [campo]: nuevoValor }));
    } catch (error) { console.error(error); }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (fotos.length + files.length > 5) { 
      alert("Máximo 5 fotos."); 
      return; 
    }

    setSaving(true); 
    const fotosComprimidas = [];
    const nuevasPreviews = [];

    for (const file of files) {
      try {
        const comprimida = await comprimirImagen(file); // 🪄 Ahora sí está definida
        fotosComprimidas.push(comprimida);
        nuevasPreviews.push(URL.createObjectURL(comprimida));
      } catch (e) {
        console.error("Error comprimiendo:", e);
      }
    }

    setFotos(prev => [...prev, ...fotosComprimidas]);
    setPreviews(prev => [...prev, ...nuevasPreviews]);
    setSaving(false);
  };

  const guardarActividad = async () => {
    if (!nuevaActividad.trim()) return;
    setSaving(true);
    try {
      let urlsFinales = [];
      for (const file of fotos) {
        const extension = file.name.split('.').pop() || 'jpg';
        const fileName = `${id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
        
        const { error: upError } = await supabase.storage.from('actividades').upload(fileName, file);
        if (upError) throw upError;

        const { data: { publicUrl } } = supabase.storage.from('actividades').getPublicUrl(fileName);
        urlsFinales.push(publicUrl);
      }

      const { error: insError } = await supabase.from('evoluciones').insert([{ 
        alumno_id: id, profesional_id: perfil.id, contenido: nuevaActividad, 
        area: perfil.profesion || 'Docencia', fotos: urlsFinales, fecha: new Date().toISOString() 
      }]);
      
      if (insError) throw insError;

      setNuevaActividad(""); setFotos([]); setPreviews([]); await cargarEvoluciones();
    } catch (err) { 
      alert("Error al guardar: " + err.message); 
    } finally { 
      setSaving(false); 
    }
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
    <div className="h-screen flex flex-col items-center justify-center bg-transparent">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Sincronizando Legajo v3.3...</p>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-gray-800 bg-transparent animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex justify-between items-start mb-10 print:hidden">
          <button onClick={() => navigate('/legajos')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-[#84bd00] transition bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <ArrowLeft size={16} /> VOLVER A LEGAJOS
          </button>
          <div className="text-right">
            <h1 className="text-4xl font-black text-[#1a3a5f] uppercase tracking-tighter leading-none">
              {alumno?.apellido}, {alumno?.nombre}
            </h1>
            <p className="text-[10px] font-black text-[#84bd00] uppercase tracking-[0.4em] mt-2 italic">
              DNI: {alumno?.dni} • SANTA CATALINA LEGAJO DIGITAL
            </p>
          </div>
        </header>

        {esGestion && (
          <div className="mb-10 bg-white/80 backdrop-blur-md p-8 rounded-[3rem] border border-white shadow-sm print:hidden">
            <div className="flex items-center gap-4 mb-6 border-b pb-4 text-blue-600">
              <ClipboardList size={22}/>
              <h3 className="text-xs font-black uppercase tracking-widest leading-none">Control de Legajo Físico (Auditoría)</h3>
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
          <div className="bg-white/80 backdrop-blur-md p-10 rounded-[3rem] shadow-sm border border-white space-y-6 h-fit">
            <div className="flex items-center gap-2 text-red-600 border-b pb-4">
              <Heart size={16} />
              <h3 className="font-black text-[10px] uppercase tracking-widest">Salud y Diagnóstico</h3>
            </div>
            <div className="text-center py-4">
              <h4 className="text-red-700 font-black text-xl uppercase tracking-tighter italic">
                "{alumno?.patologia || "SIN DIAGNÓSTICO"}"
              </h4>
            </div>
            <button onClick={() => window.open(`/alumno/${id}/ficha-medica`, '_blank')} className="w-full bg-red-600 text-white p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-lg hover:bg-black transition-all">
              <Printer size={18}/> Imprimir Ficha Médica
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#fff9f2]/90 backdrop-blur-sm p-10 rounded-[3rem] shadow-sm border border-orange-100">
              <div className="flex items-center gap-2 text-orange-600 mb-6">
                <FileEdit size={18} />
                <h3 className="font-black text-[10px] uppercase tracking-widest">Nueva Evolución Diaria</h3>
              </div>
              <textarea className="w-full p-8 bg-white rounded-[2rem] border-none outline-none font-bold text-gray-700 shadow-inner focus:ring-4 focus:ring-orange-100 transition-all mb-6 min-h-[150px] resize-none" placeholder="Escribí aquí el resumen de hoy..." value={nuevaActividad} onChange={(e) => setNuevaActividad(e.target.value)} />
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                 <label className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase cursor-pointer bg-white px-6 py-4 rounded-2xl shadow-sm border border-orange-50 hover:bg-orange-50 transition-all">
                   <ImageIcon size={18} />
                   <span>Cargar Fotos ({fotos.length}/5)</span>
                   <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                 </label>
                 <button onClick={guardarActividad} disabled={saving || !nuevaActividad} className="w-full md:w-auto bg-[#ff6b00] text-white px-10 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#1a3a5f] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {saving ? <Loader2 className="animate-spin" /> : <Save size={18}/>}
                  {saving ? 'PROCESANDO...' : 'REGISTRAR ACTIVIDAD'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-10 md:p-16 rounded-[4rem] border border-gray-100 shadow-sm mb-20">
          <div className="flex items-center gap-3 mb-10 border-b-2 border-blue-600 pb-6">
            <Activity size={24} className="text-blue-600"/>
            <h2 className="text-3xl font-black text-[#1a3a5f] uppercase tracking-tighter">Historial Pedagógico</h2>
          </div>
          
          <div className="space-y-12">
            {evoluciones.map((e) => {
              const esPropio = e.profesional_id === perfil?.id;

              return (
                <div key={e.id} className="relative pl-8 border-l-2 border-gray-100 pb-10 last:border-0 last:pb-0">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-4 border-blue-500 rounded-full shadow-sm" />
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{e.area}</span>
                      <span className="text-[10px] font-bold text-gray-400">{new Date(e.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}hs</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {esPropio && (
                        <button 
                          onClick={() => borrarEvolucion(e.id)}
                          className="flex items-center gap-1 text-[9px] font-black text-red-500 uppercase bg-red-50 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={12}/> Borrar
                        </button>
                      )}
                      <span className="text-[9px] font-black text-gray-300 uppercase italic">Prof: {e.perfiles?.nombre_completo}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-50 shadow-inner">
                    <p className="text-sm text-gray-700 leading-relaxed font-medium italic">"{e.contenido}"</p>
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