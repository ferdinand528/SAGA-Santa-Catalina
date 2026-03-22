import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Edit, Trash2, 
  User, Loader2, Plus, ArrowRight 
} from 'lucide-react';

const Legajos = () => {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    async function cargarDatos() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: p } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
        setPerfil(p);

        const { data: alu } = await supabase.from('alumnos').select('*').order('apellido');
        setAlumnos(alu || []);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  // Lógica de permisos mejorada (insensible a mayúsculas)
  const rolUsuario = perfil?.rol?.toLowerCase();
  const esGestion = rolUsuario === 'director' || rolUsuario === 'administrador' || rolUsuario === 'admin';

  const borrarAlumno = async (id, nombre) => {
    // 🛡️ PROTECCIÓN EXTRA: Verificación de rol antes de ejecutar la acción
    if (!esGestion) {
      alert("Acceso denegado: Su rol de Docente no permite eliminar legajos.");
      return;
    }

    const confirmar = window.confirm(`¿Está seguro de eliminar el legajo de ${nombre}? Esta acción es irreversible.`);
    if (!confirmar) return;

    try {
      const { error } = await supabase.from('alumnos').delete().eq('id', id);
      if (error) throw error;
      setAlumnos(alumnos.filter(a => a.id !== id));
      alert("Legajo eliminado correctamente.");
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  const filtrados = alumnos.filter(a => 
    `${a.apellido} ${a.nombre}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-[#84bd00] animate-pulse bg-transparent">
      SINCRONIZANDO NÓMINA v3.1...
    </div>
  );

  return (
    /* 🖼️ bg-transparent para mostrar el logo de App.jsx */
    <div className="min-h-screen p-6 md:p-12 bg-transparent animate-fade-in font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-4 hover:text-[#1a3a5f] transition bg-white/80 px-4 py-2 rounded-full shadow-sm">
              <ArrowLeft size={16} /> Volver
            </button>
            <h1 className="text-5xl font-black text-[#1a3a5f] tracking-tighter uppercase leading-none">
              Legajos <span className="text-[#84bd00]">Alumnos</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 italic border-l-4 border-[#84bd00] pl-3">
              {esGestion ? 'Gestión Directiva • Santa Catalina v3.1' : 'Registro Pedagógico • Área Docente'}
            </p>
          </div>

          {/* 🛡️ SOLO GESTIÓN: Botón Nuevo Legajo */}
          {esGestion && (
            <button 
              onClick={() => navigate('/alta-alumno')}
              className="bg-[#1a3a5f] text-white px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#84bd00] transition-all flex items-center gap-3"
            >
              <Plus size={20}/> Nuevo Legajo
            </button>
          )}
        </header>

        {/* BUSCADOR CON TRANSPARENCIA */}
        <div className="relative mb-12">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
          <input 
            type="text" 
            placeholder="BUSCAR POR NOMBRE O APELLIDO..." 
            className="w-full pl-20 pr-10 py-8 bg-white/90 backdrop-blur-sm rounded-[2.5rem] outline-none font-bold text-sm shadow-sm border border-white focus:ring-4 focus:ring-[#84bd00]/5 transition-all uppercase"
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* GRILLA DE TARJETAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtrados.map(a => (
            <div key={a.id} className="bg-white/80 backdrop-blur-md p-8 rounded-[3rem] shadow-sm border border-white relative group hover:shadow-xl transition-all">
              
              <div className="flex items-center gap-6 mb-6">
                <div className="bg-[#84bd00]/10 p-5 rounded-3xl text-[#84bd00]">
                  <User size={32} />
                </div>
                <div>
                  <h3 className="font-black text-[#1a3a5f] uppercase text-lg leading-tight tracking-tighter">
                    {a.apellido},<br/>{a.nombre}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">DNI: {a.dni || '00.000.000'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                
                <button 
                  onClick={() => navigate(`/legajo/${a.id}`)}
                  className="flex items-center gap-2 text-[10px] font-black text-[#84bd00] uppercase hover:gap-4 transition-all"
                >
                  Ver Ficha <ArrowRight size={16}/>
                </button>

                {/* 🛡️ SOLO GESTIÓN: Botones Editar y Borrar */}
                {esGestion && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/editar-alumno/${a.id}`)}
                      className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      title="Editar Datos"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => borrarAlumno(a.id, `${a.apellido}, ${a.nombre}`)}
                      className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      title="Eliminar Legajo"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtrados.length === 0 && (
          <div className="text-center py-20 bg-white/20 backdrop-blur-sm rounded-[3rem]">
            <p className="text-gray-400 font-black uppercase text-xs tracking-[0.3em]">No se encontraron alumnos con ese nombre</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Legajos;