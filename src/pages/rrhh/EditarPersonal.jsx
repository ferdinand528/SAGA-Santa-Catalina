import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, UserCheck, Loader2, AlertCircle } from 'lucide-react';

// Definimos las funciones ordenadas correctamente (a.localeCompare(b))
const FUNCIONES = [
  "Director/a", "Coordinador/a", "Docente", "Psicopedagogo/a", 
  "Fonoaudiólogo/a", "Kinesiólogo/a", "Psicólogo/a", 
  "Terapista Ocupacional", "Auxiliar Docente", 
  "Administrativo/a", "Personal de Maestranza"
].sort((a, b) => a.localeCompare(b));

const EditarPersonal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ nombre_completo: '', profesion: '', rol: '' });

  useEffect(() => {
    async function fetchPerfil() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        if (data) setForm(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPerfil();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { error: updateError } = await supabase
        .from('perfiles')
        .update(form)
        .eq('id', id);

      if (updateError) throw updateError;
      
      alert("Perfil institucional actualizado con éxito");
      navigate('/personal');
    } catch (err) {
      alert("Error al actualizar: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // PANTALLA DE CARGA CON COLOR INSTITUCIONAL
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center text-[#84bd00] font-black uppercase tracking-[0.2em] animate-pulse">
      <Loader2 className="animate-spin mb-4" size={40} />
      Sincronizando Datos...
    </div>
  );

  // PANTALLA DE ERROR (Por si el ID no existe o falla la conexión)
  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center text-red-500 font-black p-10 text-center">
      <AlertCircle size={48} className="mb-4" />
      <p className="uppercase tracking-widest">Error técnico: {error}</p>
      <button onClick={() => navigate('/personal')} className="mt-6 text-gray-400 text-xs underline">VOLVER AL STAFF</button>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/personal')} 
          className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-[#84bd00] transition"
        >
          <ArrowLeft size={16} /> Cancelar Edición
        </button>

        <form onSubmit={handleUpdate} className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/50 overflow-hidden">
          {/* HEADER CON COLOR INSTITUCIONAL VERDE */}
          <div className="bg-[#84bd00] p-8 text-white flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><UserCheck size={32} /></div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Modificar Profesional</h2>
              <p className="text-green-50 text-[10px] font-black uppercase tracking-widest mt-1">S.A.G.A ver 1.0 • Gestión Administrativa</p>
            </div>
          </div>

          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Nombre Completo</label>
              <input 
                required 
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-[#84bd00]/10 transition-all" 
                value={form.nombre_completo} 
                onChange={e => setForm({...form, nombre_completo: e.target.value})} 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Función en el Instituto</label>
              <select 
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm text-gray-700 border-none appearance-none"
                value={form.profesion}
                onChange={e => setForm({...form, profesion: e.target.value})}
              >
                {FUNCIONES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Permisos</label>
              <select 
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm text-gray-700 border-none"
                value={form.rol}
                onChange={e => setForm({...form, rol: e.target.value})}
              >
                <option value="docente">DOCENTE / TERAPEUTA</option>
                <option value="director">DIRECTOR / ADMIN</option>
              </select>
            </div>
            
            <button 
              disabled={updating} 
              className="md:col-span-2 bg-[#84bd00] text-white p-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-[#6a9600] transition-all flex items-center justify-center gap-3 mt-4"
            >
              <Save size={20}/> {updating ? "GUARDANDO..." : "ACTUALIZAR PERFIL"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPersonal;