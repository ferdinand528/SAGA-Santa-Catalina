import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, Heart, Pill, Printer, ClipboardList, 
  FileText, Camera, X, Image as ImageIcon, Clock,
  Trash2, Edit3, Send, MessageSquare, CheckCircle2, Circle
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

  const [mensajesMuro, setMensajesMuro] = useState([]);
  const [nuevoMensajeMuro, setNuevoMensajeMuro] = useState("");

  const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const [mesReporte, setMesReporte] = useState(new Date().getMonth() + 1);
  const [anioReporte, setAnioReporte] = useState(new Date().getFullYear());

  const docsChecklist = [
    { id: 'doc_dni_alumno', label: 'DNI Alumno' },
    { id: 'doc_dni_tutor', label: 'DNI Tutor' },
    { id: 'doc_cuil_alumno', label: 'CUIL Alumno' },
    { id: 'doc_cuil_tutor', label: 'CUIL Tutor' },
    { id: 'doc_cud', label: 'Certificado CUD' },
    { id: 'doc_historia_clinica', label: 'Hist. Clínica' },
    { id: 'doc_vacunacion', label: 'Carnet Vacunas' },
    { id: 'doc_obra_social', label: 'Obra Social' },
    { id: 'doc_anamnesis', label: 'Anamnesis' },
    { id: 'doc_permiso_fotos', label: 'Autoriz. Fotos' },
    { id: 'doc_salidas', label: 'Permiso Salidas' },
    { id: 'doc_transporte', label: 'Transporte' },
    { id: 'doc_evaluacion', label: 'Inf. Evaluación' },
    { id: 'doc_plan_tratamiento', label: 'Plan Tratamiento' }
  ];

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: p } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
      setPerfil(p);
      const { data: alu } = await supabase.from('alumnos').select('*, datos_medicos(*)').eq('id', id).single();
      setAlumno(alu);
      await cargarEvoluciones();
      await cargarMuro();
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const toggleDoc = async (campo, valorActual) => {
    try {
      const nuevoValor = !valorActual;
      await supabase.from('alumnos').update({ [campo]: nuevoValor }).eq('id', id);
      setAlumno({ ...alumno, [campo]: nuevoValor });
    } catch (error) { console.error(error); }
  };

  const cargarEvoluciones = async () => {
    const { data } = await supabase.from('evoluciones').select('*, perfiles(nombre_completo)').eq('alumno_id', id).order('fecha', { ascending: false });
    setEvoluciones(data || []);
  };

  const cargarMuro = async () => {
    const { data } = await supabase.from('muro_interno').select('*, perfiles(nombre_completo, profesion)').eq('alumno_id', id).order('fecha', { ascending: false });
    setMensajesMuro(data || []);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (fotos.length + files.length > 5) { alert("Máximo 5 fotos."); return; }
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setFotos([...fotos, ...files]);
    setPreviews([...previews, ...newPreviews]);
  };

  const quitarFoto = (index) => {
    setFotos(fotos.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const puedeEditarDocente = (fecha) => (new Date() - new Date(fecha)) / (1000 * 60) <= 10;

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
      const payload = { alumno_id: id, profesional_id: perfil.id, contenido: nuevaActividad, area: perfil.profesion || 'Docencia', fotos: urlsFinales };
      if (editandoId) { await supabase.from('evoluciones').update(payload).eq('id', editandoId); }
      else { await supabase.from('evoluciones').insert([{ ...payload, fecha: new Date().toISOString() }]); }
      setNuevaActividad(""); setFotos([]); setPreviews([]); setEditandoId(null);
      await cargarEvoluciones();
    } finally { setSaving(false); }
  };

  const enviarMensajeMuro = async () => {
    if (!nuevoMensajeMuro.trim()) return;
    const { error } = await supabase.from('muro_interno').insert([{ alumno_id: id, profesional_id: perfil.id, mensaje: nuevoMensajeMuro }]);
    if (!error) { setNuevoMensajeMuro(""); await cargarMuro(); }
  };

  const eliminarEvolucion = async (evoId, fotosUrls) => {
    if (!window.confirm("¿Confirmás la eliminación permanente?")) return;
    const { error } = await supabase.from('evoluciones').delete().eq('id', evoId);
    if (!error) {
      if (fotosUrls?.length > 0) {
        const paths = fotosUrls.map(url => url.split('/actividades/')[1]);
        await supabase.storage.from('actividades').remove(paths);
      }
      await cargarEvoluciones();
    }
  };

  const actividadesFiltradas = evoluciones.filter(e => {
    const f = new Date(e.fecha);
    return (f.getMonth() + 1) === parseInt(mesReporte) && f.getFullYear() === parseInt(anioReporte);
  });

  if (loading || !alumno) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse text-2xl uppercase">S.A.G.A. v2.0...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-gray-800 bg-transparent">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-start mb-10 print:hidden">
          <button onClick={() => navigate('/legajos')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-blue-600 transition"><ArrowLeft size={18} /> Volver</button>
          <div className="text-right">
            <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter leading-none">{alumno.apellido}, {alumno.nombre}</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">I.A.D. SANTA CATALINA</p>
          </div>
        </header>

        {/* REPORTE MENSUAL (Director) */}
        {perfil?.rol === 'director' && !editandoId && (
          <div className="mb-8 bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl print:hidden flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4"><div className="bg-white/20 p-4 rounded-2xl"><FileText size={32}/></div><div><h3 className="text-xl font-black uppercase leading-none">Reporte Mensual</h3><p className="text-blue-100 text-[10px] font-bold uppercase mt-1">v2.0</p></div></div>
            <div className="flex items-center gap-3 bg-blue-700/50 p-2 rounded-2xl">
              <select className="bg-transparent border-none text-xs font-black outline-none px-2" value={mesReporte} onChange={(e) => setMesReporte(e.target.value)}>{nombresMeses.map((mes, idx) => (<option key={mes} value={idx + 1}>{mes.toUpperCase()}</option>))}</select>
              <select className="bg-white text-blue-600 rounded-xl px-4 py-2 text-xs font-black" value={anioReporte} onChange={(e) => setAnioReporte(e.target.value)}><option value="2025">2025</option><option value="2026">2026</option></select>
              <button onClick={() => window.print()} className="bg-green-500 text-white px-6 py-2 rounded-xl font-black text-xs uppercase shadow-lg flex items-center gap-2"><Printer size={16}/> Imprimir</button>
            </div>
          </div>
        )}

        {/* SECCIÓN RESTRINGIDA: CHECKLIST DE DOCUMENTACIÓN (SOLO DIRECTOR) */}
        {perfil?.rol === 'director' && (
          <div className="mb-8 bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-100 shadow-sm print:hidden">
            <div className="flex items-center gap-4 mb-6 border-b pb-4">
              <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600"><ClipboardList size={22}/></div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Checklist de Legajo Físico</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Exclusivo Dirección</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {docsChecklist.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id, alumno[doc.id])}
                  className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all active:scale-95 ${alumno[doc.id] ? 'border-green-200 bg-green-50' : 'border-gray-50 bg-gray-50/50 hover:border-red-100'}`}
                >
                  {alumno[doc.id] ? <CheckCircle2 size={18} className="text-green-500 mb-2" /> : <Circle size={18} className="text-gray-200 mb-2" />}
                  <span className={`text-[8px] font-black uppercase leading-tight text-center ${alumno[doc.id] ? 'text-green-600' : 'text-gray-400'}`}>
                    {doc.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* EMERGENCIAS Y ACTIVIDAD (VISIBLE PARA TODOS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden mb-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-blue-50 flex flex-col justify-between">
            <div><h3 className="text-[10px] font-black text-blue-600 uppercase mb-4 flex items-center gap-2 tracking-widest"><Heart size={14}/> Emergencias</h3><p className="text-sm font-black text-red-600 uppercase italic">"{alumno.datos_medicos?.diagnostico || "Sin diagnóstico"}"</p></div>
            <button onClick={() => window.open(`/alumno/${id}/ficha-medica`, '_blank')} className="mt-6 w-full bg-red-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 shadow-lg"><Printer size={14}/> Generar Ficha</button>
          </div>
          <div className="lg:col-span-2">
            <div className={`p-8 rounded-[2.5rem] border shadow-sm transition-all ${editandoId ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-100'}`}>
              <div className="flex justify-between items-center mb-4"><h3 className={`text-xs font-black uppercase flex items-center gap-2 ${editandoId ? 'text-blue-600' : 'text-orange-600'}`}><ClipboardList size={18}/> {editandoId ? 'Modificando' : 'Nueva Actividad'}</h3>{editandoId && <button onClick={() => {setEditandoId(null); setNuevaActividad(""); setFotos([]); setPreviews([]);}} className="text-[10px] font-black text-red-500 uppercase hover:underline">Cancelar</button>}</div>
              <textarea className="w-full p-6 bg-white/80 rounded-3xl border border-transparent outline-none font-bold text-sm min-h-[100px] shadow-inner" placeholder="Escribir evolución..." value={nuevaActividad} onChange={(e) => setNuevaActividad(e.target.value)} />
              <div className="mt-4 flex flex-wrap gap-3">{previews.map((src, idx) => (<div key={idx} className="relative w-16 h-16"><img src={src} className="w-full h-full object-cover rounded-xl border-2 border-white shadow-sm"/><button onClick={() => quitarFoto(idx)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"><X size={10}/></button></div>))}{fotos.length < 5 && <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer text-gray-400"><Camera size={20} /><input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" /></label>}</div>
              <button onClick={guardarActividad} disabled={saving || !nuevaActividad} className={`mt-6 w-full ${editandoId ? 'bg-blue-600' : 'bg-orange-600'} text-white p-4 rounded-2xl font-black uppercase text-[10px] shadow-xl`}>{saving ? 'PROCESANDO...' : 'REGISTRAR ACTIVIDAD'}</button>
            </div>
          </div>
        </div>

        {/* MURO INTERDISCIPLINARIO */}
        <div className="mb-12 bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl print:hidden">
          <div className="flex items-center gap-4 mb-8 border-b border-slate-700 pb-6">
            <div className="bg-blue-500 p-3 rounded-2xl"><MessageSquare size={24} /></div>
            <div><h2 className="text-2xl font-black uppercase tracking-tighter italic">Muro Interdisciplinario</h2><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Coordinación Profesional</p></div>
          </div>
          <div className="flex gap-4 mb-10"><input type="text" className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 font-bold text-sm" placeholder="Nota de coordinación..." value={nuevoMensajeMuro} onChange={(e) => setNuevoMensajeMuro(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && enviarMensajeMuro()} /><button onClick={enviarMensajeMuro} className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-2xl font-black uppercase text-[10px]">Enviar</button></div>
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
            {mensajesMuro.map((m) => (<div key={m.id} className="bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700/50"><div className="flex justify-between items-start mb-2"><span className="text-[10px] font-black text-blue-400 uppercase">{m.perfiles?.nombre_completo} • {m.perfiles?.profesion}</span><span className="text-[9px] text-slate-500 font-bold">{new Date(m.fecha).toLocaleString()}</span></div><p className="text-sm text-slate-200 font-medium italic">"{m.mensaje}"</p></div>))}
          </div>
        </div>

        {/* LEGAJO PEDAGÓGICO */}
        <div className="bg-white/90 p-10 md:p-16 rounded-[2.5rem] border border-gray-100 shadow-sm print:shadow-none">
          <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tighter border-b-2 border-blue-600 pb-6 mb-10">Legajo Pedagógico</h2>
          <div className="space-y-12">
            {actividadesFiltradas.length > 0 ? actividadesFiltradas.map((e) => (
              <div key={e.id} className="pb-8 border-b border-gray-100 last:border-0 print:break-inside-avoid">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3"><div className="bg-blue-900 text-white px-3 py-1 rounded-lg font-black text-[9px] uppercase flex items-center gap-1"><Clock size={12}/> {new Date(e.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div><span className="text-[9px] font-black text-blue-500 uppercase bg-blue-50 px-2 py-0.5 rounded-full">{e.area}</span></div>
                  <div className="flex items-center gap-4"><p className="text-[9px] font-black text-gray-300 uppercase italic">Por: {e.perfiles?.nombre_completo}</p><div className="flex gap-2 print:hidden">{(perfil?.rol === 'director' || (perfil?.rol === 'docente' && puedeEditarDocente(e.fecha))) && <button onClick={() => { setEditandoId(e.id); setNuevaActividad(e.contenido); setFotos(e.fotos || []); setPreviews(e.fotos || []); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-blue-400 transition"><Edit3 size={14}/></button>}{perfil?.rol === 'director' && <button onClick={() => eliminarEvolucion(e.id, e.fotos)} className="text-red-300 transition"><Trash2 size={14}/></button>}</div></div>
                </div>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1"><p className="text-sm text-gray-700 leading-relaxed font-medium italic bg-gray-50/50 p-6 rounded-3xl border border-gray-50 print:bg-white print:p-0 print:border-none">"{e.contenido}"</p></div>
                  {e.fotos?.length > 0 && <div className="flex md:flex-col gap-2 shrink-0">{e.fotos.map((url, i) => (<img key={i} src={url} onClick={() => window.open(url, '_blank')} className="w-20 h-20 object-cover rounded-2xl border-2 border-white shadow-md cursor-pointer" />))}</div>}
                </div>
              </div>
            )) : <div className="py-20 text-center opacity-20"><ImageIcon size={48} className="mx-auto mb-4 text-gray-400"/><p className="font-black uppercase text-xs tracking-widest">Sin registros este mes</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FichaAlumno;