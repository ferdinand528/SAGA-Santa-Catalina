import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Save, Loader2, 
  MessageSquare, User, Brain, Heart, Activity 
} from 'lucide-react';

const AREAS = ["PSICOPEDAGOGÍA", "PSICOLOGÍA", "KINESIOLOGÍA", "CENTRO DE DÍA", "TALLERES", "GENERAL"];

const ActividadDiaria = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [perfil, setPerfil] = useState(null);

  // Estado del Registro
  const [seleccionado, setSeleccionado] = useState(null);
  const [contenido, setContenido] = useState("");
  const [area, setArea] = useState("GENERAL");

  useEffect(() => {
    async function inicializar() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        // Obtenemos el perfil del profesional logueado
        const { data: prof } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
        setPerfil(prof);

        const { data: alu } = await supabase.from('alumnos').select('id, nombre, apellido').eq('activo', true);
        setAlumnos(alu);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    inicializar();
  }, []);

  const handleGuardar = async () => {
    if (!seleccionado || !contenido) return alert("Seleccioná un alumno y escribí el contenido.");
    
    setGuardando(true);
    try {
      const { error } = await supabase.from('evoluciones').insert([{
        alumno_id: seleccionado.id,
        profesional_id: perfil.id,
        profesional_nombre: perfil.nombre_completo,
        contenido: contenido,
        area: area,
        fecha: new Date().toISOString()
      }]);

      if (error) throw error;

      alert("Evolución registrada correctamente en SAGA v3.1");
      setContenido("");
      setSeleccionado(null);
    } catch (err) {
      alert("Error al guardar: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  const filtrados = alumnos.filter(a => `${a.apellido} ${a.nombre}`.toLowerCase().includes(busqueda.toLowerCase()));

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#84bd00] animate-pulse">CARGANDO SISTEMA OPERATIVO...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#fcfaf7] animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-4 hover:text-orange-500 transition">
            <ArrowLeft size={16} /> Volver al Panel
          </button>
          <h1 className="text-4xl font-black text-[#1a3a5f] uppercase tracking-tighter">Evolución Diaria</h1>
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-2 italic">Registro de Actividad y Seguimiento Clínico</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQ: BUSCADOR DE ALUMNOS */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 h-fit">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                placeholder="BUSCAR ALUMNO..." 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-xs"
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filtrados.map(a => (
                <div 
                  key={a.id} 
                  onClick={() => setSeleccionado(a)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${seleccionado?.id === a.id ? 'border-orange-500 bg-orange-50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
                >
                  <p className="font-black text-[#1a3a5f] uppercase text-[11px]">{a.apellido}, {a.nombre}</p>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMNA DER: FORMULARIO DE REGISTRO */}
          <div className="lg:col-span-2 space-y-6">
            {seleccionado ? (
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border-t-8 border-orange-500 animate-slide-up">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-[#1a3a5f] uppercase tracking-tighter leading-none">Nueva Entrada</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 italic">Alumno: {seleccionado.apellido}, {seleccionado.nombre}</p>
                  </div>
                  <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl"><MessageSquare size={24}/></div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-4 tracking-widest">Área de Intervención</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {AREAS.map(a => (
                        <button 
                          key={a}
                          onClick={() => setArea(a)}
                          className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase transition-all ${area === a ? 'bg-[#1a3a5f] text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-4 tracking-widest">Observaciones y Actividad</label>
                    <textarea 
                      className="w-full mt-2 p-6 bg-gray-50 rounded-[2rem] border-none outline-none font-bold text-gray-600 focus:ring-4 focus:ring-orange-500/10 h-48 resize-none shadow-inner"
                      placeholder="Escribí aquí cómo fue el desempeño del alumno hoy..."
                      value={contenido}
                      onChange={(e) => setContenido(e.target.value)}
                    />
                  </div>

                  <button 
                    disabled={guardando}
                    onClick={handleGuardar}
                    className="w-full bg-orange-500 text-white p-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-[#1a3a5f] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {guardando ? <Loader2 className="animate-spin" /> : <Save size={20}/>}
                    Guardar Evolución
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                <User className="text-gray-100 mb-4" size={80} />
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Seleccioná un alumno de la lista<br/>para registrar su actividad</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ActividadDiaria;