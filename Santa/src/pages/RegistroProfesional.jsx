import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Lock, Briefcase, Shield, 
  MapPin, Save, ArrowLeft, UserPlus, Phone, IdCard 
} from 'lucide-react';

const RegistroProfesional = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    password: 'andrea1',
    profesion: '',
    rol: 'docente',
    dni: '',
    cuit: '',
    domicilio: '',
    celular: ''
  });

  const cargosRaw = [
    "Psicopedagogía", "Fonoaudiología", "Kinesiología", "Estimulación del Lenguaje",
    "Estimulación Visual", "Maestra Integradora", "Docente Orientadora de Sala", 
    "Auxiliar de Sala", "Médico Clínico", "Terapia Ocupacional", "Docente de Apoyo", 
    "Psicología", "Psicomotricidad", "Trabajo Social", "Nutrición", "Administración"
  ];

  const listaCargos = [...cargosRaw].sort((a, b) => a.localeCompare('es'));

  // LÓGICA DE EMAIL CONCATENADO v2.0
  const generarEmail = (nombre) => {
    if (!nombre) return '';
    const limpio = nombre
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quita acentos
      .replace(/\s+/g, ""); // <--- ELIMINA ESPACIOS (Andrea Escalante -> andreaescalante)
    return `${limpio}@santacatalina.com`;
  };

  useEffect(() => {
    const nuevoEmail = generarEmail(formData.nombre_completo);
    setFormData(prev => ({ ...prev, email: nuevoEmail }));
  }, [formData.nombre_completo]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (authError) throw authError;

      const { error: profileError } = await supabase.from('perfiles').insert([{
        id: authData.user.id,
        nombre_completo: formData.nombre_completo,
        email: formData.email,
        profesion: formData.profesion,
        rol: formData.rol,
        dni: formData.dni,
        cuit: formData.cuit,
        domicilio: formData.domicilio,
        celular: formData.celular
      }]);

      if (profileError) throw profileError;
      alert(`¡Éxito!\nUsuario: ${formData.email}\nClave: ${formData.password}`);
      navigate('/personal');
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent font-sans text-gray-800 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <button onClick={() => navigate('/personal')} className="flex items-center gap-2 text-gray-500 font-black uppercase text-[10px] hover:text-[#84bd00] transition bg-white/50 px-4 py-2 rounded-full shadow-sm">
            <ArrowLeft size={18} /> Cancelar y Volver
          </button>
        </header>

        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-[#84bd00] p-10 text-white flex items-center gap-6">
            <div className="bg-white/20 p-4 rounded-3xl"><UserPlus size={40}/></div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Alta Profesional</h1>
              <p className="text-green-100 text-[10px] font-bold uppercase tracking-widest mt-2">Santa Catalina v2.0 • Email Concatenado</p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2"><User size={14}/> Datos de Identidad</h3>
              </div>
              <div className="md:col-span-2">
                <label className="text-[9px] font-black uppercase text-gray-500 ml-3 mb-1 block">Nombre Completo</label>
                <input required className="w-full p-5 bg-gray-50 rounded-3xl border-none font-bold text-gray-700 shadow-inner" value={formData.nombre_completo} onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})} placeholder="Ej: Andrea Escalante" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 ml-3 mb-1 block">DNI</label>
                <div className="relative">
                  <input required className="w-full p-5 pl-12 bg-gray-50 rounded-3xl border-none font-bold text-gray-700 shadow-inner" value={formData.dni} onChange={(e) => setFormData({...formData, dni: e.target.value})} />
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 ml-3 mb-1 block">CUIL / CUIT</label>
                <input required className="w-full p-5 bg-gray-50 rounded-3xl border-none font-bold text-gray-700 shadow-inner" value={formData.cuit} onChange={(e) => setFormData({...formData, cuit: e.target.value})} />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 ml-3 mb-1 block">Celular</label>
                <div className="relative">
                  <input required className="w-full p-5 pl-12 bg-gray-50 rounded-3xl border-none font-bold text-gray-700 shadow-inner" value={formData.celular} onChange={(e) => setFormData({...formData, celular: e.target.value})} />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 ml-3 mb-1 block">Cargo / Función (Alfabético)</label>
                <select required className="w-full p-5 bg-gray-50 rounded-3xl border-none font-bold text-gray-700 shadow-inner appearance-none cursor-pointer" value={formData.profesion} onChange={(e) => setFormData({...formData, profesion: e.target.value})}>
                  <option value="">Seleccionar cargo...</option>
                  {listaCargos.map(cargo => <option key={cargo} value={cargo}>{cargo}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[9px] font-black uppercase text-gray-500 ml-3 mb-1 block">Domicilio Particular</label>
                <div className="relative">
                  <input required className="w-full p-5 pl-12 bg-gray-50 rounded-3xl border-none font-bold text-gray-700 shadow-inner" value={formData.domicilio} onChange={(e) => setFormData({...formData, domicilio: e.target.value})} />
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
              <div className="md:col-span-2">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2"><Shield size={14}/> Acceso y Roles</h3>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 ml-3 mb-1 block">Email Institucional (Auto)</label>
                <div className="w-full p-5 bg-blue-50 text-blue-700 rounded-3xl border border-blue-100 font-bold text-sm shadow-inner truncate flex items-center gap-2 italic">
                  <Mail size={16}/> {formData.email || 'esperando nombre...'}
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 ml-3 mb-1 block">Rol de Usuario</label>
                <select required className="w-full p-5 bg-gray-50 rounded-3xl border-none font-black uppercase text-xs shadow-inner cursor-pointer" value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})}>
                  <option value="director">Director</option>
                  <option value="docente">Docente / Profesional</option>
                  <option value="administrador">Administrativo</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[9px] font-black uppercase text-orange-600 ml-3 mb-1 block">Contraseña (Default: andrea1)</label>
                <input required className="w-full p-5 bg-orange-50 text-orange-700 rounded-3xl border border-orange-100 font-bold text-sm shadow-inner" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            <div className="pt-6">
              <button type="submit" disabled={loading} className="w-full bg-[#84bd00] text-white p-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-[#73a500] transition-all flex items-center justify-center gap-3">
                {loading ? 'SINCRONIZANDO...' : 'Finalizar Alta Profesional'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroProfesional;