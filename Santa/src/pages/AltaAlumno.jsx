import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Save } from 'lucide-react';

const OBRAS_SOCIALES = [
  "PARTICULAR", "PAMI", "IOSCOR", "INCLUIR SALUD", 
  "OSDE", "SWISS MEDICAL", "GALENO", "OSECAC", "IOSFA", "OSPRERA", 
  "OSPEDYC", "SANCOR SALUD", "MEDIFE", "UNION PERSONAL", "ISSUNNE", "POLICIA FEDERAL", 
  "OSACRA", "SPS", "OTRA"
];

const AltaAlumno = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    apellido: '', nombre: '', dni: '', fecha_nacimiento: '',
    obra_social: 'PARTICULAR', nro_afiliado: '', cuota_monto_mensual: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('alumnos').insert([form]);
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Alumno registrado con éxito");
      navigate('/legajos');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/legajos')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-blue-600 transition">
          <ArrowLeft size={16} /> Volver a Nómina
        </button>

        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/50 overflow-hidden">
          <div className="bg-blue-600 p-8 text-white flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><UserPlus size={32} /></div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Nuevo Legajo</h2>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mt-1">S.A.G.A ver 1.0 • Registro Inicial</p>
            </div>
          </div>

          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <input required placeholder="Apellido" className="p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" onChange={e => setForm({...form, apellido: e.target.value})} />
            <input required placeholder="Nombre" className="p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" onChange={e => setForm({...form, nombre: e.target.value})} />
            <input required placeholder="DNI (Sin puntos)" className="p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" onChange={e => setForm({...form, dni: e.target.value})} />
            <input type="date" className="p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm text-gray-400" onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} />
            
            {/* SELECT DE OBRA SOCIAL */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Obra Social</label>
              <select 
                required
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm text-blue-900 border-none appearance-none"
                value={form.obra_social}
                onChange={e => setForm({...form, obra_social: e.target.value})}
              >
                {OBRAS_SOCIALES.map(os => <option key={os} value={os}>{os}</option>)}
              </select>
            </div>

            <input type="number" placeholder="Monto Cuota Mensual $" className="p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" onChange={e => setForm({...form, cuota_monto_mensual: e.target.value})} />
            
            <button disabled={loading} className="md:col-span-2 bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition flex items-center justify-center gap-3 mt-4">
              <Save size={20}/> {loading ? "GUARDANDO..." : "CREAR ALUMNO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AltaAlumno;