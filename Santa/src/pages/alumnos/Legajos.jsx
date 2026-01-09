import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  Search, UserPlus, FileText, 
  ArrowRight, Users, ArrowLeft,
  Edit, Trash2, Loader2
} from 'lucide-react';

const Legajos = () => {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAlumnos = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('alumnos')
        .select('*')
        .order('apellido', { ascending: true });
      
      setAlumnos(data || []);
    } catch (error) {
      console.error("Error cargando alumnos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlumnos();
  }, [fetchAlumnos]);

  // Lógica para eliminar alumno con validación
  const eliminarAlumno = async (e, id, nombreCompleto) => {
    e.stopPropagation(); // Evita que se abra el legajo al hacer clic en borrar
    
    const confirmar = window.confirm(`¿ESTÁ SEGURO? Se eliminará permanentemente el legajo de: ${nombreCompleto}. Esta acción no se puede deshacer.`);
    
    if (confirmar) {
      try {
        const { error } = await supabase.from('alumnos').delete().eq('id', id);
        if (error) throw error;
        
        // Actualizar lista localmente
        setAlumnos(prev => prev.filter(a => a.id !== id));
        alert("Registro eliminado con éxito.");
      } catch (error) {
        alert("Error al eliminar: " + error.message);
      }
    }
  };

  const alumnosFiltrados = alumnos.filter(a => 
    a.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#fcfaf7] font-sans text-gray-800 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-8 flex justify-between items-center">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-[#84bd00] transition bg-white px-4 py-2 rounded-full shadow-sm"
          >
            <ArrowLeft size={18} /> Volver
          </button>
        </header>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-[#1a3a5f] uppercase tracking-tighter leading-none">
              Legajos <span className="text-[#84bd00]">Alumnos</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 italic">
              Gestión Directiva • Santa Catalina v2.1
            </p>
          </div>
          <button onClick={() => navigate('/alta-alumno')} className="bg-[#84bd00] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center gap-3 hover:scale-105 transition-all">
            <UserPlus size={18}/> Nuevo Alumno
          </button>
        </header>

        {/* BUSCADOR */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 mb-10 flex items-center gap-4 px-8">
          <Search className="text-gray-300" size={24}/>
          <input 
            type="text" 
            placeholder="BUSCAR POR NOMBRE O APELLIDO..." 
            className="flex-1 bg-transparent outline-none font-bold text-sm uppercase text-gray-600"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="animate-spin text-[#84bd00] mb-4" size={32} />
            <p className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Sincronizando Archivo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumnosFiltrados.map((alu) => (
              <div 
                key={alu.id} 
                onClick={() => navigate(`/legajo/${alu.id}`)} 
                className="bg-white p-8 rounded-[3rem] shadow-sm border border-white hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
              >
                {/* ACCIONES RÁPIDAS (Flotantes) */}
                <div className="absolute top-6 right-6 flex gap-2 z-20">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/editar-alumno/${alu.id}`);
                    }}
                    className="p-3 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-500 hover:text-white transition-all"
                    title="Editar datos"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={(e) => eliminarAlumno(e, alu.id, `${alu.apellido}, ${alu.nombre}`)}
                    className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                    title="Eliminar registro"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-6 relative z-10 pr-16">
                  <div className="bg-green-50 p-5 rounded-3xl text-[#84bd00] group-hover:bg-[#84bd00] group-hover:text-white transition-colors">
                    <Users size={28}/>
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#1a3a5f] uppercase tracking-tighter leading-none mb-1">
                      {alu.apellido}, {alu.nombre}
                    </h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">DNI: {alu.dni || '---'}</p>
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-center relative z-10">
                  <span className="text-[8px] font-black bg-gray-50 text-gray-400 px-3 py-1 rounded-lg uppercase tracking-widest group-hover:bg-green-100 group-hover:text-[#84bd00] transition-colors">
                    Ficha Completa
                  </span>
                  <ArrowRight size={20} className="text-[#84bd00] transform group-hover:translate-x-2 transition-transform"/>
                </div>

                {/* DECORACIÓN DE FONDO */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <FileText size={120}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {alumnosFiltrados.length === 0 && !loading && (
          <div className="text-center py-20 opacity-30 font-black uppercase text-xs tracking-widest">
            No se encontraron resultados
          </div>
        )}
      </div>
    </div>
  );
};

export default Legajos;