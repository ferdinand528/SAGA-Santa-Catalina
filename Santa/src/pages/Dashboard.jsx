import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Calendar, Users, BarChart3, 
  ClipboardList, User, FileEdit, Settings, DollarSign 
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getPerfil() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/'); return; }
        const { data } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
        setPerfil(data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    }
    getPerfil();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/', { replace: true });
  };

  // Lógica de Permisos de Dirección
  const esGestion = perfil?.rol === 'director' || perfil?.rol === 'administrador';

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-[#84bd00] animate-pulse uppercase text-xs">
      Sincronizando S.A.G.A v1.8...
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 flex flex-col animate-fade-in">
      <div className="flex-grow">
        
        {/* HEADER */}
        <header className="bg-white/90 backdrop-blur-md p-8 rounded-4xl shadow-sm border border-white/50 flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <User size={14} className="text-[#84bd00]"/>
               <h1 className="text-3xl font-black text-gray-800 tracking-tighter leading-none">
                 Hola, <span className="text-[#84bd00]">{perfil?.nombre_completo?.split(' ')[0]}</span>
               </h1>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {perfil?.rol?.toUpperCase()} • Instituto Santa Catalina
            </p>
          </div>
          <button onClick={handleLogout} className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-red-100 flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-sm">
            <LogOut size={16}/> Salir
          </button>
        </header>

        {/* MÓDULOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-10">
          
          <div onClick={() => navigate('/calendario')} className="bg-white/80 backdrop-blur-md p-10 rounded-4xl shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50 hover:border-sky-200">
            <div className="bg-sky-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-sky-100"><Calendar size={28}/></div>
            <h2 className="text-xl font-black text-sky-600 uppercase tracking-tighter">Agenda</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Turnos y Terapias</p>
          </div>

          <div onClick={() => navigate('/legajos')} className="bg-white/80 backdrop-blur-md p-10 rounded-4xl shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50 hover:border-[#84bd00]/30">
            <div className="bg-[#84bd00] w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-green-100"><Users size={28}/></div>
            <h2 className="text-xl font-black text-[#84bd00] uppercase tracking-tighter">Alumnos</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Legajo Integral</p>
          </div>

          <div onClick={() => navigate('/mi-perfil')} className="bg-white/80 backdrop-blur-md p-10 rounded-4xl shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50 hover:border-gray-300">
            <div className="bg-gray-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-gray-100"><Settings size={28}/></div>
            <h2 className="text-xl font-black text-gray-600 uppercase tracking-tighter">Mis Datos</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Seguridad y Archivos</p>
          </div>

          {perfil?.rol !== 'director' && (
            <div onClick={() => navigate('/evoluciones')} className="bg-white/80 backdrop-blur-md p-10 rounded-4xl shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50 hover:border-orange-200">
              <div className="bg-[#ff6b00] w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-orange-100"><FileEdit size={28}/></div>
              <h2 className="text-xl font-black text-[#ff6b00] uppercase tracking-tighter">Actividades</h2>
              <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Evolución Diaria</p>
            </div>
          )}

          {/* MÓDULOS DE GESTIÓN (DIRECTOR / ADMIN) */}
          {esGestion && (
            <>
              <div onClick={() => navigate('/cobranzas')} className="bg-white/80 backdrop-blur-md p-10 rounded-4xl shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50 hover:border-emerald-200">
                <div className="bg-emerald-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-emerald-100"><DollarSign size={28}/></div>
                <h2 className="text-xl font-black text-emerald-600 uppercase tracking-tighter">Cobranzas</h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Registrar Pagos</p>
              </div>

              <div onClick={() => navigate('/reportes')} className="bg-white/80 backdrop-blur-md p-10 rounded-4xl shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50 hover:border-red-200">
                <div className="bg-red-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-red-100"><BarChart3 size={28}/></div>
                <h2 className="text-xl font-black text-red-600 uppercase tracking-tighter">Reportes</h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Auditoría y Gestión</p>
              </div>

              <div onClick={() => navigate('/personal')} className="bg-white/80 backdrop-blur-md p-10 rounded-4xl shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50 hover:border-indigo-200">
                <div className="bg-indigo-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-indigo-100"><ClipboardList size={28}/></div>
                <h2 className="text-xl font-black text-indigo-600 uppercase tracking-tighter">Personal</h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Gestión de RRHH</p>
              </div>
            </>
          )}

        </div>
      </div>

      <footer className="mt-auto py-6 text-center">
        <div className="bg-white/40 backdrop-blur-sm inline-block px-8 py-3 rounded-full border border-white/20 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            version 1.8 <span className="mx-3 text-[#84bd00] font-black">|</span> enero 2026
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;