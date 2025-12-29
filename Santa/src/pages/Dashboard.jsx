import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Calendar, Users, Activity, 
  ClipboardList, User 
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const fechaHoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  useEffect(() => {
    async function getPerfil() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/'; // Redirección forzada si no hay sesión
          return;
        }
        const { data } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
        setPerfil(data);
      } catch (err) {
        console.error("Error cargando perfil", err);
      } finally {
        setLoading(false);
      }
    }
    getPerfil();
  }, [navigate]);

  // FUNCIÓN DE CIERRE DE SESIÓN REFORZADA
  const handleLogout = async () => {
    try {
      // 1. Intentamos cerrar sesión en Supabase
      await supabase.auth.signOut();
      
      // 2. Limpiamos manualmente cualquier rastro en el almacenamiento local
      localStorage.clear();
      sessionStorage.clear();

      // 3. Forzamos la redirección al Login
      navigate('/', { replace: true });
    } catch (error) {
      // 4. Si algo falla, forzamos recarga total del navegador a la raíz
      window.location.href = '/';
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#84bd00] animate-pulse uppercase tracking-tighter">Sincronizando S.A.G.A...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent flex flex-col animate-fade-in">
      <div className="flex-grow">
        {/* HEADER INSTITUCIONAL - Verde #84bd00 */}
        <header className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white/50 flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <User size={14} className="text-[#84bd00]"/>
               <h1 className="text-3xl font-black text-gray-800 tracking-tighter leading-none">
                 Hola, <span className="text-[#84bd00]">{perfil?.nombre_completo?.split(' ')[0] || 'Director'}</span>
               </h1>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {perfil?.rol === 'director' ? 'Panel de Dirección' : 'Panel Docente'} • Santa Catalina
            </p>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-red-100 flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            <LogOut size={16}/> Cerrar Sesión
          </button>
        </header>

        {/* GRILLA DE MÓDULOS CON COLORES DEL LOGO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* MI AGENDA - Azul del Logo */}
          <div onClick={() => navigate('/calendario')} className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50 hover:border-sky-200">
            <div className="bg-sky-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-sky-100"><Calendar size={28}/></div>
            <h2 className="text-xl font-black text-sky-600 uppercase tracking-tighter">Mi Agenda</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Turnos y Terapias</p>
          </div>

          {/* ALUMNOS - Verde Principal #84bd00 */}
          <div onClick={() => navigate('/legajos')} className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50 hover:border-[#84bd00]/30">
            <div className="bg-[#84bd00] w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-green-100"><Users size={28}/></div>
            <h2 className="text-xl font-black text-[#84bd00] uppercase tracking-tighter">Alumnos</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Legajos y Médica</p>
          </div>

          {/* REPORTES - Rojo del Logo */}
          <div onClick={() => navigate('/estadisticas')} className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50 hover:border-red-200">
            <div className="bg-red-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-red-100"><Activity size={28}/></div>
            <h2 className="text-xl font-black text-red-600 uppercase tracking-tighter">Reportes</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Balance Financiero</p>
          </div>

          {/* PERSONAL - Naranja del Logo */}
          <div onClick={() => navigate('/personal')} className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50 hover:border-orange-200">
            <div className="bg-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-orange-100"><ClipboardList size={28}/></div>
            <h2 className="text-xl font-black text-orange-600 uppercase tracking-tighter">Personal</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Gestión de RRHH</p>
          </div>

        </div>
      </div>

      <footer className="mt-auto py-6 text-center">
        <div className="bg-white/40 backdrop-blur-sm inline-block px-8 py-3 rounded-full border border-white/20 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            S.A.G.A ver 1.0 <span className="mx-3 text-[#84bd00] font-black">|</span> {fechaHoy}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;