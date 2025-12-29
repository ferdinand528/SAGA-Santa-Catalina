import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Plus, User, Trash2, Filter } from 'lucide-react';

const Calendario = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [personales, setPersonales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  
  const [nuevoTurno, setNuevoTurno] = useState({ alumno_id: '', titulo: '', hora: '', profesional: '' });

  useEffect(() => {
    initCalendario();
  }, [fechaSeleccionada]);

  async function initCalendario() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: p } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
    setPerfil(p);
    
    fetchAlumnos();
    fetchPersonales();
    fetchTurnos(p); // Le pasamos el perfil para filtrar
  }

  async function fetchAlumnos() {
    const { data } = await supabase.from('alumnos').select('id, nombre, apellido').order('apellido');
    setAlumnos(data || []);
  }

  async function fetchPersonales() {
    const { data } = await supabase.from('perfiles').select('nombre_completo').order('nombre_completo');
    setPersonales(data || []);
  }

  async function fetchTurnos(userProfile) {
    setLoading(true);
    let query = supabase
      .from('turnos')
      .select('*, alumnos(nombre, apellido)')
      .eq('fecha', fechaSeleccionada);

    // LÓGICA DE INGENIERÍA: Si no es director, solo ve sus propios turnos
    if (userProfile?.rol !== 'director') {
      query = query.eq('profesional', userProfile.nombre_completo);
    }

    const { data } = await query.order('hora');
    setTurnos(data || []);
    setLoading(false);
  }

  const agendarTurno = async (e) => {
    e.preventDefault();
    await supabase.from('turnos').insert([{ ...nuevoTurno, fecha: fechaSeleccionada }]);
    setNuevoTurno({ alumno_id: '', titulo: '', hora: '', profesional: '' });
    fetchTurnos(perfil);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-2 font-bold">
              <ArrowLeft size={20} /> VOLVER
            </button>
            <h1 className="text-3xl font-black text-blue-900 flex items-center gap-3">
              <CalendarIcon size={32} /> {perfil?.rol === 'director' ? 'Agenda Institucional' : 'Mi Agenda del Día'}
            </h1>
          </div>
          <input 
            type="date" 
            className="p-3 border-2 border-blue-100 rounded-2xl text-blue-900 font-bold outline-none"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
          />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario (Opcional para profesionales, obligatorio para director) */}
          <div className="lg:col-span-1">
            <form onSubmit={agendarTurno} className="bg-white p-6 rounded-3xl shadow-xl border border-blue-50">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2"> <Plus size={20}/> Nuevo Turno </h3>
              <div className="space-y-4">
                <select required className="w-full p-4 bg-gray-50 rounded-xl outline-none text-sm" value={nuevoTurno.alumno_id} onChange={e => setNuevoTurno({...nuevoTurno, alumno_id: e.target.value})}>
                  <option value="">Alumno...</option>
                  {alumnos.map(a => <option key={a.id} value={a.id}>{a.apellido}, {a.nombre}</option>)}
                </select>
                <input type="text" required placeholder="Práctica" className="w-full p-4 bg-gray-50 rounded-xl outline-none text-sm" value={nuevoTurno.titulo} onChange={e => setNuevoTurno({...nuevoTurno, titulo: e.target.value})} />
                <input type="time" required className="w-full p-4 bg-gray-50 rounded-xl outline-none text-sm" value={nuevoTurno.hora} onChange={e => setNuevoTurno({...nuevoTurno, hora: e.target.value})} />
                <select required className="w-full p-4 bg-gray-50 rounded-xl outline-none text-sm" value={nuevoTurno.profesional} onChange={e => setNuevoTurno({...nuevoTurno, profesional: e.target.value})}>
                  <option value="">Profesional...</option>
                  {personales.map(p => <option key={p.nombre_completo} value={p.nombre_completo}>{p.nombre_completo}</option>)}
                </select>
                <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg transition-all">Agendar</button>
              </div>
            </form>
          </div>

          {/* Lista de Turnos */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? <p className="text-center font-bold text-blue-600 p-10">Cargando agenda...</p> : 
             turnos.length === 0 ? <p className="text-center text-gray-400 p-10 italic">No hay turnos para mostrar.</p> :
             turnos.map(t => (
               <div key={t.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6">
                 <div className="bg-blue-50 p-4 rounded-2xl text-center min-w-[80px]">
                   <span className="block text-blue-600 font-black text-xl">{t.hora.substring(0,5)}</span>
                 </div>
                 <div>
                   <h4 className="font-bold text-gray-800 uppercase">{t.alumnos?.apellido}, {t.alumnos?.nombre}</h4>
                   <p className="text-blue-600 text-xs font-bold uppercase">{t.titulo}</p>
                   {perfil?.rol === 'director' && <p className="text-gray-400 text-[10px] mt-1 italic">Prof: {t.profesional}</p>}
                 </div>
               </div>
             ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendario;