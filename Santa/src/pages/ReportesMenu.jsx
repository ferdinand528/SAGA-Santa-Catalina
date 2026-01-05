import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileWarning, BarChart3, 
  ShieldAlert, Loader2, DollarSign, PieChart 
} from 'lucide-react';

const ReportesMenu = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  // VALIDACIÓN DE SEGURIDAD v1.8
  useEffect(() => {
    async function validarAcceso() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/');
          return;
        }

        const { data: profile, error } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('id', user.id)
          .single();

        if (error || (profile.rol !== 'director' && profile.rol !== 'administrador')) {
          navigate('/dashboard');
        } else {
          setChecking(false);
        }
      } catch (err) {
        console.error("Error de seguridad:", err);
        navigate('/dashboard');
      }
    }
    validarAcceso();
  }, [navigate]);

  // CONFIGURACIÓN DE LOS 4 REPORTES CRÍTICOS v1.8
  const MENU_REPORTES = [
    {
      titulo: "Documentación Faltante",
      desc: "Auditoría de legajos: DNI, CUD, Títulos y Permisos pendientes.",
      icon: <FileWarning size={28} />,
      path: "/reporte-documentacion",
      color: "bg-orange-500",
      shadow: "shadow-orange-100",
      border: "hover:border-orange-200"
    },
    {
      titulo: "Caja Diaria",
      desc: "Arqueo de ingresos del día desglosado por Efectivo, Transferencia y Cheques.",
      icon: <DollarSign size={28} />,
      path: "/reporte-caja-diaria",
      color: "bg-emerald-500",
      shadow: "shadow-emerald-100",
      border: "hover:border-emerald-200"
    },
    {
      titulo: "Por Obra Social",
      desc: "Facturación mensual agrupada por convenio (IOSCOR, PAMI, etc).",
      icon: <PieChart size={28} />,
      path: "/reporte-obra-social",
      color: "bg-purple-500",
      shadow: "shadow-purple-100",
      border: "hover:border-purple-200"
    },
    {
      titulo: "Balance Financiero",
      desc: "Estado general de cobros, morosidad y proyecciones mensuales.",
      icon: <BarChart3 size={28} />,
      path: "/estadisticas",
      color: "bg-red-500",
      shadow: "shadow-red-100",
      border: "hover:border-red-200"
    }
  ];

  if (checking) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fcfaf7]">
      <Loader2 className="animate-spin text-[#84bd00] mb-4" size={32} />
      <p className="font-black text-gray-400 uppercase text-[10px] tracking-[0.3em]">
        Validando Credenciales de Dirección...
      </p>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        {/* NAVEGACIÓN */}
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-[#84bd00] transition"
        >
          <ArrowLeft size={16} /> Volver al Panel Principal
        </button>

        {/* CABECERA INSTITUCIONAL */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert size={20} className="text-[#84bd00]"/>
            <h1 className="text-4xl font-black text-[#1a3a5f] uppercase tracking-tighter leading-none">
              Centro de Reportes
            </h1>
          </div>
          <p className="text-[10px] font-black text-[#84bd00] uppercase tracking-[0.3em] ml-1">
            S.A.G.A v1.8 • Auditoría Restringida Santa Catalina
          </p>
        </header>

        {/* GRILLA DE INFORMES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MENU_REPORTES.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => navigate(item.path)}
              className={`bg-white/90 backdrop-blur-xl p-8 rounded-4xl shadow-sm border border-white/50 transition-all cursor-pointer group ${item.border} hover:shadow-2xl hover:-translate-y-1`}
            >
              <div className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition shadow-xl ${item.shadow}`}>
                {item.icon}
              </div>
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter leading-tight">
                {item.titulo}
              </h2>
              <p className="text-gray-400 text-[10px] font-bold uppercase mt-3 leading-relaxed tracking-wide">
                {item.desc}
              </p>
              
              <div className="mt-8 flex items-center gap-2 text-[#84bd00] opacity-0 group-hover:opacity-100 transition-all">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#84bd00]">Abrir Informe</span>
                <div className="h-[1px] w-8 bg-[#84bd00]"></div>
              </div>
            </div>
          ))}
        </div>

        {/* SECCIÓN DE SEGURIDAD */}
        <div className="mt-20 p-8 bg-blue-50/50 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-center gap-6 max-w-3xl">
          <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg">
            <ShieldAlert size={24}/>
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Aviso de Privacidad Administrativa</p>
            <p className="text-[9px] font-bold text-blue-600 uppercase leading-normal tracking-wider opacity-80">
              Esta sección contiene datos sensibles de facturación y legajos personales de Santa Catalina. 
              El acceso ha sido registrado bajo tu perfil de Dirección. 
              Evita compartir capturas de pantalla de estos reportes con personal no autorizado.
            </p>
          </div>
        </div>

      </div>

      <footer className="mt-20 py-10 text-center opacity-30">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
          version 1.8 <span className="mx-2 text-[#84bd00]">|</span> dirección santa catalina
        </p>
      </footer>
    </div>
  );
};

export default ReportesMenu;