import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, UserCircle, Briefcase, Phone, Landmark } from 'lucide-react';

// LISTA DE ROLES AMPLIADA PARA INSTITUCIONES DE DISCAPACIDAD
const FUNCIONES_INSTITUCIONALES = [
  { id: 'director', label: 'DIRECTOR / AUTORIDAD' },
  { id: 'coordinador', label: 'COORDINADOR DE ÁREA' },
  { id: 'profesional_salud', label: 'PROFESIONAL DE SALUD' },
  { id: 'docente', label: 'DOCENTE / MAESTRO' },
  { id: 'auxiliar', label: 'AUXILIAR / ACOMPAÑANTE' },
  { id: 'administrativo', label: 'PERSONAL ADMINISTRATIVO' },
  { id: 'mantenimiento', label: 'MANTENIMIENTO / SERVICIOS' }
].sort((a, b) => a.label.localeCompare(b.label));

const EditarPersonal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);

  useEffect(() => {
    async function fetchPerfil() {
      const { data } = await supabase.from('perfiles').select('*').eq('id', id).single();
      setForm(data);
      setLoading(false);
    }
    fetchPerfil();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('perfiles').update(form).eq('id', id);
    if (!error) { 
      alert("Ficha técnica actualizada"); 
      navigate('/personal'); 
    }
    setLoading(false);
  };

  if (loading || !form) return <div className="p-20 text-center font-black animate-pulse text-blue-600">CARGANDO FICHA...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto">
        
        <button onClick={() => navigate('/personal')} className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-8 flex items-center gap-2 hover:text-blue-600 transition-colors">
          <ArrowLeft size={14} /> Volver a Personal
        </button>

        <form onSubmit={handleUpdate} className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] shadow-xl overflow-hidden border border-blue-50">
          
          <div className="bg-blue-600 p-8 text-white flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><UserCircle size={32} /></div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Editar Ficha Técnica</h2>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mt-2">Gestión de RRHH • Santa Catalina</p>
            </div>
          </div>

          <div className="p-10 space-y-10">
            {/* DATOS BÁSICOS */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-widest mb-2">
                <Briefcase size={14}/> Información Profesional
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Nombre Completo</label>
                <input type="text" required className="w-full p-4 bg-gray-50/50 rounded-2xl outline-none border border-gray-100 focus:ring-2 focus:ring-blue-200 font-bold" value={form.nombre_completo} onChange={e => setForm({...form, nombre_completo: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Especialidad / Título</label>
                <input type="text" placeholder="Ej: Kinesiólogo" className="w-full p-4 bg-gray-50/50 rounded-2xl outline-none border border-gray-100 focus:ring-2 focus:ring-blue-200 font-bold" value={form.profesion} onChange={e => setForm({...form, profesion: e.target.value})} />
              </div>
            </section>

            {/* ROL INSTITUCIONAL AMPLIADO */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-orange-600 font-black uppercase text-[10px] tracking-widest mb-2">
                <Landmark size={14}/> Función en la Institución
              </div>
              
              <div className="relative">
                <select 
                  required 
                  className="w-full p-4 bg-gray-50/50 rounded-2xl font-black text-blue-900 border border-gray-100 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-orange-200" 
                  value={form.rol} 
                  onChange={e => setForm({...form, rol: e.target.value})}
                >
                  <option value="">Seleccione una función...</option>
                  {FUNCIONES_INSTITUCIONALES.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>
            </section>

            {/* CONTACTO */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 font-black uppercase text-[10px] tracking-widest mb-2">
                <Phone size={14}/> Contacto Directo
              </div>
              <input type="tel" className="w-full md:w-1/2 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 outline-none font-bold" value={form.celular || ''} onChange={e => setForm({...form, celular: e.target.value})} />
            </section>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
              <Save size={20}/> GUARDAR CAMBIOS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPersonal;