import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Save, Heart, Pill, 
  Activity, Calendar, CreditCard, DollarSign, 
  Loader2, Edit3, UserCheck, Phone, MapPin, FileCheck 
} from 'lucide-react';

const OBRAS_SOCIALES = [
  "IOSCOR", "PAMI", "OSDE", "IOMA", "SWISS MEDICAL", 
  "GALENO", "SANCOR SALUD", "PROFE / INCLUIR SALUD", 
  "MEDICUS", "PARTICULAR", "OTRA"
].sort();

const EditarAlumno = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [otraObraSocial, setOtraObraSocial] = useState("");
  
  const [form, setForm] = useState({
    nombre: '', apellido: '', dni: '', fecha_nacimiento: '',
    obra_social: '', fecha_vencimiento_cud: '', monto_inicial: '',
    patologia: '', medicacion: '',
    tutor_nombre: '', tutor_celular: '', tutor_domicilio: '',
    doc_dni_alumno: false, doc_dni_tutor: false,
    doc_cuil_alumno: false, doc_cuil_tutor: false,
    doc_cud: false, doc_historia_clinica: false,
    doc_vacunacion: false, doc_obra_social: false, doc_anamnesis: false,
    doc_permiso_fotos: false, doc_permiso_salidas: false,
    doc_permiso_transporte: false, doc_informe_evaluacion: false,
    doc_plan_tratamiento: false
  });

  useEffect(() => {
    async function cargarAlumno() {
      try {
        const { data, error } = await supabase.from('alumnos').select('*').eq('id', id).single();
        if (error) throw error;
        if (data) {
          setForm(data);
          // Si la obra social no está en la lista estándar, habilitamos "OTRA"
          if (!OBRAS_SOCIALES.includes(data.obra_social)) {
            setForm(prev => ({ ...prev, obra_social: 'OTRA' }));
            setOtraObraSocial(data.obra_social);
          }
        }
      } catch (err) { alert("Error al cargar datos: " + err.message); }
      finally { setLoading(false); }
    }
    cargarAlumno();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const datosFinales = {
        ...form,
        obra_social: form.obra_social === 'OTRA' ? otraObraSocial : form.obra_social
      };
      const { error } = await supabase.from('alumnos').update(datosFinales).eq('id', id);
      if (error) throw error;
      alert("Legajo actualizado correctamente.");
      navigate('/legajos');
    } catch (err) { alert("Error al actualizar: " + err.message); }
    finally { setUpdating(false); }
  };

  const DocCheck = ({ label, campo, color = "text-gray-500" }) => (
    <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-green-50 transition-all group shadow-sm">
      <input 
        type="checkbox" 
        className="w-4 h-4 rounded text-[#84bd00] focus:ring-[#84bd00]"
        checked={form[campo]}
        onChange={(e) => setForm({...form, [campo]: e.target.checked})}
      />
      <span className={`text-[9px] font-black uppercase ${color} group-hover:text-gray-800 tracking-tighter`}>
        {label}
      </span>
    </label>
  );

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#84bd00] uppercase text-xs">Cargando legajo para edición...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/legajos')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-[#84bd00] transition">
          <ArrowLeft size={16} /> Cancelar Edición
        </button>

        <form onSubmit={handleUpdate} className="bg-white/90 backdrop-blur-xl rounded-4xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="bg-[#1a3a5f] p-8 text-white flex items-center gap-4">
            <Edit size={32} />
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Editar Legajo - ver 1.8</h2>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-2">I.A.D. Santa Catalina • Actualización Integral</p>
            </div>
          </div>

          <div className="p-10 space-y-12">
            {/* 1. IDENTIDAD: ALUMNO Y TUTOR */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-2">Identidad del Alumno</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Nombre" className="p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                  <input required placeholder="Apellido" className="p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} />
                  <input required placeholder="DNI" className="p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none" value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} />
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-400 uppercase ml-2 text-xs">F. Nacimiento</label>
                    <input type="date" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm text-gray-500" value={form.fecha_nacimiento} onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-2 flex items-center gap-2">
                  <UserCheck size={14}/> Responsable Legal
                </h3>
                <input required placeholder="Nombre del Tutor" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none" value={form.tutor_nombre} onChange={e => setForm({...form, tutor_nombre: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Celular" className="p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none" value={form.tutor_celular} onChange={e => setForm({...form, tutor_celular: e.target.value})} />
                  <input required placeholder="Domicilio" className="p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none" value={form.tutor_domicilio} onChange={e => setForm({...form, tutor_domicilio: e.target.value})} />
                </div>
              </div>
            </div>

            {/* 2. CHECKLIST DE DOCUMENTACIÓN */}
            <div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100 shadow-inner">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2">
                <FileCheck size={16} className="text-[#84bd00]"/>
                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Control de Documentación Física</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <DocCheck label="DNI Alumno" campo="doc_dni_alumno" />
                <DocCheck label="DNI Tutor" campo="doc_dni_tutor" />
                <DocCheck label="CUIL Alumno" campo="doc_cuil_alumno" />
                <DocCheck label="CUIL Tutor" campo="doc_cuil_tutor" />
                <DocCheck label="Certificado CUD" campo="doc_cud" color="text-blue-600" />
                <DocCheck label="Historia Clínica" campo="doc_historia_clinica" color="text-blue-600" />
                <DocCheck label="Carnet Vacunación" campo="doc_vacunacion" color="text-blue-600" />
                <DocCheck label="Carnet Obra Social" campo="doc_obra_social" color="text-blue-600" />
                <DocCheck label="Anamnesis" campo="doc_anamnesis" color="text-blue-600" />
                <DocCheck label="Permiso Fotos/Videos" campo="doc_permiso_fotos" color="text-orange-600" />
                <DocCheck label="Salidas Terapéuticas" campo="doc_permiso_salidas" color="text-orange-600" />
                <DocCheck label="Permiso Transporte" campo="doc_permiso_transporte" color="text-orange-600" />
                <DocCheck label="Informe Evaluación" campo="doc_informe_evaluacion" color="text-purple-600" />
                <DocCheck label="Plan de Tratamiento" campo="doc_plan_tratamiento" color="text-purple-600" />
              </div>
            </div>

            {/* 3. ADMINISTRACIÓN Y SALUD */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="p-8 bg-blue-50/30 rounded-3xl border border-blue-100 space-y-4">
                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard size={14}/> Convenio y Cobertura
                </h3>
                <select className="w-full p-4 bg-white rounded-2xl font-bold text-sm border border-blue-50 outline-none" value={form.obra_social} onChange={e => setForm({...form, obra_social: e.target.value})}>
                  {OBRAS_SOCIALES.map(os => <option key={os} value={os}>{os}</option>)}
                </select>
                {form.obra_social === 'OTRA' && (
                  <input required placeholder="Especificar Obra Social" className="p-4 bg-white rounded-2xl font-bold text-sm border-2 border-[#84bd00]/30 outline-none" value={otraObraSocial} onChange={e => setOtraObraSocial(e.target.value.toUpperCase())} />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-red-500 uppercase ml-2">Venc. CUD</label>
                    <input type="date" required className="w-full p-4 bg-white rounded-2xl font-bold text-sm text-gray-500 border border-red-100" value={form.fecha_vencimiento_cud} onChange={e => setForm({...form, fecha_vencimiento_cud: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-green-600 uppercase ml-2">Monto Inicial ($)</label>
                    <input type="number" className="w-full p-4 bg-white rounded-2xl font-bold text-sm border border-green-100 outline-none" value={form.monto_inicial} onChange={e => setForm({...form, monto_inicial: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2"><Activity size={14}/> Ficha de Salud</h3>
                <textarea placeholder="Patología" rows="3" className="w-full p-4 bg-red-50/20 border border-red-50 rounded-2xl font-bold text-sm outline-none" value={form.patologia} onChange={e => setForm({...form, patologia: e.target.value})} />
                <textarea placeholder="Medicación" rows="3" className="w-full p-4 bg-blue-50/20 border border-blue-50 rounded-2xl font-bold text-sm outline-none" value={form.medicacion} onChange={e => setForm({...form, medicacion: e.target.value})} />
              </div>
            </div>

            <button disabled={updating} className="w-full bg-[#1a3a5f] text-white p-7 rounded-3xl font-black uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
              {updating ? <Loader2 className="animate-spin" /> : <Save size={22}/>}
              {updating ? "GUARDANDO..." : "ACTUALIZAR LEGAJO v1.8"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarAlumno;