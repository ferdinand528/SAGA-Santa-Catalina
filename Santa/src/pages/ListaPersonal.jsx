import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Search, Edit3, Phone, X } from 'lucide-react';

const ListaPersonal = () => {
  const navigate = useNavigate();
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => { fetchPersonal(); }, []);

  async function fetchPersonal() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .order('nombre_completo', { ascending: true });
      if (error) throw error;
      setPersonal(data || []);
    } catch (err) { 
      alert(err.message); 
    } finally { 
      setLoading(false); 
    }
  }

  // LÓGICA DE FILTRADO DINÁMICO
  const personalFiltrado = personal.filter(p => {
    const termino = busqueda.toLowerCase();
    return (
      p.nombre_completo?.toLowerCase().includes(termino) ||
      p.profesion?.toLowerCase().includes(termino)
    );
  });

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse uppercase">Sincronizando Personal...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* CABECERA CON BUSCADOR */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 bg-white/90 backdrop-blur-sm p-8 rounded-[2.5rem] border border-blue-50 shadow-sm">
          <div className="w-full md:w-auto">
            <button onClick={() => navigate('/dashboard')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2 hover:text-blue-600 transition-colors">
              <ArrowLeft size={14}/> Panel Principal
            </button>
            <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter leading-none">Personal</h1>
          </div>

          {/* BARRA DE BÚSQUEDA */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o profesión..."
              className="w-full pl-12 pr-10 py-4 bg-gray-50/50 rounded-2xl outline-none border border-gray-100 focus:ring-2 focus:ring-blue-200 font-bold text-blue-900 transition-all"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button 
                onClick={() => setBusqueda("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <button 
            onClick={() => navigate('/registro-personal')} 
            className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-lg hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus size={18} /> Nuevo Alta
          </button>
        </header>

        {/* GRILLA DE PERSONAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personalFiltrado.length > 0 ? (
            personalFiltrado.map(p => (
              <div key={p.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-sm border border-gray-100 relative group overflow-hidden hover:shadow-xl transition-all">
                {/* Indicador de Rol */}
                <div className={`absolute top-0 right-0 w-2 h-full ${p.rol === 'director' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                
                <h3 className="font-black text-lg uppercase text-blue-900 leading-tight mb-1">{p.nombre_completo}</h3>
                <p className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase mb-4">
                  {p.profesion || "Profesional"}
                </p>
                
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-6 font-bold">
                  <Phone size={14} className="text-blue-400" /> {p.celular || "Sin contacto"}
                </div>
                
                <button 
                  onClick={() => navigate(`/editar-personal/${p.id}`)} 
                  className="w-full bg-gray-50/50 text-blue-900 py-3 rounded-2xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-gray-100"
                >
                  <Edit3 size={14} /> Editar Perfil
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="font-black text-gray-300 uppercase tracking-widest text-xl italic">No hay resultados para esta búsqueda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListaPersonal;