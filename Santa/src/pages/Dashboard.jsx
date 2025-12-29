import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Calendar, Users, Activity, 
  ClipboardList, BadgeDollarSign, User 
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fecha actual formateada para S.A.G.A.
  const fechaHoy = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  useEffect(() => {
    async function getPerfil() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/');
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/', { replace: true });
    } catch (error) {
      window.location.href = '/';
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse uppercase tracking-tighter">Cargando S.A.G.A...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent flex flex-col">
      <div className="flex-grow">
        {/* HEADER INSTITUCIONAL */}
        <header className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <User size={14} className="text-blue-600"/>
               <h1 className="text-3xl font-black text-blue-900 tracking-tighter leading-none">
                 Hola, {perfil?.nombre_completo?.split(' ')[0] || 'Director'}
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

        {/* GRILLA DE MÓDULOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div onClick={() => navigate('/calendario')} className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50">
            <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-blue-100"><Calendar size={28}/></div>
            <h2 className="text-xl font-black text-blue-900 uppercase tracking-tighter">Mi Agenda</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Turnos y Terapias</p>
          </div>

          <div onClick={() => navigate('/legajos')} className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50">
            <div className="bg-green-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-green-100"><Users size={28}/></div>
            <h2 className="text-xl font-black text-green-600 uppercase tracking-tighter">Alumnos</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Legajos y Médica</p>
          </div>

          {perfil?.rol === 'director' && (
            <div onClick={() => navigate('/registro-pago')} className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50">
              <div className="bg-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-emerald-100"><BadgeDollarSign size={28}/></div>
              <h2 className="text-xl font-black text-emerald-900 uppercase tracking-tighter">Registro de Pago</h2>
              <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Cuotas y Obras Sociales</p>
            </div>
          )}

          {perfil?.rol === 'director' && (
            <div onClick={() => navigate('/personal')} className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white/50">
              <div className="bg-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-lg shadow-orange-100"><ClipboardList size={28}/></div>
              <h2 className="text-xl font-black text-orange-600 uppercase tracking-tighter">Personal</h2>
              <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Gestión de RRHH</p>
            </div>
          )}
        </div>
      </div>

      {/* PIE DE PÁGINA: VERSIÓN Y FECHA */}
      <footer className="mt-auto py-6 text-center">
        <div className="bg-white/40 backdrop-blur-sm inline-block px-8 py-3 rounded-full border border-white/20 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            S.A.G.A ver 1.0 <span className="mx-3 text-blue-200">|</span> {fechaHoy}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;