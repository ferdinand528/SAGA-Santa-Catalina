import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileWarning, ClipboardCheck, 
  DollarSign, Users 
} from 'lucide-react';

const ReportesMenu = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Auditoría Legajos Personal",
      desc: "Estado de archivos de profesionales",
      icon: <FileWarning size={28} />,
      path: "/reporte-legajos",
      color: "bg-red-500",
      shadow: "shadow-red-100"
    },
    {
      title: "Auditoría Legajos Alumnos",
      desc: "Control de los 14 documentos obligatorios",
      icon: <ClipboardCheck size={28} />,
      path: "/reporte-legajos-alumnos",
      color: "bg-indigo-600",
      shadow: "shadow-indigo-100"
    },
    {
      title: "Reporte de Cobranzas",
      desc: "Pagos y morosidad general",
      icon: <DollarSign size={28} />,
      path: "/reportes-caja",
      color: "bg-emerald-500",
      shadow: "shadow-emerald-100"
    },
    {
      title: "Asistencia Mensual",
      desc: "Control de presentismo",
      icon: <Users size={28} />,
      path: "/reportes-asistencia",
      color: "bg-blue-500",
      shadow: "shadow-blue-100"
    }
  ];

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent font-sans animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-[#84bd00] transition bg-white/50 px-4 py-2 rounded-full shadow-sm">
            <ArrowLeft size={18} /> Volver al Dashboard
          </button>
          <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase mt-6 leading-none">
            Centro de <span className="text-[#84bd00]">Reportes</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Instituto Santa Catalina • v2.0</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {menuItems.map((item, index) => (
            <div 
              key={index}
              onClick={() => navigate(item.path)}
              className="bg-white/80 backdrop-blur-md p-10 rounded-[3rem] shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-white flex items-center gap-8"
            >
              <div className={`${item.color} w-20 h-20 rounded-3xl flex items-center justify-center text-white group-hover:scale-110 transition shadow-lg ${item.shadow}`}>
                {item.icon}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter leading-none">{item.title}</h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase mt-2 tracking-widest leading-tight">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportesMenu;