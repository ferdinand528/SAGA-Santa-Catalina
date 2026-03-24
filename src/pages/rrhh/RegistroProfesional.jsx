import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Save, ArrowLeft, 
  UserPlus, Loader2, Lock 
} from 'lucide-react';

const RegistroProfesional = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true); // 👈 Estado para la validación inicial
  
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

  // 🛡️ RESTRICCIÓN DE SEGURIDAD: Solo el Director puede estar aquí
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login'); return; }

        const { data: p } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('id', user.id)
          .single();

        if (p?.rol?.toLowerCase() !== 'director') {
          // Si no es director, lo sacamos de aquí
          navigate('/personal');
        } else {
          // Si es director, permitimos ver el formulario
          setCheckingAccess(false);
        }
      } catch (error) {
        navigate('/personal');
      }
    };
    checkAccess();
  }, [navigate]);

  const cargosRaw = ["Psicopedaga","Psicologa", "Fonoaudiologa", "Coordinación", "Nutrición", "Administración", "Docente/Auxiliar", "Kinesiología"];
  const listaCargos = [...cargosRaw].sort((a, b) => a.localeCompare('es'));

  const generarEmail = useCallback((nombre) => {
    if (!nombre) return '';
    const limpio = nombre
      .toLowerCase()
      .trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "");
    return `${limpio}@santacatalina.com`;
  }, []);

  useEffect(() => {
    const nuevoEmail = generarEmail(formData.nombre_completo);
    if (nuevoEmail !== formData.email) {
      setFormData(prev => ({ ...prev, email: nuevoEmail }));
    }
  }, [formData.nombre_completo, formData.email, generarEmail]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let userId;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          const { data: existingUser } = await supabase.from('perfiles').select('id').eq('email', formData.email).single();
          if (existingUser) throw new Error("Este profesional ya tiene un perfil activo en el Staff.");
          throw authError;
        } else {
          throw authError;
        }
      }
      userId = authData.user.id;

      const { error: profileError } = await supabase.from('perfiles').insert([{
        id: userId,
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

      alert(`Éxito: Usuario ${formData.email} creado correctamente con rol ${formData.rol}.`);
      navigate('/personal');
    } catch (error) {
      alert("Error en el alta: " + (error.hint || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Mientras verifica el rol, no mostramos nada para evitar el "flash" del formulario
  if (checkingAccess) return null;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent font-sans text-gray-800 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <button onClick={() => navigate('/personal')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-[#84bd00] transition bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <ArrowLeft size={18} /> Volver al Staff
          </button>
        </header>

        <div className="bg-white/90 backdrop-blur-md rounded-[3rem] shadow-sm border border-white overflow-hidden">
          <div className="bg-[#84bd00] p-10 text-white flex items-center gap-6">
            <div className="bg-white/20 p-4 rounded-3xl"><UserPlus size={40}/></div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Alta de Personal</h1>
              <p className="text-green-100 text-[10px] font-black uppercase tracking-widest mt-2 italic">S.A.G.A v3.1 • Santa Catalina</p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="p-10 space-y-8">
            <div className="space-y-4">
              <input required className="w-full p-5 bg-gray-50/50 rounded-3xl font-bold border-none shadow-inner" value={formData.nombre_completo} placeholder="Nombre y Apellido" onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})} />
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 p-5 bg-blue-50/50 text-blue-700 rounded-3xl font-black text-xs uppercase italic flex items-center gap-3 border border-blue-100">
                  <Mail size={16}/> {formData.email || 'esperando nombre...'}
                </div>
                <div className="p-5 bg-orange-50/50 text-orange-700 rounded-3xl font-black text-xs uppercase italic flex items-center gap-3 border border-orange-100">
                  <Lock size={16}/> Clave: {formData.password}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required className="w-full p-4 bg-gray-50/50 rounded-2xl font-bold border-none shadow-inner" value={formData.dni} placeholder="DNI (Sin puntos)" onChange={(e) => setFormData({...formData, dni: e.target.value})} />
              <input required className="w-full p-4 bg-gray-50/50 rounded-2xl font-bold border-none shadow-inner" value={formData.cuit} placeholder="CUIT (Sin guiones)" onChange={(e) => setFormData({...formData, cuit: e.target.value})} />
              
              <select required className="w-full p-4 bg-gray-50/50 rounded-2xl font-bold border-none shadow-inner" value={formData.profesion} onChange={(e) => setFormData({...formData, profesion: e.target.value})}>
                <option value="">Seleccionar Cargo Institucional...</option>
                {listaCargos.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select required className="w-full p-4 bg-gray-50/50 rounded-2xl font-bold border-none shadow-inner" value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})}>
                <option value="docente">Docente / Profesional</option>
                <option value="director">Directivo</option>
                <option value="administrador">Administración</option>
                <option value="coordinacion">Coordinación</option>
              </select>

              <input required className="w-full p-4 bg-gray-50/50 rounded-2xl font-bold border-none shadow-inner" value={formData.celular} placeholder="Celular (Ej: 3794...)" onChange={(e) => setFormData({...formData, celular: e.target.value})} />
              <input required className="w-full p-4 bg-gray-50/50 rounded-2xl font-bold border-none shadow-inner" value={formData.domicilio} placeholder="Domicilio (Calle y Nro)" onChange={(e) => setFormData({...formData, domicilio: e.target.value})} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#84bd00] text-white p-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
              {loading ? 'Procesando...' : 'Confirmar Alta y Crear Usuario'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroProfesional;