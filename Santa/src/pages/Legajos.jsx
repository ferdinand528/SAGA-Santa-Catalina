import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  Search, UserPlus, Edit, Trash2, Eye, 
  User, Loader2, ArrowLeft 
} from 'lucide-react';

const Legajos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [perfil, setPerfil] = useState(null); // Para validar el rol
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        // 1. Obtenemos el rol del usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
        setPerfil(profile);

        // 2. Traemos la lista de alumnos
        const { data: list } = await supabase.from('alumnos').select('*').order('apellido');
        setAlumnos(list || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    getData();
  }, []);

  const filtrados = alumnos.filter(a => 
    `${a.apellido} ${a.nombre} ${a.dni}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return <div className="h-screen flex items-center justify-center text-[#84bd00] font-black uppercase tracking-widest">Sincronizando Nómina...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-4 hover:text-[#84bd00] transition">
              <ArrowLeft size={16} /> Volver al Panel
            </button>
            <h1 className="text-4xl font-black text-[#1a3a5f] tracking-tighter uppercase leading-none">Alumnos</h1>
            <p className="text-[10px] font-black text-[#84bd00] uppercase tracking-[0.3em] mt-2">
              S.A.G.A ver 1.5 • {perfil?.rol === 'director' ? 'Gestión Total' : 'Consulta de Legajos'}
            </p>
          </div>
          
          {/* BOTÓN "NUEVO": Solo visible para Director */}
          {perfil?.rol === 'director' && (
            <button 
              onClick={() => navigate('/alta-alumno')} 
              className="bg-[#84bd00] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#6a9600] transition-all flex items-center gap-2"
            >
              <UserPlus size={18}/> Nuevo Ingreso
            </button>
          )}
        </header>

        <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-sm border border-white/50 p-8">
          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
            <input 
              type="text" placeholder="Buscar por DNI o Apellido..." 
              className="w-full pl-14 pr-6 py-5 bg-gray-50/50 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-[#84bd00]/10"
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {filtrados.map(a => (
              <div key={a.id} className="flex flex-col md:flex-row justify-between items-center p-6 bg-white/40 border border-gray-100 rounded-3xl hover:border-[#84bd00]/30 transition-all">
                <div className="flex items-center gap-5">
                  <div className="bg-green-50 p-4 rounded-2xl text-[#84bd00]"><User size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black text-[#1a3a5f] uppercase tracking-tight">{a.apellido}, {a.nombre}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">DNI: {a.dni} • {a.obra_social || 'PARTICULAR'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  {/* BOTÓN VER (Visible para todos) */}
                  <button onClick={() => navigate(`/legajo/${a.id}`)} className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
                    <Eye size={20}/>
                  </button>

                  {/* ACCIONES ADMINISTRATIVAS: Solo para Director */}
                  {perfil?.rol === 'director' && (
                    <>
                      <button onClick={() => navigate(`/editar-alumno/${a.id}`)} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-800 hover:text-white transition-all">
                        <Edit size={20}/>
                      </button>
                      <button onClick={() => {/* Función eliminar */}} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                        <Trash2 size={20}/>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-auto py-10 text-center opacity-40">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
          version 1.5 <span className="mx-2 text-[#84bd00]">|</span> diciembre 2025
        </p>
      </footer>
    </div>
  );
};

export default Legajos;