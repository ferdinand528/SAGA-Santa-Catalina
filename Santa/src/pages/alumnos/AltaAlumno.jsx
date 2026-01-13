import React, { useState } from 'react';
import { supabase } from "../../lib/supabase";
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, UserPlus, Save, Activity, CreditCard, 
  Loader2, UserCheck, FileCheck, Receipt, Heart, Pill 
} from 'lucide-react';

const OBRAS_SOCIALES = [
  "IOSCOR", "PAMI", "OSDE", "CITY SALUD", "SWISS MEDICAL", 
  "GALENO", "SANCOR SALUD", "INCLUIR SALUD", "UNION PERSONAL", "IOSFA",
  "BOREAL", "POLICIA FEDERAL", "OSSACRA", "SPS", "ISSUNNE",
  "MEDICUS", "PARTICULAR", "OTRA"
].sort();

const AltaAlumno = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otraObraSocial, setOtraObraSocial] = useState("");
  
  const [form, setForm] = useState({
    // IDENTIDAD
    nombre: '', apellido: '', dni: '', fecha_nacimiento: '',
    // ADMINISTRACIÓN Y FACTURACIÓN
    obra_social: 'IOSCOR', 
    fecha_vencimiento_cud: '', 
    monto_cuota: '', 
    tipo_factura: 'B', 
    condicion_iva: 'Consumidor Final',
    // CLÍNICA
    patologia: '', medicacion: '',
    // TUTOR (APELLIDO Y NOMBRE)
    tutor_nombre: '', 
    nombre_tutor_facturacion: '', 
    dni_tutor: '', 
    tutor_celular: '', 
    tutor_domicilio: '',
    // CHECKLIST COMPLETO (14 ITEMS)
    doc_dni_alumno: false, doc_dni_tutor: false,
    doc_cuil_alumno: false, doc_cuil_tutor: false,
    doc_cud: false, doc_historia_clinica: false,
    doc_vacunacion: false, doc_obra_social: false, doc_anamnesis: false,
    doc_permiso_fotos: false, doc_permiso_salidas: false,
    doc_permiso_transporte: false, doc_informe_evaluacion: false,
    doc_plan_tratamiento: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const datosFinales = {
        ...form,
        obra_social: form.obra_social === 'OTRA' ? otraObraSocial : form.obra_social,
        activo: true 
      };
      const { error } = await supabase.from('alumnos').insert([datosFinales]);
      if (error) throw error;
      alert("Legajo Integral v3.1 registrado con éxito.");
      navigate('/legajos');
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const DocCheck = ({ label, campo, color = "text-gray-500" }) => (
    <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-green-50 transition-all group shadow-sm">
      <input 
        type="checkbox" 
        className="w-4 h-4 rounded text-[#84bd00] focus:ring-[#84bd00]"
        checked={form[campo]}
        onChange={(e) => setForm({...form, [campo]: e.target.checked})}
      />
      <span className={`text-[9px] font-black uppercase ${color} tracking-tighter`}>
        {label}
      </span>
    </label>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/legajos')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-[#84bd00] transition">
          <ArrowLeft size={16} /> Volver a la Nómina
        </button>

        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white overflow-hidden">
          
          <div className="bg-[#84bd00] p-8 text-white flex items-center gap-4">
            <UserPlus size={32} />
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Alta de Alumno - v3.1</h2>
              <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mt-2">Santa Catalina • Legajo Integral Completo</p>
            </div>
          </div>

          <div className="p-10 space-y-12">
            
            {/* 1. SECCIÓN IDENTIDAD */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-2">Datos del Alumno</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="APELLIDO" className="p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none" onChange={e => setForm({...form, apellido: e.target.value.toUpperCase()})} />
                  <input required placeholder="NOMBRE" className="p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none" onChange={e => setForm({...form, nombre: e.target.value.toUpperCase()})} />
                  <input required placeholder="DNI" className="p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none" onChange={e => setForm({...form, dni: e.target.value})} />
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-400 uppercase ml-2">F. Nacimiento</label>
                    <input type="date" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm text-gray-500 outline-none" onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* TUTOR: APELLIDO Y NOMBRE */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-[#1a3a5f] uppercase tracking-[0.2em] border-b pb-2 flex items-center gap-2">
                  <UserCheck size={14}/> Responsable Legal (Apellido y Nombre)
                </h3>
                <div className="space-y-3">
                  <input required placeholder="APELLIDO Y NOMBRE DEL TUTOR" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-[#1a3a5f]" onChange={e => setForm({...form, tutor_nombre: e.target.value.toUpperCase(), nombre_tutor_facturacion: e.target.value.toUpperCase()})} />
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="DNI/CUIL TUTOR" className="p-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl font-black text-sm outline-none" onChange={e => setForm({...form, dni_tutor: e.target.value})} />
                    <input placeholder="CELULAR" className="p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none" onChange={e => setForm({...form, tutor_celular: e.target.value})} />
                  </div>
                  <input placeholder="DOMICILIO" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none" onChange={e => setForm({...form, tutor_domicilio: e.target.value.toUpperCase()})} />
                </div>
              </div>
            </div>

            {/* 2. CHECKLIST DE DOCUMENTACIÓN (MANTENIDO ÍNTEGRO) */}
            <div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100 shadow-inner">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2">
                <FileCheck size={16} className="text-[#84bd00]"/>
                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Documentación y Consentimientos</h3>
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

            {/* 3. ADMINISTRACIÓN Y CLÍNICA */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="p-8 bg-blue-50/30 rounded-3xl border border-blue-100 space-y-4">
                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                  <Receipt size={14}/> Cobertura y Facturación
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <select className="w-full p-4 bg-white rounded-2xl font-bold text-sm border-none shadow-sm" value={form.obra_social} onChange={e => setForm({...form, obra_social: e.target.value})}>
                    {OBRAS_SOCIALES.map(os => <option key={os} value={os}>{os}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-red-500 uppercase ml-2">Venc. CUD</label>
                      <input type="date" required className="w-full p-4 bg-white rounded-2xl font-bold text-sm border border-red-100 text-gray-500" onChange={e => setForm({...form, fecha_vencimiento_cud: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-green-600 uppercase ml-2 font-mono italic">Cuota Mensual ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        className="w-full p-4 bg-white rounded-2xl font-black text-sm border-2 border-green-100 text-green-700 outline-none" 
                        onChange={e => setForm({...form, monto_cuota: e.target.value})} 
                      />
                    </div>
                  </div>
                  <select className="w-full p-4 bg-white rounded-2xl font-black text-[10px] text-blue-600 border border-blue-200 uppercase" onChange={e => setForm({...form, tipo_factura: e.target.value})}>
                    <option value="B">Factura B (Consumidor Final)</option>
                    <option value="A">Factura A (Resp. Inscripto)</option>
                    <option value="M">Factura M</option>
                    <option value="T">Factura T (Especial)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14}/> Resumen Clínico
                </h3>
                <textarea placeholder="Patología / Diagnóstico" rows="3" className="w-full p-4 bg-red-50/20 border border-red-50 rounded-2xl font-bold text-sm outline-none" onChange={e => setForm({...form, patologia: e.target.value})} />
                <textarea placeholder="Medicación y Esquema" rows="3" className="w-full p-4 bg-blue-50/20 border border-blue-50 rounded-2xl font-bold text-sm outline-none" onChange={e => setForm({...form, medicacion: e.target.value})} />
              </div>
            </div>

            <button disabled={loading} className="w-full bg-[#84bd00] text-white p-7 rounded-3xl font-black uppercase tracking-[0.3em] shadow-xl hover:bg-[#1a3a5f] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" /> : <Save size={22}/>}
              {loading ? "PROCESANDO..." : "REGISTRAR LEGAJO INTEGRAL v3.1"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AltaAlumno;