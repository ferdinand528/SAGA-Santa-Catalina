import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Search } from 'lucide-react';

// Lista predefinida de las obras sociales más comunes en Argentina
const OBRAS_SOCIALES_ARG = [
  "IOMA", "PAMI", "OSDE", "Swiss Medical", "Galeno", "Medicus", 
  "Omint", "Sancor Salud", "OSECAC", "OSDEPYM", "OSPEDYC", 
  "Unión Personal", "Accord Salud", "IAPOS", "IOSCOR", 
  "Incluir Salud", "Obra Social Ferroviaria", "Particular/Ninguna"
].sort();

const AltaAlumno = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    obra_social: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('alumnos')
      .insert([form]);

    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      alert("¡Alumno registrado con éxito!");
      navigate('/legajos'); 
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate('/legajos')} 
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft size={20} /> Volver a Legajos
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          <div className="bg-blue-600 p-6 text-white flex items-center gap-4">
            <User size={30} />
            <div>
              <h2 className="text-2xl font-bold">Nuevo Legajo</h2>
              <p className="text-blue-100 opacity-80">Complete los datos básicos del alumno</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                <input 
                  type="text" required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={e => setForm({...form, nombre: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido</label>
                <input 
                  type="text" required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={e => setForm({...form, apellido: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">DNI</label>
              <input 
                type="text" required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={e => setForm({...form, dni: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Nacimiento</label>
              <input 
                type="date" required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={e => setForm({...form, fecha_nacimiento: e.target.value})}
              />
            </div>

            {/* SECCIÓN MODIFICADA: LISTA DESPLEGABLE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Obra Social</label>
              <select 
                required 
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={form.obra_social}
                onChange={e => setForm({...form, obra_social: e.target.value})}
              >
                <option value="">Seleccione una obra social...</option>
                {OBRAS_SOCIALES_ARG.map((os) => (
                  <option key={os} value={os}>{os}</option>
                ))}
                <option value="Otra">Otra (No figura en la lista)</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save size={22} />
              {loading ? "Guardando..." : "Registrar Alumno"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AltaAlumno;