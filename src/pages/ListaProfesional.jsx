import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Edit3, Mail, Phone, Loader2 } from 'lucide-react';

const ListaPersonal = () => {
  const navigate = useNavigate();
  const [personal, setPersonal] = useState([]);
  const [perfilUsuario, setPerfilUsuario] = useState(null); // 👈 Para conocer el rol del que mira
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    fetchDatos(); 
  }, []);

  async function fetchDatos() {
    try {
      setLoading(true);
      
      // 1. Obtener el perfil del usuario actual para validar permisos
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('id', user.id)
          .single();
        setPerfilUsuario(p);
      }

      // 2. Cargar la nómina completa
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .order('nombre_completo', { ascending: true });
      
      if (error) throw error;
      setPersonal(data || []);
    } catch (err) {
      alert("Error al cargar datos: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // 🛡️ Lógica de Súper Usuario
  const esDirector = perfilUsuario?.rol?.toLowerCase() === 'director';

  return (
    /* 🖼️ CAMBIO: bg-transparent para mostrar el logo institucional de fondo */
    <div className="min-h-screen bg-transparent p-6 md:p-10 font-sans text-gray-800 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-[#84bd00] transition bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-4">
              <ArrowLeft size={16} /> Volver al Panel
            </button>
            <h1 className="text-4xl font-black text-[#1a3a5f] tracking-tighter uppercase leading-none">Nómina de Personal</h1>
            <p className="text-[10px] font-black text-[#84bd00] uppercase tracking-widest mt-2 italic">Santa Catalina • Gestión de RRHH</p>
          </div>

          {/* 🛡️ RESTRICCIÓN: Solo el Director ve el botón de Alta */}
          {esDirector && (
            <button 
              onClick={() => navigate('/registro-personal')}
              className="bg-[#84bd00] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-all flex items-center gap-3"
            >
              <UserPlus size={18} /> Nuevo Profesional
            </button>
          )}
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 className="animate-spin text-[#84bd00] mb-4" size={32} />
            <p className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Sincronizando Nómina...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personal.map(p => (
              <div key={p.id} className="bg-white/80 backdrop-blur-md p-8 rounded-[3rem] shadow-sm border border-white hover:shadow-xl transition-all relative group overflow-hidden">
                {/* Indicador de Rol lateral */}
                <div className={`absolute top-0 right-0 w-2 h-full ${p.rol === 'director' ? 'bg-red-500' : 'bg-[#84bd00]'}`}></div>
                
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="font-black text-xl uppercase text-[#1a3a5f] tracking-tighter leading-tight mb-2">{p.nombre_completo}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-blue-50 text-[#1a3a5f] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {p.profesion || "Docencia"}
                      </span>
                      <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic">
                        {p.rol}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8 flex-grow">
                    <div className="flex items-center gap-3 text-gray-500 text-xs font-bold uppercase tracking-tight">
                      <div className="bg-gray-100 p-2 rounded-xl text-[#84bd00]"><Phone size={14} /></div>
                      {p.celular || "Sin contacto"}
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 text-xs font-bold uppercase tracking-tight">
                      <div className="bg-gray-100 p-2 rounded-xl text-[#84bd00]"><Mail size={14} /></div>
                      <span className="lowercase">{p.email}</span>
                    </div>
                  </div>

                  {/* 🛡️ RESTRICCIÓN: Solo el Director puede editar otras fichas */}
                  {esDirector ? (
                    <button 
                      onClick={() => navigate(`/editar-personal/${p.id}`)}
                      className="w-full bg-[#1a3a5f] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#84bd00] transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      <Edit3 size={16} /> Editar Ficha Profesional
                    </button>
                  ) : (
                    <div className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-black text-[10px] uppercase text-center border border-gray-100 italic">
                      Vista de Consulta
                    </div>
                  )}
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