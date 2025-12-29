import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, UserCheck, Loader2 } from 'lucide-react';

const EditarAlumno = () => {
  const { id } = useParams(); // Captura el ID de la URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({
    apellido: '', nombre: '', dni: '', fecha_nacimiento: '',
    obra_social: '', nro_afiliado: '', cuota_monto_mensual: ''
  });

  // CARGAR DATOS ACTUALES
  useEffect(() => {
    async function fetchAlumno() {
      const { data, error } = await supabase
        .from('alumnos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) setForm(data);
      setLoading(false);
    }
    fetchAlumno();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    const { error } = await supabase
      .from('alumnos')
      .update(form)
      .eq('id', id);

    if (error) {
      alert("Error al actualizar: " + error.message);
    } else {
      alert("Legajo actualizado correctamente");
      navigate('/legajos');
    }
    setUpdating(false);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-blue-600 font-black uppercase tracking-widest">
      <Loader2 className="animate-spin mr-2" /> Recuperando Legajo...
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/legajos')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-blue-600 transition">
          <ArrowLeft size={16} /> Cancelar Edición
        </button>

        <form onSubmit={handleUpdate} className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/50 overflow-hidden">
          <div className="bg-blue-900 p-8 text-white flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><UserCheck size={32} /></div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Editar Legajo</h2>
              <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mt-1">S.A.G.A ver 1.0 • {form.apellido}, {form.nombre}</p>
            </div>
          </div>

          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Apellido</label>
              <input required className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-100" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Nombre</label>
              <input required className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-100" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2">DNI</label>
              <input required className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-100" value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Fecha de Nacimiento</label>
              <input type="date" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" value={form.fecha_nacimiento} onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Obra Social</label>
              <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" value={form.obra_social} onChange={e => setForm({...form, obra_social: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Cuota Mensual $</label>
              <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" value={form.cuota_monto_mensual} onChange={e => setForm({...form, cuota_monto_mensual: e.target.value})} />
            </div>
            
            <button disabled={updating} className="md:col-span-2 bg-blue-900 text-white p-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 mt-4">
              <Save size={20}/> {updating ? "GUARDANDO CAMBIOS..." : "ACTUALIZAR DATOS"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarAlumno;