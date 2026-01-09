import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileWarning, CheckCircle2, 
  AlertCircle, User, Search 
} from 'lucide-react';

const ReporteLegajosAlumnos = () => {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); 

  const docsRequeridos = [
    { id: 'doc_dni_alumno', label: 'DNI A' }, { id: 'doc_dni_tutor', label: 'DNI T' },
    { id: 'doc_cuil_alumno', label: 'CUIL A' }, { id: 'doc_cuil_tutor', label: 'CUIL T' },
    { id: 'doc_cud', label: 'CUD' }, { id: 'doc_historia_clinica', label: 'H.C.' },
    { id: 'doc_vacunacion', label: 'VAC' }, { id: 'doc_obra_social', label: 'O.S.' },
    { id: 'doc_anamnesis', label: 'ANA' }, { id: 'doc_permiso_fotos', label: 'FOTO' },
    { id: 'doc_salidas', label: 'SAL' }, { id: 'doc_transporte', label: 'TRA' },
    { id: 'doc_evaluacion', label: 'EVAL' }, { id: 'doc_plan_tratamiento', label: 'PLAN' }
  ];

  useEffect(() => {
    fetchAuditoria();
  }, []);

  async function fetchAuditoria() {
    setLoading(true);
    const { data, error } = await supabase
      .from('alumnos')
      .select('*')
      .order('nombre_completo', { ascending: true });
    
    if (error) console.error("Error cargando auditoría:", error);
    setAlumnos(data || []);
    setLoading(false);
  }

  const analizarLegajo = (alu) => {
    const faltantes = docsRequeridos.filter(doc => !alu[doc.id]);
    return { cantidad: faltantes.length, estaCompleto: faltantes.length === 0 };
  };

  const listaFiltrada = alumnos.filter(alu => {
    const { estaCompleto } = analizarLegajo(alu);
    if (filtro === 'incompletos') return !estaCompleto;
    if (filtro === 'completos') return estaCompleto;
    return true;
  });

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse uppercase text-xs">Cargando Auditoría de Alumnos...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent font-sans text-gray-800 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <button onClick={() => navigate('/reportes')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-indigo-600 transition mb-4">
              <ArrowLeft size={16} /> Volver a Reportes
            </button>
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
              Auditoría <span className="text-indigo-600">Alumnos</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Santa Catalina • Control de Carpetas</p>
          </div>

          <div className="flex bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
            {['incompletos', 'todos', 'completos'].map((f) => (
              <button key={f} onClick={() => setFiltro(f)} className={`px-6 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${filtro === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>{f}</button>
            ))}
          </div>
        </header>

        <div className="space-y-4">
          {listaFiltrada.length > 0 ? (
            listaFiltrada.map((alu) => {
              const { cantidad, estaCompleto } = analizarLegajo(alu);
              return (
                <div key={alu.id} className="bg-white/90 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition-all">
                  <div className="flex items-center gap-6 min-w-[250px]">
                    <div className={`p-4 rounded-2xl ${estaCompleto ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}><User size={24}/></div>
                    <div>
                      <h3 className="font-black text-lg text-gray-800 uppercase leading-none mb-1">{alu.nombre_completo}</h3>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{alu.diagnostico || 'Diagnóstico Pendiente'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 flex-1 px-4">
                    {docsRequeridos.map(doc => (
                      <div key={doc.id} className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase border ${alu[doc.id] ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-400 border-red-100 opacity-30'}`}>{doc.label}</div>
                    ))}
                  </div>
                  <div className="flex items-center gap-6">
                    {estaCompleto ? <div className="flex items-center gap-2 text-green-600 font-black text-[9px] uppercase tracking-widest"><CheckCircle2 size={18}/> Completo</div> : <div className="flex items-center gap-2 text-red-500 font-black text-[9px] uppercase tracking-widest animate-pulse"><AlertCircle size={18}/> Faltan {cantidad}</div>}
                    <button onClick={() => navigate(`/legajo/${alu.id}`)} className="bg-gray-50 text-gray-400 hover:text-indigo-600 p-4 rounded-2xl transition-colors shadow-inner"><Search size={20}/></button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white/50 p-20 rounded-[3rem] border-2 border-dashed border-gray-100 text-center">
              <User size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="font-black text-gray-300 uppercase text-xs tracking-[0.2em]">No se encontraron alumnos para este filtro</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReporteLegajosAlumnos;