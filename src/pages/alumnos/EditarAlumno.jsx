import React, { useEffect, useState } from 'react';
import { supabase } from "../../lib/supabase";
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Activity, CreditCard, 
  Loader2, UserCheck, FileCheck, Receipt, Edit3 
} from 'lucide-react'; // <--- CORREGIDO: "lucide-react"

const OBRAS_SOCIALES = [
  "IOSCOR", "PAMI", "OSDE", "CITY SALUD", "SWISS MEDICAL", 
  "GALENO", "SANCOR SALUD", "INCLUIR SALUD", "UNION PERSONAL", "IOSFA",
  "BOREAL", "POLICIA FEDERAL", "OSSACRA", "SPS", "ISSUNNE",
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
    obra_social: '', fecha_vencimiento_cud: '', monto_cuota: '', 
    tipo_factura: 'B', condicion_iva: 'Consumidor Final',
    patologia: '', medicacion: '',
    tutor_nombre: '', nombre_tutor_facturacion: '', dni_tutor: '', 
    tutor_celular: '', tutor_domicilio: '',
    doc_dni_alumno: false, doc_dni_tutor: false, doc_cuil_alumno: false, doc_cuil_tutor: false,
    doc_cud: false, doc_historia_clinica: false, doc_vacunacion: false, doc_obra_social: false, 
    doc_anamnesis: false, doc_permiso_fotos: false, doc_permiso_salidas: false,
    doc_permiso_transporte: false, doc_informe_evaluacion: false, doc_plan_tratamiento: false
  });

  useEffect(() => {
    const fetchAlumno = async () => {
      try {
        const { data, error } = await supabase.from('alumnos').select('*').eq('id', id).single();
        if (error) throw error;
        if (data) {
          setForm(data);
          if (!OBRAS_SOCIALES.includes(data.obra_social)) {
            setOtraObraSocial(data.obra_social);
            setForm(prev => ({ ...prev, obra_social: 'OTRA' }));
          }
        }
      } catch (err) {
        alert("Error al recuperar datos: " + err.message);
        navigate('/legajos');
      } finally {
        setLoading(false);
      }
    };
    fetchAlumno();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const datosFinales = {
        ...form,
        obra_social: form.obra_social === 'OTRA' ? otraObraSocial : form.obra_social
      };
      const { error } = await supabase.from('alumnos').update(datosFinales).eq('id', id);
      if (error) throw error;
      alert("Legajo Integral v3.1 actualizado correctamente.");
      navigate('/legajos');
    } catch (err) {
      alert("Error en la actualización: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const DocCheck = ({ label, campo, color = "text-gray-500" }) => (
    <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-blue-50 transition-all group shadow-sm">
      <input 
        type="checkbox" 
        className="w-4 h-4 rounded text-[#84bd00] focus:ring-[#84bd00]"
        checked={form[campo] || false}
        onChange={(e) => setForm({...form, [campo]: e.target.checked})}
      />
      <span className={`text-[9px] font-black uppercase ${color} tracking-tighter`}>{label}</span>
    </label>
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-[#1a3a5f] uppercase tracking-widest animate-pulse">
      <Loader2 className="animate-spin mr-3 text-[#84bd00]" /> Sincronizando Legajo v3.1...
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/legajos')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-[#84bd00] transition bg-white px-4 py-2 rounded-full shadow-sm w-fit">
          <ArrowLeft size={16} /> Cancelar Edición
        </button>

        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white overflow-hidden">
          <div className="bg-[#1a3a5f] p-8 text-white flex items-center gap-4">
            <Edit3 size={32} />
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Editar Legajo - v3.1</h2>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-2">Alumno: {form.apellido}, {form.nombre}</p>
            </div>
          </div>

          <div className="p-10 space-y-12">
            
            {/* 1. IDENTIDAD Y TUTOR */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-2">Datos del Alumno</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input required value={form.apellido} placeholder="APELLIDO" className="p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-[#84bd00]" onChange={e => setForm({...form, apellido: e.target.value.toUpperCase()})} />
                  <input required value={form.nombre} placeholder="NOMBRE" className="p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-[#84bd00]" onChange={e => setForm({...form, nombre: e.target.value.toUpperCase()})} />
                  <input required value={form.dni} placeholder="DNI" className="p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none" onChange={e => setForm({...form, dni: e.target.value})} />
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-400 uppercase ml-2">F. Nacimiento</label>
                    <input type="date" value={form.fecha_nacimiento} required className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm text-gray-500" onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-[#1a3a5f] uppercase tracking-[0.2em] border-b pb-2 flex items-center gap-2">
                  <UserCheck size={14}/> Responsable Legal (Apellido y Nombre)
                </h3>
                <div className="space-y-3">
                  <div className="relative">
                    <input required value={form.nombre_tutor_facturacion} placeholder="APELLIDO Y NOMBRE DEL TUTOR" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-[#1a3a5f]" onChange={e => setForm({...form, tutor_nombre: e.target.value.toUpperCase(), nombre_tutor_facturacion: e.target.value.toUpperCase()})} />
                    <span className="absolute -top-2 right-4 bg-[#1a3a5f] text-white text-[7px] font-black px-2 py-0.5 rounded uppercase">Ej: VALLEJOS LAUREANO RAMON</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input required value={form.dni_tutor} placeholder="DNI/CUIL TUTOR" className="p-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl font-black text-sm outline-none" onChange={e => setForm({...form, dni_tutor: e.target.value})} />
                    <input value={form.tutor_celular} placeholder="CELULAR" className="p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none" onChange={e => setForm({...form, tutor_celular: e.target.value})} />
                  </div>
                  <input value={form.tutor_domicilio} placeholder="DOMICILIO" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none" onChange={e => setForm({...form, tutor_domicilio: e.target.value.toUpperCase()})} />
                </div>
              </div>
            </div>

            {/* 2. CONTROL DE DOCUMENTACIÓN FÍSICA (14 PUNTOS) */}
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
                <DocCheck label="Inf. Evaluación" campo="doc_informe_evaluacion" color="text-purple-600" />
                <DocCheck label="Plan Tratamiento" campo="doc_plan_tratamiento" color="text-purple-600" />
              </div>
            </div>

            {/* 3. COBERTURA Y SALUD */}
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
                      <input type="date" value={form.fecha_vencimiento_cud} required className="w-full p-4 bg-white rounded-2xl font-bold text-sm border border-red-100 text-gray-500" onChange={e => setForm({...form, fecha_vencimiento_cud: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-green-600 uppercase ml-2 font-mono">Cuota Mensual ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={form.monto_cuota}
                        placeholder="0.00" 
                        className="w-full p-4 bg-white rounded-2xl font-black text-sm border-2 border-green-100 text-green-700 outline-none" 
                        onChange={e => setForm({...form, monto_cuota: e.target.value})} 
                      />
                    </div>
                  </div>
                  <select className="w-full p-4 bg-white rounded-2xl font-black text-[10px] text-blue-600 border border-blue-200 uppercase" value={form.tipo_factura} onChange={e => setForm({...form, tipo_factura: e.target.value})}>
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
                <textarea value={form.patologia} placeholder="Patología" rows="3" className="w-full p-4 bg-red-50/20 border border-red-50 rounded-2xl font-bold text-sm outline-none" onChange={e => setForm({...form, patologia: e.target.value})} />
                <textarea value={form.medicacion} placeholder="Medicación" rows="3" className="w-full p-4 bg-blue-50/20 border border-blue-50 rounded-2xl font-bold text-sm outline-none" onChange={e => setForm({...form, medicacion: e.target.value})} />
              </div>
            </div>

            <button disabled={updating} className="w-full bg-[#1a3a5f] text-white p-7 rounded-3xl font-black uppercase tracking-[0.3em] shadow-xl hover:bg-[#84bd00] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {updating ? <Loader2 className="animate-spin" /> : <Save size={22}/>}
              {updating ? "GUARDANDO CAMBIOS..." : "ACTUALIZAR LEGAJO v3.1"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarAlumno;