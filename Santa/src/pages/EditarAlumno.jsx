import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, User, Heart, CreditCard, Landmark, Pill } from 'lucide-react';

const OBRAS_SOCIALES = [
  "Particular", "IOSCOR", "PAMI", "OSDE", "Swiss Medical", 
  "Galeno", "Sancor Salud", "Osecac", "Jerárquicos Salud", 
  "Ospe", "Iose", "Incluir Salud", "Otras"
].sort();

const EditarAlumno = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nombre: '', apellido: '', dni: '', obra_social: '', nro_afiliado: '', cuota_monto_mensual: 0,
    diagnostico: '', vencimiento_cud: '', medicamentos: ''
  });

  useEffect(() => {
    async function fetchDatos() {
      const { data, error } = await supabase.from('alumnos').select('*, datos_medicos(*)').eq('id', id).single();
      if (data) {
        setForm({
          nombre: data.nombre, apellido: data.apellido, dni: data.dni,
          obra_social: data.obra_social || '', 
          nro_afiliado: data.nro_afiliado || '',
          cuota_monto_mensual: data.cuota_monto_mensual || 0,
          diagnostico: data.datos_medicos?.diagnostico || '',
          vencimiento_cud: data.datos_medicos?.vencimiento_cud || '',
          medicamentos: data.datos_medicos?.medicamentos || ''
        });
      }
      setLoading(false);
    }
    fetchDatos();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Actualizar datos personales
      await supabase.from('alumnos').update({
        nombre: form.nombre, apellido: form.apellido, dni: form.dni,
        obra_social: form.obra_social, nro_afiliado: form.nro_afiliado,
        cuota_monto_mensual: form.cuota_monto_mensual
      }).eq('id', id);

      // Actualizar datos médicos incluyendo la nueva medicación
      await supabase.from('datos_medicos').update({
        diagnostico: form.diagnostico, 
        vencimiento_cud: form.vencimiento_cud,
        medicamentos: form.medicamentos
      }).eq('alumno_id', id);

      alert("Legajo de Santa Catalina actualizado");
      navigate(`/legajo/${id}`);
    } catch (err) { 
      alert("Error: " + err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse uppercase">Sincronizando datos...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(`/legajo/${id}`)} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] tracking-widest mb-8 hover:text-blue-600 transition">
          <ArrowLeft size={16} /> Volver a la Ficha
        </button>

        <form onSubmit={handleUpdate} className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] shadow-xl border border-blue-50 overflow-hidden">
          <div className="bg-blue-600 p-8 text-white flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><User size={32} /></div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Modificar Legajo</h2>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mt-2">Santa Catalina • Gestión de Alumnos</p>
            </div>
          </div>

          <div className="p-10 space-y-10">
            {/* IDENTIDAD */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 text-blue-600 font-black uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2"><User size={14}/> Datos de Identidad</div>
              <input type="text" placeholder="Nombre" className="p-4 bg-gray-50/50 rounded-2xl outline-none border border-gray-100 font-bold" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              <input type="text" placeholder="Apellido" className="p-4 bg-gray-50/50 rounded-2xl outline-none border border-gray-100 font-bold" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} />
              <input type="text" placeholder="DNI" className="p-4 bg-gray-50/50 rounded-2xl outline-none border border-gray-100 font-bold" value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} />
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4">
                <CreditCard className="text-blue-600" />
                <div className="flex-grow">
                  <p className="text-[9px] font-black text-blue-400 uppercase">Cuota Mensual ($)</p>
                  <input type="number" className="bg-transparent font-black text-blue-900 outline-none w-full text-xl" value={form.cuota_monto_mensual} onChange={e => setForm({...form, cuota_monto_mensual: e.target.value})} />
                </div>
              </div>
            </section>

            {/* COBERTURA */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 text-orange-600 font-black uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2"><Landmark size={14}/> Cobertura Médica</div>
              <select className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 font-bold text-blue-900" value={form.obra_social} onChange={e => setForm({...form, obra_social: e.target.value})}>
                <option value="">Seleccionar Obra Social...</option>
                {OBRAS_SOCIALES.map(os => <option key={os} value={os}>{os}</option>)}
              </select>
              <input type="text" placeholder="Nro de Afiliado" className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 font-bold" value={form.nro_afiliado} onChange={e => setForm({...form, nro_afiliado: e.target.value})} />
            </section>

            {/* FICHA MÉDICA Y MEDICACIÓN */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 text-red-500 font-black uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2"><Heart size={14}/> Información Clínica</div>
              <input type="text" placeholder="Diagnóstico Actual" className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 font-bold" value={form.diagnostico} onChange={e => setForm({...form, diagnostico: e.target.value})} />
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Vencimiento CUD</label>
                <input type="date" className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 font-bold" value={form.vencimiento_cud} onChange={e => setForm({...form, vencimiento_cud: e.target.value})} />
              </div>
              
              {/* NUEVO CAMPO DE MEDICACIÓN */}
              <div className="col-span-2 space-y-2">
                <div className="flex items-center gap-2 text-red-500 font-black uppercase text-[10px] tracking-widest">
                  <Pill size={14}/> Medicación y Tratamiento
                </div>
                <textarea 
                  placeholder="Detallar medicamentos, dosis y horarios..." 
                  className="w-full p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 outline-none focus:ring-2 focus:ring-red-100 font-bold text-sm min-h-[120px]"
                  value={form.medicamentos} 
                  onChange={e => setForm({...form, medicamentos: e.target.value})} 
                />
              </div>
            </section>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
              <Save size={20}/> {loading ? "GUARDANDO..." : "ACTUALIZAR LEGAJO COMPLETO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarAlumno;