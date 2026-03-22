import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; 
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../constants/config'; 
import { 
  LogOut, Calendar, Users, BarChart3, 
  ClipboardList, Settings, DollarSign,
  ShieldCheck
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
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); 
      }
    }
    getPerfil();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const esGestion = perfil?.rol === 'director' || perfil?.rol === 'administrador';

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-[#84bd00] animate-pulse uppercase text-xs tracking-widest">
      Sincronizando {APP_CONFIG.sistema} v3.1...
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 flex flex-col animate-fade-in bg-[#fcfaf7]">
      
      <div className="flex-grow max-w-7xl mx-auto w-full">
        
        {/* HEADER INSTITUCIONAL */}
        <header className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white flex justify-between items-center mb-10 transition-all">
          <div>
            <h1 className="text-3xl font-black text-[#1a3a5f] tracking-tighter leading-none">
              Hola, <span className="text-[#84bd00]">{perfil?.nombre_completo?.split(' ')[0]}</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-2">
              <ShieldCheck size={12} className="text-[#84bd00]"/> {perfil?.rol?.toUpperCase()} • {APP_CONFIG.institucion}
            </p>
          </div>
          <button 
            onClick={handleLogout} 
            className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
          >
            <LogOut size={16}/> Salir
          </button>
        </header>

        {/* GRILLA DE MÓDULOS FILTRADA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          
          {/* Módulo Alumnos (Adaptado por Rol) */}
          <div onClick={() => navigate('/legajos')} className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group border border-white">
            <div className="bg-[#84bd00] w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-green-100 group-hover:scale-110 transition-transform"><Users size={28}/></div>
            <h2 className="text-xl font-black text-[#1a3a5f] uppercase tracking-tighter">
              {esGestion ? 'Legajos Integrales' : 'Alumnos y Actividades'}
            </h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-1">
              {esGestion ? 'Gestión Administrativa y 14 Puntos' : 'Registro de Evolución y Fotos'}
            </p>
          </div>

          {/* Módulo Agenda */}
          <div onClick={() => navigate('/calendario')} className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group border border-white">
            <div className="bg-sky-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-sky-100 group-hover:scale-110 transition-transform"><Calendar size={28}/></div>
            <h2 className="text-xl font-black text-sky-600 uppercase tracking-tighter">Agenda</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-1">Turnos y Terapias</p>
          </div>

          {/* Módulo Mi Cuenta */}
          <div onClick={() => navigate('/mi-perfil')} className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group border border-white">
            <div className="bg-gray-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-gray-100 group-hover:scale-110 transition-transform"><Settings size={28}/></div>
            <h2 className="text-xl font-black text-gray-600 uppercase tracking-tighter">Mi Cuenta</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-1">Seguridad y Perfil</p>
          </div>

          {/* SECCIÓN GESTIÓN (RESTRIGIDA) */}
          {esGestion && (
            <>
              {/* Tesorería (ARCA Facturador Plus) */}
              <div onClick={() => navigate('/gestion-aranceles')} className="relative bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group border border-white">
                <div className="absolute top-8 right-8 bg-[#84bd00] text-white text-[7px] font-black px-2 py-1 rounded-md tracking-tighter uppercase">PV 2 Masivo</div>
                <div className="bg-emerald-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform"><DollarSign size={28}/></div>
                <h2 className="text-xl font-black text-emerald-600 uppercase tracking-tighter">Tesorería</h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase mt-1">Lotes ARCA y Cobranzas</p>
              </div>

              {/* Personal */}
              <div onClick={() => navigate('/personal')} className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group border border-white">
                <div className="bg-indigo-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform"><ClipboardList size={28}/></div>
                <h2 className="text-xl font-black text-indigo-600 uppercase tracking-tighter">Personal</h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase mt-1">RRHH y Plantel Técnico</p>
              </div>

              {/* Reportes */}
              <div onClick={() => navigate('/reportes')} className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group border border-white">
                <div className="bg-red-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-red-100 group-hover:scale-110 transition-transform"><BarChart3 size={28}/></div>
                <h2 className="text-xl font-black text-red-600 uppercase tracking-tighter">Reportes</h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase mt-1">Auditoría General</p>
              </div>
            </>
          )}
        </div>
      </div>

      <footer className="mt-auto py-6 text-center">
        <div className="bg-white/40 backdrop-blur-sm inline-block px-8 py-3 rounded-full border border-white/20 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            {APP_CONFIG.sistema} <span className="text-[#84bd00]">v3.1</span> <span className="mx-3 text-[#84bd00] font-black">•</span> {APP_CONFIG.institucion}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;