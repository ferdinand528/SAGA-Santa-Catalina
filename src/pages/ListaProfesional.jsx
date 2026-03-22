import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Edit3, Mail, Phone, Briefcase } from 'lucide-react';

const ListaPersonal = () => {
  const navigate = useNavigate();
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);

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
      alert("Error al cargar nómina: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-2 font-bold uppercase text-xs">
              <ArrowLeft size={16} /> Volver al Panel
            </button>
            <h1 className="text-3xl font-black text-blue-900 tracking-tighter uppercase">Nómina de Personal</h1>
          </div>
          <button 
            onClick={() => navigate('/registro-personal')}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all flex items-center gap-2"
          >
            <UserPlus size={18} /> Nuevo Profesional
          </button>
        </header>

        {loading ? (
          <div className="text-center p-20 font-bold text-blue-600 animate-pulse uppercase tracking-widest">Sincronizando Nómina...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personal.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-all relative group overflow-hidden">
                <div className={`absolute top-0 right-0 w-2 h-full ${p.rol === 'director' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="font-black text-lg uppercase text-blue-900 leading-tight mb-1">{p.nombre_completo}</h3>
                    <p className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {p.profesion || "Sin especialidad"}
                    </p>
                  </div>

                  <div className="space-y-2 mb-6 flex-grow">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                      <Phone size={14} className="text-orange-400" /> {p.celular || "No cargado"}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium truncate">
                      <Mail size={14} className="text-orange-400" /> {p.rol}
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(`/editar-personal/${p.id}`)}
                    className="w-full bg-gray-50 text-blue-900 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-gray-100"
                  >
                    <Edit3 size={16} /> Editar Ficha
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaPersonal;