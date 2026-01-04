import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Calendar, Users, Activity, 
  ClipboardList, User, FileEdit 
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getPerfil() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = '/'; return; }
        const { data } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
        setPerfil(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    getPerfil();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      navigate('/', { replace: true });
    } catch (error) { window.location.href = '/'; }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#84bd00] animate-pulse uppercase tracking-tighter text-sm">Cargando S.A.G.A v1.5...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent flex flex-col animate-fade-in">
      <div className="flex-grow">
        
        {/* HEADER INSTITUCIONAL */}
        <header className="bg-white/90 backdrop-blur-md p-8 rounded-4xl shadow-sm border border-white/50 flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <User size={14} className="text-[#84bd00]"/>
               <h1 className="text-3xl font-black text-gray-800 tracking-tighter leading-none">
                 Hola, <span className="text-[#84bd00]">{perfil?.nombre_completo?.split(' ')[0] || 'Docente'}</span>
               </h1>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {perfil?.rol === 'director' ? 'Panel de Dirección' : 'Panel Docente'} • Santa Catalina
            </p>
          </div>
          <button onClick={handleLogout} className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-red-100 flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all">
            <LogOut size={16}/> Cerrar Sesión
          </button>
        </header>

        {/* GRILLA DINÁMICA SEGÚN ROL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-10">
          
          {/* 1. MI AGENDA (Visible para todos) */}
          <div onClick={() => navigate('/calendario')} className="bg-white/80 backdrop-blur-md p-10 rounded-4xl shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50 hover:border-sky-200">
            <div className="bg-sky-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-sky-100"><Calendar size={28}/></div>
            <h2 className="text-xl font-black text-sky-600 uppercase tracking-tighter">Mi Agenda</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Turnos y Terapias</p>
          </div>

          {/* 2. ALUMNOS (Visible para todos) */}
          <div onClick={() => navigate('/legajos')} className="bg-white/80 backdrop-blur-md p-10 rounded-4xl shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50 hover:border-[#84bd00]/30">
            <div className="bg-[#84bd00] w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-green-100"><Users size={28}/></div>
            <h2 className="text-xl font-black text-[#84bd00] uppercase tracking-tighter">Alumnos</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Legajos y Médica</p>
          </div>

          {/* 3. MIS DATOS (Visible para todos - NUEVO) */}
          <div onClick={() => navigate('/mi-perfil')} className="bg-white/80 backdrop-blur-md p-10 rounded-4xl shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50 hover:border-gray-300">
            <div className="bg-gray-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-gray-100"><User size={28}/></div>
            <h2 className="text-xl font-black text-gray-600 uppercase tracking-tighter">Mis Datos</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Configuración Personal</p>
          </div>

          {/* 4. REGISTRO DE ACTIVIDADES (Solo Docente / Coordinador) */}
          {perfil?.rol !== 'director' && (
            <div onClick={() => navigate('/evoluciones')} className="bg-white/80 backdrop-blur-md p-10 rounded-4xl shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50 hover:border-purple-200">
              <div className="bg-purple-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-purple-100"><FileEdit size={28}/></div>
              <h2 className="text-xl font-black text-purple-600 uppercase tracking-tighter">Registro de Actividades</h2>
              <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Evolución Diaria</p>
            </div>
          )}

          {/* 5. REPORTES Y PERSONAL (Solo Director) */}
          {perfil?.rol === 'director' && (
            <>
              <div onClick={() => navigate('/estadisticas')} className="bg-white/80 backdrop-blur-md p-10 rounded-4xl shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50 hover:border-red-200">
                <div className="bg-red-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-red-100"><Activity size={28}/></div>
                <h2 className="text-xl font-black text-red-600 uppercase tracking-tighter">Reportes</h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Balance Financiero</p>
              </div>

              <div onClick={() => navigate('/personal')} className="bg-white/80 backdrop-blur-md p-10 rounded-4xl shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50 hover:border-orange-200">
                <div className="bg-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-orange-100"><ClipboardList size={28}/></div>
                <h2 className="text-xl font-black text-orange-600 uppercase tracking-tighter">Personal</h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Gestión de RRHH</p>
              </div>
            </>
          )}

        </div>
      </div>

      <footer className="mt-auto py-6 text-center">
        <div className="bg-white/40 backdrop-blur-sm inline-block px-8 py-3 rounded-full border border-white/20 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            version 1.5 <span className="mx-3 text-[#84bd00] font-black">|</span> diciembre 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;