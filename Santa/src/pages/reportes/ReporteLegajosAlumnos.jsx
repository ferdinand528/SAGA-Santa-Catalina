import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, 
  AlertCircle, User, Search, FileSearch 
} from 'lucide-react';

// 1. MATRIZ DE DOCUMENTOS PARA ALUMNOS (v2.1 Oficial)
const DOCS_ALUMNOS = [
  { id: 'doc_dni_alumno', label: 'DNI A' }, { id: 'doc_dni_tutor', label: 'DNI T' },
  { id: 'doc_cuil_alumno', label: 'CUIL A' }, { id: 'doc_cuil_tutor', label: 'CUIL T' },
  { id: 'doc_cud', label: 'CUD' }, { id: 'doc_historia_clinica', label: 'H.C.' },
  { id: 'doc_vacunacion', label: 'VAC' }, { id: 'doc_obra_social', label: 'O.S.' },
  { id: 'doc_anamnesis', label: 'ANA' }, { id: 'doc_permiso_fotos', label: 'FOTO' },
  { id: 'doc_salidas', label: 'SAL' }, { id: 'doc_transporte', label: 'TRA' },
  { id: 'doc_evaluacion', label: 'EVAL' }, { id: 'doc_plan_tratamiento', label: 'PLAN' }
];

const ReporteLegajosAlumnos = () => {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); 

  const fetchAuditoria = useCallback(async () => {
    try {
      // CORRECCIÓN: Ordenamos por 'apellido' porque 'nombre_completo' no existe en la tabla alumnos
      const { data, error } = await supabase
        .from('alumnos')
        .select('*')
        .order('apellido', { ascending: true });
      
      if (error) throw error;
      setAlumnos(data || []);
    } catch (err) {
      console.error("Error en auditoría alumnos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditoria();
  }, [fetchAuditoria]);

  const analizarEstado = (alu) => {
    const faltantes = DOCS_ALUMNOS.filter(doc => !alu[doc.id]);
    return { cantidad: faltantes.length, estaCompleto: faltantes.length === 0 };
  };

  const listaFiltrada = alumnos.filter(alu => {
    const { estaCompleto } = analizarEstado(alu);
    if (filtro === 'incompletos') return !estaCompleto;
    if (filtro === 'completos') return estaCompleto;
    return true;
  });

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fcfaf7]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p className="font-black text-blue-600 uppercase text-xs tracking-widest italic">Sincronizando Auditoría de Alumnos v2.1...</p>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#fcfaf7] font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <button onClick={() => navigate('/reportes')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-blue-600 transition mb-4">
              <ArrowLeft size={16} /> Volver a Reportes
            </button>
            <div className="flex items-center gap-3">
              <FileSearch size={28} className="text-blue-600" />
              <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase leading-none">
                Auditoría <span className="text-blue-600">Alumnos</span>
              </h1>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 italic">Santa Catalina • Gestión v2.1</p>
          </div>

          <div className="flex bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
            {['todos', 'incompletos', 'completos'].map((f) => (
              <button 
                key={f} 
                onClick={() => setFiltro(f)} 
                className={`px-6 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${filtro === f ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        <div className="space-y-4">
          {listaFiltrada.length > 0 ? (
            listaFiltrada.map((alu) => {
              const { cantidad, estaCompleto } = analizarEstado(alu);
              return (
                <div key={alu.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-white flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-6 min-w-[250px]">
                    <div className={`p-4 rounded-2xl ${estaCompleto ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                      <User size={24}/>
                    </div>
                    <div>
                      {/* CORRECCIÓN: Usamos apellido y nombre por separado */}
                      <h3 className="font-black text-lg text-gray-800 uppercase leading-none mb-1 group-hover:text-blue-600 transition-colors">
                        {alu.apellido}, {alu.nombre}
                      </h3>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">{alu.dni}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 flex-1 px-4 justify-center">
                    {DOCS_ALUMNOS.map(doc => (
                      <div key={doc.id} className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase border ${alu[doc.id] ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-300 border-red-100 opacity-40'}`}>
                        {doc.label}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-6">
                    {estaCompleto ? (
                      <div className="flex items-center gap-2 text-green-600 font-black text-[9px] uppercase tracking-widest"><CheckCircle2 size={18}/> Completo</div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-500 font-black text-[9px] uppercase tracking-widest animate-pulse"><AlertCircle size={18}/> Faltan {cantidad}</div>
                    )}
                    <button onClick={() => navigate(`/legajo/${alu.id}`)} className="bg-gray-50 text-gray-400 hover:text-blue-600 p-4 rounded-2xl transition-colors shadow-inner"><Search size={20}/></button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white/50 p-24 rounded-[3rem] border-4 border-dashed border-gray-100 text-center">
              <User size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="font-black text-gray-300 uppercase text-xs tracking-[0.2em] italic">
                No se encontraron legajos registrados para el filtro &quot;{filtro}&quot;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReporteLegajosAlumnos;