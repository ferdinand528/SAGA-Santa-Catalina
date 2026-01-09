import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, AlertCircle, User, 
  Phone, Loader2, ShieldCheck, FileSearch 
} from 'lucide-react';

// 1. DEFINICIÓN ESTÁTICA (Fuera del componente para evitar re-renders y warnings)
const MAPA_DOCUMENTOS = [
  { key: 'doc_dni_alumno', label: 'DNI Alumno', cat: 'Identidad' },
  { key: 'doc_dni_tutor', label: 'DNI Tutor', cat: 'Identidad' },
  { key: 'doc_cuil_alumno', label: 'CUIL Alumno', cat: 'Identidad' },
  { key: 'doc_cuil_tutor', label: 'CUIL Tutor', cat: 'Identidad' },
  { key: 'doc_cud', label: 'Certificado CUD', cat: 'Salud' },
  { key: 'doc_historia_clinica', label: 'Historia Clínica', cat: 'Salud' },
  { key: 'doc_vacunacion', label: 'Vacunación', cat: 'Salud' },
  { key: 'doc_obra_social', label: 'Carnet Obra Social', cat: 'Salud' },
  { key: 'doc_anamnesis', label: 'Anamnesis', cat: 'Salud' },
  { key: 'doc_permiso_fotos', label: 'Permiso Fotos', cat: 'Legal' },
  { key: 'doc_permiso_salidas', label: 'Salidas Terap.', cat: 'Legal' },
  { key: 'doc_permiso_transporte', label: 'Transporte', cat: 'Legal' },
  { key: 'doc_informe_evaluacion', label: 'Informe Inicial', cat: 'Clínico' },
  { key: 'doc_plan_tratamiento', label: 'Plan Tratamiento', cat: 'Clínico' }
];

const ReporteDocumentacion = () => {
  const [alumnosIncompletos, setAlumnosIncompletos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function validarYFiltar() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
        
        if (profile.rol !== 'director' && profile.rol !== 'administrador') {
          navigate('/dashboard');
          return;
        }
        setChecking(false);

        const { data, error } = await supabase.from('alumnos').select('*');
        if (error) throw error;

        // Auditoría basada en la referencia estática
        const conFaltantes = data.filter(alumno => 
          MAPA_DOCUMENTOS.some(doc => alumno[doc.key] === false)
        );
        
        setAlumnosIncompletos(conFaltantes);
      } catch (err) {
        console.error("Error en auditoría:", err);
      } finally {
        setLoading(false);
      }
    }
    validarYFiltar();
  }, [navigate]);

  if (checking || loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fcfaf7]">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={32} />
      <p className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Sincronizando Archivo v2.1...</p>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#fcfaf7] font-sans">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/reportes')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-orange-600 transition">
          <ArrowLeft size={16} /> Volver a Reportes
        </button>

        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileSearch size={24} className="text-orange-500" />
              <h1 className="text-4xl font-black text-[#1a3a5f] uppercase tracking-tighter leading-none">Auditoría de Legajos</h1>
            </div>
            <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              <AlertCircle size={14}/> {alumnosIncompletos.length} alumnos con pendientes
            </p>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Estado de Integridad</p>
             <p className="text-xl font-black text-[#1a3a5f] uppercase tracking-tight">Santa Catalina v2.1</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {alumnosIncompletos.map(a => (
            <div key={a.id} className="bg-white p-8 rounded-[2.5rem] border border-orange-100 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row justify-between gap-8 group">
              <div className="flex-grow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-orange-50 p-4 rounded-2xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors"><User size={24}/></div>
                  <div>
                    <h3 className="text-2xl font-black text-[#1a3a5f] uppercase tracking-tight">{a.apellido}, {a.nombre}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1"><Phone size={12}/> {a.tutor_celular}</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[8px]">DNI: {a.dni}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-6">
                  {MAPA_DOCUMENTOS.map(doc => !a[doc.key] && (
                    <span key={doc.key} className={`px-3 py-1 text-[8px] font-black uppercase rounded-lg border flex items-center gap-1 ${
                      doc.cat === 'Identidad' ? 'bg-red-50 text-red-600 border-red-100' :
                      doc.cat === 'Salud' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      doc.cat === 'Legal' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      'bg-purple-50 text-purple-600 border-purple-100'
                    }`}>
                      <AlertCircle size={10}/> {doc.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center gap-3">
                <button 
                  onClick={() => navigate(`/editar-alumno/${a.id}`)}
                  className="bg-[#1a3a5f] text-white px-8 py-4 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-[#84bd00] transition-all shadow-lg"
                >
                  Regularizar Legajo
                </button>
                <p className="text-[8px] font-bold text-center text-gray-400 uppercase tracking-widest italic">Responsable: {a.tutor_nombre}</p>
              </div>
            </div>
          ))}

          {alumnosIncompletos.length === 0 && (
            <div className="bg-green-50/50 p-24 rounded-[3rem] border-4 border-dashed border-green-100 text-center">
              <ShieldCheck size={64} className="mx-auto text-[#84bd00] mb-6" />
              <h2 className="text-3xl font-black text-[#1a3a5f] uppercase tracking-tighter">Archivo Blindado</h2>
              <p className="text-[11px] font-bold text-[#84bd00] uppercase mt-3 tracking-[0.3em]">Integridad Documental v2.1 Verificada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReporteDocumentacion;