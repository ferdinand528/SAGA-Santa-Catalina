import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  Search, UserPlus, Edit, Trash2, 
  UserCircle, Mail, Briefcase, Loader2, ArrowLeft 
} from 'lucide-react';

const ListaPersonal = () => {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPersonal();
  }, []);

  async function fetchPersonal() {
    try {
      setLoading(true);
      // Traemos a todo el personal ordenado por nombre
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .order('nombre_completo', { ascending: true });

      if (error) throw error;
      setPersonal(data || []);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  // FUNCIÓN DE ELIMINACIÓN TÉCNICA
  const eliminarPersonal = async (id, nombre) => {
    const confirmar = window.confirm(`¿Estás seguro de eliminar a ${nombre} del sistema? Perderá el acceso de forma inmediata.`);
    
    if (confirmar) {
      try {
        const { error } = await supabase
          .from('perfiles')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // Actualizamos la lista local para reflejar el cambio
        setPersonal(personal.filter(p => p.id !== id));
        alert("Personal eliminado con éxito.");
      } catch (error) {
        alert("Error al eliminar: " + error.message);
      }
    }
  };

  const filtrados = personal.filter(p => 
    p.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.profesion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-[#84bd00] font-black uppercase tracking-widest">
      <Loader2 className="animate-spin mr-2" /> Actualizando Staff...
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-2 hover:text-[#84bd00] transition">
              <ArrowLeft size={14} /> Volver al Panel
            </button>
            <h1 className="text-4xl font-black text-gray-800 tracking-tighter">Personal Institucional</h1>
            <p className="text-[10px] font-black text-[#84bd00] uppercase tracking-[0.3em] mt-1">
              S.A.G.A ver 1.0 • Recursos Humanos
            </p>
          </div>
          <button 
            onClick={() => navigate('/registro-personal')} 
            className="bg-[#84bd00] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-100 flex items-center gap-2 hover:bg-[#6a9600] transition-all"
          >
            <UserPlus size={18}/> Registrar Profesional
          </button>
        </header>

        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-sm border border-white/50 p-8">
          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o cargo..." 
              className="w-full pl-14 pr-6 py-5 bg-gray-50/50 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-[#84bd00]/10 transition-all"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtrados.map(p => (
              <div key={p.id} className="flex justify-between items-center p-6 bg-white/40 border border-gray-100 rounded-[2rem] hover:border-[#84bd00]/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="bg-green-50 p-4 rounded-2xl text-[#84bd00]">
                    <UserCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">{p.nombre_completo}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <Briefcase size={12}/> {p.profesion || 'Personal Institucional'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/editar-personal/${p.id}`)}
                    className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-800 hover:text-white transition-all"
                  >
                    <Edit size={18}/>
                  </button>
                  {/* BOTÓN ELIMINAR */}
                  <button 
                    onClick={() => eliminarPersonal(p.id, p.nombre_completo)}
                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaPersonal;