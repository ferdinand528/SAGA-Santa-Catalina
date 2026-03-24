import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase'; 
import { 
  ArrowLeft, FileWarning, ClipboardCheck, 
  DollarSign, Users, HeartPulse, Loader2 
} from 'lucide-react';

const ReportesMenu = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function obtenerPerfil() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('perfiles')
            .select('rol')
            .eq('id', user.id)
            .single();
          setPerfil(data);
        }
      } catch (error) {
        console.error("Error al obtener perfil:", error);
      } finally {
        setLoading(false);
      }
    }
    obtenerPerfil();
  }, []);

  // 🛡️ NUEVA LÓGICA DE PERMISOS AJUSTADA
  const rolUsuario = perfil?.rol?.toLowerCase();
  const esDirector = rolUsuario === 'director'; // Súper Usuario
  const esGestionAlumnos = ['director', 'administrador', 'coordinacion'].includes(rolUsuario);

  const menuItems = [
    {
      title: "Auditoría Legajos Personal",
      desc: "Estado de archivos de profesionales",
      icon: <FileWarning size={28} />,
      path: "/reporte-legajos",
      color: "bg-red-500",
      shadow: "shadow-red-100",
      ver: esDirector // 👈 SOLO DIRECTOR
    },
    {
      title: "Auditoría Legajos Alumnos",
      desc: "Control de los 14 documentos obligatorios",
      icon: <ClipboardCheck size={28} />,
      path: "/reporte-legajos-alumnos",
      color: "bg-indigo-600",
      shadow: "shadow-indigo-100",
      ver: esGestionAlumnos // 👈 DIRECTOR, ADMIN Y COORD
    },
    {
      title: "Reporte de Cobranzas",
      desc: "Pagos y morosidad general",
      icon: <DollarSign size={28} />,
      path: "/reportes-caja",
      color: "bg-emerald-500",
      shadow: "shadow-emerald-100",
      ver: esDirector // 👈 SOLO DIRECTOR
    },
    {
      title: "Asistencia Mensual",
      desc: "Control de presentismo",
      icon: <Users size={28} />,
      path: "/reportes-asistencia",
      color: "bg-blue-500",
      shadow: "shadow-blue-100",
      ver: true // 👈 TODOS (Incluye Docentes)
    },
    {
      title: "Censo de Obra Social",
      desc: "Padrón detallado por entidad",
      icon: <HeartPulse size={28} />,
      path: "/censo-obra-social",
      color: "bg-purple-600",
      shadow: "shadow-purple-100",
      ver: esGestionAlumnos // 👈 DIRECTOR, ADMIN Y COORD
    }
  ];

  // Filtramos la lista basándonos en la propiedad 'ver'
  const itemsVisibles = menuItems.filter(item => item.ver);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-transparent">
      <Loader2 className="animate-spin text-[#84bd00]" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent font-sans animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-[#84bd00] transition bg-white/50 px-4 py-2 rounded-full shadow-sm"
          >
            <ArrowLeft size={18} /> Volver al Dashboard
          </button>
          <h1 className="text-4xl font-black text-[#1a3a5f] tracking-tighter uppercase mt-6 leading-none">
            Centro de <span className="text-[#84bd00]">Reportes</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">
            Instituto Santa Catalina • {esDirector ? 'Modo Súper Usuario' : 'Acceso Restringido'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {itemsVisibles.map((item, index) => (
            <div 
              key={index}
              onClick={() => navigate(item.path)}
              className="bg-white/80 backdrop-blur-md p-10 rounded-[3rem] shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white flex items-center gap-8"
            >
              <div className={`${item.color} w-20 h-20 rounded-3xl flex items-center justify-center text-white group-hover:scale-110 transition shadow-lg ${item.shadow}`}>
                {item.icon}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                  {item.title}
                </h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase mt-2 tracking-widest leading-tight">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {itemsVisibles.length === 0 && (
          <div className="text-center py-20 bg-white/20 backdrop-blur-sm rounded-[3rem]">
            <p className="text-gray-400 font-black uppercase text-xs tracking-[0.3em]">No tienes reportes asignados a tu rol</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportesMenu;