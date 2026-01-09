import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../constants/Config';
import { 
  ArrowLeft, FileWarning, CheckCircle2, 
  AlertCircle, User, Search, Download 
} from 'lucide-react';

const ReporteLegajos = () => {
  const navigate = useNavigate();
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // todos, incompletos, completos

  const docsRequeridos = [
    { id: 'url_dni_frente', label: 'DNI F' },
    { id: 'url_dni_dorso', label: 'DNI D' },
    { id: 'url_cv', label: 'CV' },
    { id: 'url_titulo', label: 'Título' },
    { id: 'url_seguro', label: 'Seguro' },
    { id: 'url_cbu', label: 'CBU' },
    { id: 'url_matricula', label: 'Matrícula' }
  ];

  useEffect(() => {
    async function fetchAuditoria() {
      const { data } = await supabase
        .from('perfiles')
        .select('*')
        .order('nombre_completo', { ascending: true });
      
      setPersonal(data || []);
      setLoading(false);
    }
    fetchAuditoria();
  }, []);

  // Lógica para contar faltantes
  const obtenerEstado = (p) => {
    const faltantes = docsRequeridos.filter(doc => !p[doc.id]);
    return {
      cantidad: faltantes.length,
      lista: faltantes.map(f => f.label),
      estaCompleto: faltantes.length === 0
    };
  };

  const personalFiltrado = personal.filter(p => {
    const estado = obtenerEstado(p);
    if (filtro === 'incompletos') return !estado.estaCompleto;
    if (filtro === 'completos') return estado.estaCompleto;
    return true;
  });

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#84bd00] animate-pulse uppercase text-xs">Generando Auditoría v{APP_CONFIG.version}...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent font-sans text-gray-800 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <button onClick={() => navigate('/reportes')} className="flex items-center gap-2 text-gray-500 font-black uppercase text-[10px] hover:text-[#84bd00] transition mb-4">
              <ArrowLeft size={16} /> Volver a Reportes
            </button>
            <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase leading-none">
              Auditoría de <span className="text-[#84bd00]">Legajos</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Control de Documentación Obligatoria • Santa Catalina</p>
          </div>

          <div className="flex bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
            {['todos', 'incompletos', 'completos'].map((f) => (
              <button 
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-6 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${filtro === f ? 'bg-[#84bd00] text-white shadow-lg shadow-green-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        {/* RESUMEN RÁPIDO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Personal</p>
            <p className="text-3xl font-black text-gray-800">{personal.length}</p>
          </div>
          <div className="bg-red-50 p-8 rounded-[2.5rem] shadow-sm border border-red-100">
            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Legajos Incompletos</p>
            <p className="text-3xl font-black text-red-600">{personal.filter(p => obtenerEstado(p).cantidad > 0).length}</p>
          </div>
          <div className="bg-green-50 p-8 rounded-[2.5rem] shadow-sm border border-green-100">
            <p className="text-[9px] font-black text-[#84bd00] uppercase tracking-widest mb-1">Legajos al Día</p>
            <p className="text-3xl font-black text-[#84bd00]">{personal.filter(p => obtenerEstado(p).estaCompleto).length}</p>
          </div>
        </div>

        {/* LISTADO DE AUDITORÍA */}
        <div className="space-y-4">
          {personalFiltrado.map((p) => {
            const estado = obtenerEstado(p);
            return (
              <div key={p.id} className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-2xl ${estado.estaCompleto ? 'bg-green-100 text-[#84bd00]' : 'bg-red-100 text-red-500'}`}>
                    <User size={24}/>
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-800 uppercase leading-none mb-1">{p.nombre_completo}</h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{p.profesion || 'Sin Cargo Asignado'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-center flex-1 max-w-xl px-6">
                  {docsRequeridos.map(doc => (
                    <div key={doc.id} className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${p[doc.id] ? 'bg-green-50 text-[#84bd00] border-green-200' : 'bg-red-50 text-red-500 border-red-200 animate-pulse'}`}>
                      {doc.label}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  {estado.estaCompleto ? (
                    <div className="flex items-center gap-2 text-[#84bd00] font-black text-[9px] uppercase tracking-widest">
                      <CheckCircle2 size={18}/> Completo
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2 text-red-500 font-black text-[9px] uppercase tracking-widest">
                        <AlertCircle size={18}/> Faltan {estado.cantidad}
                      </div>
                    </div>
                  )}
                  <button onClick={() => navigate(`/perfil/${p.id}`)} className="bg-gray-50 text-gray-400 hover:text-[#84bd00] p-3 rounded-2xl transition-colors shadow-inner">
                    <Search size={20}/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReporteLegajos;