import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Save } from 'lucide-react';

const PROFESIONES = ["Psicología", "Psicopedagogía", "Fonoaudiología", "Kinesiología", "Terapia Ocupacional", "Administración"].sort();

const RegistroProfesional = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: 'andrea1.', nombre_completo: '', profesion: '', fecha_nacimiento: '', celular: '', fecha_alta: new Date().toISOString().split('T')[0], rol: 'profesional' });

  const handleNombreChange = (e) => {
    const nombre = e.target.value;
    const emailGenerado = nombre.toLowerCase().replace(/\s+/g, '') + '@santacatalina.com';
    setForm({ ...form, nombre_completo: nombre, email: emailGenerado });
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password });
      if (authError) throw authError;
      if (user) {
        const { error: profileError } = await supabase.from('perfiles').insert([{ id: user.id, nombre_completo: form.nombre_completo, rol: form.rol, profesion: form.profesion, celular: form.celular, fecha_nacimiento: form.fecha_nacimiento, fecha_alta: form.fecha_alta }]);
        if (profileError) throw profileError;
        alert("¡Registro Exitoso! El profesional ya figura en la nómina.");
        navigate('/personal');
      }
    } catch (error) { alert("Error: " + error.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/personal')} className="flex items-center gap-2 text-gray-500 mb-8 font-bold uppercase text-xs transition hover:text-blue-600"><ArrowLeft size={16} /> Volver</button>
        <form onSubmit={handleRegistro} className="bg-white rounded-[2.5rem] shadow-xl border border-blue-50 overflow-hidden p-10 space-y-8">
          <div className="bg-orange-500 -m-10 p-8 text-white mb-10 flex items-center gap-4 shadow-inner"><UserPlus size={40} /><h2 className="text-2xl font-black uppercase tracking-tighter">Nuevo Integrante</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            <div className="space-y-6">
              <input type="text" required placeholder="Nombre y Apellido" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-300 transition-all" value={form.nombre_completo} onChange={handleNombreChange} />
              <select required className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-orange-300" onChange={e => setForm({...form, profesion: e.target.value})}>
                <option value="">Profesión...</option>
                {PROFESIONES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input type="email" required className="w-full p-4 bg-blue-50 text-blue-900 border-none rounded-2xl outline-none font-bold" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="space-y-6">
              <input type="tel" required placeholder="Celular" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-300" onChange={e => setForm({...form, celular: e.target.value})} />
              <div><label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Nacimiento</label><input type="date" required className="w-full p-4 bg-gray-50 rounded-2xl" onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} /></div>
              <div><label className="text-[10px] font-black text-orange-600 uppercase ml-2 tracking-widest">Fecha de Alta</label><input type="date" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-orange-600" value={form.fecha_alta} onChange={e => setForm({...form, fecha_alta: e.target.value})} /></div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-2xl text-orange-600 font-bold text-center border border-orange-100 uppercase text-xs tracking-widest shadow-sm">Clave por defecto: andrea1.</div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-5 rounded-[2rem] font-black uppercase shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"><Save size={20}/> {loading ? "PROCESANDO..." : "CONFIRMAR ALTA"}</button>
        </form>
      </div>
    </div>
  );
};

export default RegistroProfesional;