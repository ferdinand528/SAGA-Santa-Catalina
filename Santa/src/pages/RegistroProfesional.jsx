import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Save, Loader2, Mail, Phone, GraduationCap, Calendar } from 'lucide-react';

const FUNCIONES = [
  "Director/a", "Coordinador/a", "Docente", "Psicopedagogo/a", 
  "Fonoaudiólogo/a", "Kinesiólogo/a", "Psicólogo/a", 
  "Terapista Ocupacional", "Auxiliar Docente", 
  "Administrativo/a", "Personal de Maestranza"
].sort((a, b) => a.localeCompare(b));

const RegistroProfesional = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre_completo: '',
    profesion: 'Docente',
    rol: 'docente',
    celular: '',
    titulo: '',
    fecha_nacimiento: '',
    fecha_alta: '',
    email_institucional: ''
  });

  // GENERACIÓN AUTOMÁTICA DE CORREO
  useEffect(() => {
    if (form.nombre_completo) {
      const limpio = form.nombre_completo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Quita acentos
      const prefix = limpio.replace(/\s+/g, '');
      setForm(prev => ({ ...prev, email_institucional: `${prefix}@santacatalina.com` }));
    }
  }, [form.nombre_completo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Insertamos el legajo. El ID se generará solo gracias al SQL que ejecutamos
      const { error } = await supabase.from('perfiles').insert([form]);
      
      if (error) throw error;

      alert(`¡Éxito! Acceso creado: ${form.email_institucional}\nClave temporal: andrea1`);
      navigate('/personal');
    } catch (error) {
      alert("Error técnico: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/personal')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-[#84bd00] transition">
          <ArrowLeft size={16} /> Volver al Staff
        </button>

        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-xl rounded-4xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="bg-[#84bd00] p-8 text-white flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><UserPlus size={32} /></div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Nuevo Legajo Profesional</h2>
              <p className="text-green-50 text-[10px] font-black uppercase tracking-widest mt-1">S.A.G.A ver 1.1 • Instituto Santa Catalina</p>
            </div>
          </div>

          <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* NOMBRE Y EMAIL AUTOMÁTICO */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Nombre Completo</label>
              <input required placeholder="Ej: Juan Pérez" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-[#84bd00]/10" onChange={e => setForm({...form, nombre_completo: e.target.value})} />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-[#84bd00] uppercase ml-2">Email Sugerido</label>
              <input readOnly className="w-full p-4 bg-green-50/50 rounded-2xl font-bold text-xs text-green-700 border border-green-100 outline-none" value={form.email_institucional} />
            </div>

            {/* CONTACTO Y TÍTULO */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Celular</label>
              <input required placeholder="3794..." className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" onChange={e => setForm({...form, celular: e.target.value})} />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Título Habilitante</label>
              <input required placeholder="Ej: Psicopedagoga" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" onChange={e => setForm({...form, titulo: e.target.value})} />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Fecha de Nacimiento</label>
              <input type="date" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm text-gray-400" onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} />
            </div>

            {/* INSTITUCIONAL */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Fecha de Alta en ISC</label>
              <input type="date" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm text-gray-400" onChange={e => setForm({...form, fecha_alta: e.target.value})} />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Función</label>
              <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" value={form.profesion} onChange={e => setForm({...form, profesion: e.target.value})}>
                {FUNCIONES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Rol de Sistema</label>
              <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" value={form.rol} onChange={e => setForm({...form, rol: e.target.value})}>
                <option value="docente">Docente / Profesional</option>
                <option value="director">Director / Admin</option>
              </select>
            </div>
            
            <button disabled={loading} className="lg:col-span-3 bg-[#84bd00] text-white p-6 rounded-4xl font-black uppercase tracking-widest shadow-xl hover:bg-[#6a9600] transition-all flex items-center justify-center gap-3 mt-4">
              <Save size={20}/> {loading ? "PROCESANDO..." : "REGISTRAR PROFESIONAL"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroProfesional;