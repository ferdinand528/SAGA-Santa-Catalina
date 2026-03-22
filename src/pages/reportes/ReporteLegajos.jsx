import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../../constants/config'; 
import { 
  ArrowLeft, CheckCircle2, 
  AlertCircle, User, Search, FileSearch 
} from 'lucide-react';

// 1. MATRIZ ACTUALIZADA: Coincide con los 7 requisitos de Santa Catalina
const DOCS_REQUERIDOS = [
  { id: 'url_dni_frente', label: 'DNI F' },
  { id: 'url_dni_dorso', label: 'DNI D' },
  { id: 'url_cv', label: 'CV' },
  { id: 'url_titulo', label: 'Título' },
  { id: 'url_buena_conducta', label: 'B. Cond' }, // Reemplazado
  { id: 'url_afip', label: 'AFIP' },             // Reemplazado
  { id: 'url_cbu', label: 'CBU' }
];

const ReporteLegajos = () => {
  const navigate = useNavigate();
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); 

  const fetchAuditoria = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('perfiles')
        .select('*')
        .order('nombre_completo', { ascending: true });
      
      setPersonal(data || []);
    } catch (error) {
      console.error("Error en auditoría:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditoria();
  }, [fetchAuditoria]);

  // Lógica de validación de legajo
  const obtenerEstado = useCallback((p) => {
    const faltantes = DOCS_REQUERIDOS.filter(doc => !p[doc.id]);
    return {
      cantidad: faltantes.length,
      lista: faltantes.map(f => f.label),
      estaCompleto: faltantes.length === 0
    };
  }, []); 

  const personalFiltrado = personal.filter(p => {
    const estado = obtenerEstado(p);
    if (filtro === 'incompletos') return !estado.estaCompleto;
    if (filtro === 'completos') return estado.estaCompleto;
    return true;
  });

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fcfaf7]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#84bd00] mb-4"></div>
      <p className="font-black text-[#84bd00] uppercase text-xs tracking-widest">Sincronizando Auditoría v2.1...</p>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#fcfaf7] font-sans text-gray-800 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <button onClick={() => navigate('/reportes')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-[#84bd00] transition mb-4">
              <ArrowLeft size={16} /> Volver a Reportes
            </button>
            <div className="flex items-center gap-3">
              <FileSearch size={28} className="text-[#84bd00]" />
              <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase leading-none">
                Auditoría <span className="text-[#84bd00]">Personal</span>
              </h1>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 italic">Control de Carpeta Digital • Santa Catalina</p>
          </div>

          {/* SELECTOR DE FILTRO */}
          <div className="flex bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
            {['todos', 'incompletos', 'completos'].map((f) => (
              <button 
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-6 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${filtro === f ? 'bg-[#84bd00] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        {/* INDICADORES RÁPIDOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Plantilla</p>
            <p className="text-3xl font-black text-gray-800">{personal.length}</p>
          </div>
          <div className="bg-red-50 p-8 rounded-[2.5rem] shadow-sm border border-red-100 text-red-600">
            <p className="text-[9px] font-black uppercase tracking-widest mb-1">Con Faltantes</p>
            <p className="text-3xl font-black">{personal.filter(p => !obtenerEstado(p).estaCompleto).length}</p>
          </div>
          <div className="bg-green-50 p-8 rounded-[2.5rem] shadow-sm border-green-100 text-[#84bd00]">
            <p className="text-[9px] font-black uppercase tracking-widest mb-1">Legajos Blindados</p>
            <p className="text-3xl font-black">{personal.filter(p => obtenerEstado(p).estaCompleto).length}</p>
          </div>
        </div>

        {/* LISTADO DINÁMICO */}
        <div className="space-y-4">
          {personalFiltrado.map((p) => {
            const estado = obtenerEstado(p);
            return (
              <div key={p.id} className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all group">
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-2xl ${estado.estaCompleto ? 'bg-green-100 text-[#84bd00]' : 'bg-red-100 text-red-500'}`}>
                    <User size={24}/>
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-800 uppercase leading-none mb-1 group-hover:text-[#84bd00] transition-colors">
                      {p.nombre_completo}
                    </h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      {p.profesion || 'Personal Sin Cargo'}
                    </p>
                  </div>
                </div>

                {/* ETIQUETAS DE ARCHIVOS: Marcamos en rojo los que faltan */}
                <div className="flex flex-wrap gap-2 md:justify-center flex-1 max-w-xl px-6">
                  {DOCS_REQUERIDOS.map(doc => (
                    <div key={doc.id} className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border transition-all ${p[doc.id] ? 'bg-green-50 text-[#84bd00] border-green-200' : 'bg-red-50 text-red-500 border-red-200 animate-pulse'}`}>
                      {doc.label}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  {estado.estaCompleto ? (
                    <CheckCircle2 className="text-[#84bd00]" size={24}/>
                  ) : (
                    <div className="flex items-center gap-2 text-red-500 font-black text-[9px] uppercase tracking-widest">
                      <AlertCircle size={18}/> Faltan {estado.cantidad}
                    </div>
                  )}
                  <button 
                    onClick={() => navigate(`/perfil/${p.id}`)} 
                    className="bg-gray-50 text-gray-400 hover:text-[#84bd00] hover:bg-white p-3 rounded-2xl transition-all shadow-inner border border-transparent hover:border-gray-100"
                  >
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