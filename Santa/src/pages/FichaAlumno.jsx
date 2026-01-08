import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, Heart, Pill, Printer, ClipboardList, 
  FileText, Camera, X, Image as ImageIcon, Clock 
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
  
  // Estados para Fotos v2.0
  const [fotos, setFotos] = useState([]); 
  const [previews, setPreviews] = useState([]); 
  const [uploading, setUploading] = useState(false);

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

  // Lógica de Fotos v2.0
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
    const nuevasFotos = fotos.filter((_, i) => i !== index);
    const nuevasPreviews = previews.filter((_, i) => i !== index);
    setFotos(nuevasFotos);
    setPreviews(nuevasPreviews);
  };

  const guardarActividad = async () => {
    if (!nuevaActividad.trim()) return;
    setSaving(true);
    try {
      let urlsSubidas = [];

      // Subir fotos al Storage
      for (const file of fotos) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${id}/${Date.now()}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('actividades').upload(fileName, file);
        
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('actividades').getPublicUrl(fileName);
          urlsSubidas.push(publicUrl);
        }
      }

      // Guardar evolución con auditoría completa
      const { error } = await supabase.from('evoluciones').insert([{
        alumno_id: id,
        profesional_id: perfil.id,
        contenido: nuevaActividad,
        area: perfil.profesion || 'Docencia',
        fotos: urlsSubidas,
        fecha: new Date().toISOString() // Fecha y Hora exactas
      }]);

      if (!error) {
        setNuevaActividad("");
        setFotos([]);
        setPreviews([]);
        const { data } = await supabase.from('evoluciones').select('*, perfiles(nombre_completo)').eq('alumno_id', id).order('fecha', { ascending: false });
        setEvoluciones(data || []);
      }
    } finally { setSaving(false); }
  };

  const actividadesFiltradas = evoluciones.filter(e => {
    const fecha = new Date(e.fecha);
    return (fecha.getMonth() + 1) === parseInt(mesReporte) && fecha.getFullYear() === parseInt(anioReporte);
  });

  if (loading || !alumno) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse text-2xl uppercase tracking-tighter">Santa Catalina...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex justify-between items-start mb-10 print:hidden">
          <button onClick={() => navigate('/legajos')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-blue-600 transition">
            <ArrowLeft size={18} /> Volver
          </button>
          <div className="text-right">
            <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter leading-none">{alumno.apellido}, {alumno.nombre}</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 tracking-[0.4em]">I.A.D. SANTA CATALINA</p>
          </div>
        </header>

        {/* PANEL DE CONTROL DEL DIRECTOR */}
        {perfil?.rol === 'director' && (
          <div className="mb-8 bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl print:hidden flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-2xl"><FileText size={32}/></div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight leading-none">Reporte Mensual</h3>
                <p className="text-blue-100 text-[10px] font-bold uppercase mt-1 tracking-widest">Auditoría de Actividades v2.0</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-blue-700/50 p-2 rounded-2xl">
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

        {/* CONTENEDOR DE ACTIVIDAD Y FICHA MÉDICA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden mb-8">
          
          {/* FICHA MÉDICA CON GENERADOR OFICIAL */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-sm border border-blue-50 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black text-blue-600 uppercase mb-4 flex items-center gap-2 tracking-widest"><Heart size={14}/> Emergencias</h3>
              <p className="text-sm font-black text-red-600 uppercase leading-tight italic">"{alumno.datos_medicos?.diagnostico || "Sin diagnóstico"}"</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1"><Pill size={12}/> Medicación</p>
                <p className="text-xs font-bold text-red-800 italic">{alumno.datos_medicos?.medicamentos || "No registra"}</p>
              </div>
            </div>
            <button 
              onClick={() => window.open(`/alumno/${id}/ficha-medica`, '_blank')}
              className="mt-6 w-full bg-red-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-lg shadow-red-100 active:scale-95"
            >
              <Printer size={14}/> Generar Ficha Médica
            </button>
          </div>

          {/* REGISTRO MULTIMEDIA v2.0 */}
          <div className="lg:col-span-2">
            <div className="bg-orange-50/90 backdrop-blur-sm p-8 rounded-[2.5rem] border border-orange-100 shadow-sm">
              <h3 className="text-xs font-black text-orange-600 uppercase mb-4 flex items-center gap-2"><ClipboardList size={18}/> Actividad Diaria con Fotos</h3>
              <textarea 
                className="w-full p-6 bg-white/80 rounded-3xl border border-orange-100 outline-none font-bold text-sm min-h-[100px] shadow-inner" 
                placeholder="Describir actividad, logros o novedades..." 
                value={nuevaActividad} 
                onChange={(e) => setNuevaActividad(e.target.value)} 
              />
              
              {/* Selector de Fotos */}
              <div className="mt-4 flex flex-wrap gap-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 group">
                    <img src={src} className="w-full h-full object-cover rounded-2xl border-2 border-orange-200 shadow-sm" alt="Preview" />
                    <button onClick={() => quitarFoto(idx)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:scale-110 transition">
                      <X size={12}/>
                    </button>
                  </div>
                ))}
                {fotos.length < 5 && (
                  <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-orange-300 rounded-2xl cursor-pointer hover:bg-orange-100 transition-all text-orange-400 hover:text-orange-600">
                    <Camera size={24} />
                    <span className="text-[8px] font-black uppercase mt-1">Subir Foto</span>
                    <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>

              <button 
                onClick={guardarActividad} 
                disabled={saving || !nuevaActividad} 
                className="mt-6 w-full bg-orange-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-orange-700 transition shadow-xl shadow-orange-200 disabled:opacity-50"
              >
                {saving ? 'SINCRONIZANDO...' : 'REGISTRAR ACTIVIDAD'}
              </button>
            </div>
          </div>
        </div>

        {/* LISTADO HISTÓRICO CON TRAZABILIDAD Y FOTOS */}
        <div className="bg-white/90 backdrop-blur-sm p-10 md:p-16 rounded-[2.5rem] border border-gray-100 shadow-sm print:p-0 print:border-none print:shadow-none">
          <div className="mb-10 pb-6 border-b-2 border-blue-600">
            <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tighter leading-none">Actividades: {nombresMeses[mesReporte - 1]} {anioReporte}</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase mt-4 tracking-widest italic leading-none">Historial Pedagógico de {alumno.apellido}, {alumno.nombre}</p>
          </div>

          <div className="space-y-12">
            {actividadesFiltradas.length > 0 ? (
              actividadesFiltradas.map((e) => (
                <div key={e.id} className="pb-8 border-b border-gray-100 last:border-0 print:break-inside-avoid">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-900 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-tighter tabular-nums flex items-center gap-2 shadow-lg shadow-blue-100">
                        <Clock size={14}/> {new Date(e.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">{e.area || "Docencia"}</span>
                    </div>
                    <p className="text-[10px] font-black text-gray-300 uppercase italic">Responsable: {e.perfiles?.nombre_completo}</p>
                  </div>
                  
                  <p className="text-sm text-gray-700 leading-relaxed font-medium italic bg-gray-50/50 p-6 rounded-3xl border border-gray-50 print:bg-white print:p-0 print:border-none">
                    "{e.contenido}"
                  </p>

                  {/* Fotos v2.0 */}
                  {e.fotos && e.fotos.length > 0 && (
                    <div className="flex flex-wrap gap-4 mt-6 overflow-x-auto pb-2">
                      {e.fotos.map((url, i) => (
                        <img key={i} src={url} className="w-32 h-32 object-cover rounded-[1.5rem] shadow-md border-2 border-white hover:scale-105 transition-transform cursor-pointer" alt="Evidencia Actividad" />
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
                <ImageIcon size={48}/>
                <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Sin registros en este periodo</p>
              </div>
            )}
          </div>

          {/* Firmas Institucionales */}
          <div className="hidden print:flex justify-between mt-32 px-10">
             <div className="text-center">
                <div className="w-52 border-b-2 border-gray-200 mb-2"></div>
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic">Dirección • Santa Catalina</p>
             </div>
             <div className="text-center">
                <div className="w-52 border-b-2 border-gray-200 mb-2"></div>
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic">Responsable de Familiar</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FichaAlumno;