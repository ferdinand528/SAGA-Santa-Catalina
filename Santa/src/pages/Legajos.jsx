import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  Search, UserPlus, Edit, Trash2, Eye, 
  User, CreditCard, Landmark, Loader2, ArrowLeft 
} from 'lucide-react';

const Legajos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlumnos();
  }, []);

  async function fetchAlumnos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alumnos')
        .select('*')
        .order('apellido', { ascending: true });

      if (error) throw error;
      setAlumnos(data || []);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  const eliminarAlumno = async (id, nombre) => {
    if (window.confirm(`¿Seguro que desea dar de baja a ${nombre}?`)) {
      await supabase.from('alumnos').delete().eq('id', id);
      fetchAlumnos();
    }
  };

  const filtrados = alumnos.filter(a => 
    `${a.apellido} ${a.nombre} ${a.dni}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-[#84bd00] font-black uppercase tracking-widest">
      <Loader2 className="animate-spin mr-2" /> Cargando Nómina...
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        {/* BOTÓN VOLVER Y HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            {/* BOTÓN DE RETORNO AL DASHBOARD */}
            <button 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-4 hover:text-[#84bd00] transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              Volver al Panel Principal
            </button>
            
            <h1 className="text-4xl font-black text-gray-800 tracking-tighter">Nómina de Alumnos</h1>
            <p className="text-[10px] font-black text-[#84bd00] uppercase tracking-[0.3em] mt-1">
              S.A.G.A ver 1.1 • Gestión de Legajos
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/alta-alumno')} 
            className="bg-[#84bd00] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-100 flex items-center gap-2 hover:bg-[#6a9600] transition-all"
          >
            <UserPlus size={18}/> Nuevo Ingreso
          </button>
        </header>

        {/* CONTENEDOR DE LISTADO */}
        <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-sm border border-white/50 p-8">
          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
            <input 
              type="text" 
              placeholder="Buscar por DNI o Apellido..." 
              className="w-full pl-14 pr-6 py-5 bg-gray-50/50 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-[#84bd00]/10 transition-all"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {filtrados.map(a => (
              <div key={a.id} className="flex flex-col md:flex-row justify-between items-center p-6 bg-white/40 border border-gray-100 rounded-[2rem] hover:border-[#84bd00]/30 transition-all">
                <div className="flex items-center gap-5 mb-4 md:mb-0">
                  <div className="bg-green-50 p-4 rounded-2xl text-[#84bd00]">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">{a.apellido}, {a.nombre}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      DNI: {a.dni} • {a.obra_social || 'PARTICULAR'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(`/legajo/${a.id}`)} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-[#84bd00] hover:text-white transition-all"><Eye size={20}/></button>
                  <button onClick={() => navigate(`/editar-alumno/${a.id}`)} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-800 hover:text-white transition-all"><Edit size={20}/></button>
                  <button onClick={() => eliminarAlumno(a.id, `${a.nombre} ${a.apellido}`)} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legajos;