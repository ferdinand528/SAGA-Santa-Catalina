import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase'; 
import { 
  ArrowLeft, Heart, Printer, ClipboardList, 
  CheckCircle2, Circle, Loader2 
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

  // 1. FUNCIONES MEMORIZADAS
  const cargarEvoluciones = useCallback(async () => {
    const { data } = await supabase
      .from('evoluciones')
      .select('*, perfiles(nombre_completo)')
      .eq('alumno_id', id)
      .order('fecha', { ascending: false });
    setEvoluciones(data || []);
  }, [id]);

  const initFicha = useCallback(async () => {
    if (!id) { navigate('/legajos'); return; }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: p } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
      setPerfil(p);

      const { data: alu } = await supabase.from('alumnos').select('*, datos_medicos(*)').eq('id', id).single();
      if (!alu) { navigate('/legajos'); return; }
      setAlumno(alu);

      await cargarEvoluciones();
    } catch (error) {
      console.error("Error cargando ficha:", error);
    } finally {
      setLoading(false);
    }
  }, [id, navigate, cargarEvoluciones]);

  // 2. EFECTO DE CARGA
  useEffect(() => {
    initFicha();
  }, [initFicha]);

  // 3. ACCIONES
  const toggleDoc = async (campo, valorActual) => {
    try {
      const nuevoValor = !valorActual;
      await supabase.from('alumnos').update({ [campo]: nuevoValor }).eq('id', id);
      setAlumno(prev => ({ ...prev, [campo]: nuevoValor }));
    } catch (error) { 
      console.error("Error checklist:", error); 
    }
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

      await supabase.from('evoluciones').insert([{ 
        alumno_id: id, 
        profesional_id: perfil.id, 
        contenido: nuevaActividad, 
        area: perfil.profesion || 'Docencia', 
        fotos: urlsFinales,
        fecha: new Date().toISOString() 
      }]);

      setNuevaActividad(""); 
      setFotos([]); 
      setPreviews([]); 
      await cargarEvoluciones();
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
    { id: 'doc_salidas', label: 'Permiso Salidas' }, { id: 'doc_transporte', label: 'Transporte' },
    { id: 'doc_evaluacion', label: 'Inf. Evaluación' }, { id: 'doc_plan_tratamiento', label: 'Plan Tratamiento' }
  ];

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fcfaf7]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Sincronizando Legajo v2.1...</p>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-gray-800 bg-transparent animate-fade-in">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex justify-between items-start mb-10 print:hidden">
          <button onClick={() => navigate('/legajos')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-blue-600 transition">
            <ArrowLeft size={18} /> Volver a Legajos
          </button>
          <div className="text-right">
            <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter leading-none">
              {alumno?.apellido}, {alumno?.nombre}
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">I.A.D. SANTA CATALINA</p>
          </div>
        </header>

        {/* CHECKLIST EXCLUSIVO DIRECTOR */}
        {perfil?.rol === 'director' && (
          <div className="mb-8 bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-100 shadow-sm print:hidden">
            <div className="flex items-center gap-4 mb-6 border-b pb-4 text-indigo-600">
              <ClipboardList size={22}/>
              <h3 className="text-xs font-black uppercase tracking-widest leading-none">Control de Legajo Físico</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {docsChecklist.map((doc) => (
                <button 
                  key={doc.id} 
                  onClick={() => toggleDoc(doc.id, alumno[doc.id])} 
                  className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all active:scale-95 ${alumno[doc.id] ? 'border-green-200 bg-green-50' : 'border-gray-50 bg-gray-50/50'}`}
                >
                  {alumno[doc.id] ? <CheckCircle2 size={18} className="text-green-500 mb-2" /> : <Circle size={18} className="text-gray-200 mb-2" />}
                  <span className={`text-[8px] font-black uppercase leading-tight text-center ${alumno[doc.id] ? 'text-green-600' : 'text-gray-400'}`}>{doc.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden mb-8">
          {/* EMERGENCIAS */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-blue-50">
            <h3 className="text-[10px] font-black text-blue-600 uppercase mb-4 flex items-center gap-2 tracking-widest"><Heart size={14}/> Emergencias</h3>
            {/* CORRECCIÓN: Comillas escapadas con &quot; */}
            <p className="text-sm font-black text-red-600 uppercase italic">
              &quot;{alumno.datos_medicos?.diagnostico || "Sin diagnóstico registrado"}&quot;
            </p>
            <button onClick={() => window.open(`/alumno/${id}/ficha-medica`, '_blank')} className="mt-6 w-full bg-red-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] shadow-lg hover:bg-black transition-all">
              <Printer size={14} className="inline mr-2"/> Ficha Médica
            </button>
          </div>

          {/* EVOLUCIÓN */}
          <div className="lg:col-span-2">
            <div className="p-8 rounded-[2.5rem] border shadow-sm bg-white border-gray-100">
              <textarea 
                className="w-full p-6 bg-gray-50 rounded-3xl border border-transparent outline-none font-bold text-sm min-h-[120px] focus:border-blue-200 transition-all" 
                placeholder="Escribir evolución pedagógica o terapéutica..." 
                value={nuevaActividad} 
                onChange={(e) => setNuevaActividad(e.target.value)} 
              />
              <div className="flex justify-between items-center mt-4">
                 <input type="file" multiple className="hidden" id="fotos" onChange={handleFileChange} />
                 <label htmlFor="fotos" className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase cursor-pointer hover:bg-blue-50 px-4 py-2 rounded-xl transition-all">
                   Cargar Fotos ({fotos.length})
                 </label>
                 <button 
                  onClick={guardarActividad} 
                  disabled={saving || !nuevaActividad} 
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50"
                >
                  {saving ? 'GUARDANDO...' : 'Registrar Evolución'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LISTADO DE EVOLUCIONES */}
        <div className="bg-white/90 p-10 md:p-16 rounded-[3rem] border border-gray-100 shadow-sm mb-20">
          <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tighter border-b-2 border-blue-600 pb-6 mb-10">Historial Pedagógico</h2>
          <div className="space-y-12">
            {evoluciones.length === 0 ? (
              <p className="text-center text-gray-300 font-black uppercase text-xs tracking-widest py-10 italic">No hay registros aún</p>
            ) : (
              evoluciones.map((e) => (
                <div key={e.id} className="pb-8 border-b border-gray-50 last:border-0 animate-fade-in">
                  <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase">
                    <span className="text-blue-500 bg-blue-50 px-3 py-1 rounded-full">{e.area}</span>
                    <span className="text-gray-300 italic">Por: {e.perfiles?.nombre_completo}</span>
                  </div>
                  {/* CORRECCIÓN: Comillas escapadas con &quot; */}
                  <p className="text-sm text-gray-700 leading-relaxed font-medium bg-gray-50/30 p-8 rounded-[2rem]">
                    &quot;{e.contenido}&quot;
                  </p>
                  {e.fotos?.length > 0 && (
                    <div className="flex gap-3 mt-6">
                      {e.fotos.map((url, i) => (
                        <img 
                          key={i} 
                          src={url} 
                          alt="Actividad" 
                          className="w-24 h-24 object-cover rounded-2xl border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-all" 
                          onClick={() => window.open(url, '_blank')} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FichaAlumno;