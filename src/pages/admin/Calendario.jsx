import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar as CalendarIcon, Clock, 
  Plus, Trash2, CheckCircle2, Loader2 
} from 'lucide-react';

const Calendario = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [personales, setPersonales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  
  const [nuevoTurno, setNuevoTurno] = useState({ 
    alumno_id: '', 
    titulo: '', 
    hora: '', 
    profesional: '' 
  });

  // 1. MEMORIZACIÓN DE FUNCIONES (Hoisting y Concordancia)
  const fetchTurnos = useCallback(async (userProfile) => {
    setLoading(true);
    try {
      let query = supabase
        .from('turnos')
        .select('*, alumnos(nombre, apellido)')
        .eq('fecha', fechaSeleccionada);

      if (userProfile?.rol !== 'director') {
        query = query.eq('profesional', userProfile.nombre_completo);
      }

      const { data } = await query.order('hora');
      setTurnos(data || []);
    } finally {
      setLoading(false);
    }
  }, [fechaSeleccionada]);

  const fetchAlumnos = useCallback(async () => {
    const { data } = await supabase.from('alumnos').select('id, nombre, apellido').order('apellido');
    setAlumnos(data || []);
  }, []);

  const fetchPersonales = useCallback(async () => {
    const { data } = await supabase.from('perfiles').select('nombre_completo').order('nombre_completo');
    setPersonales(data || []);
  }, []);

  const initCalendario = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: p } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
    setPerfil(p);
    
    if (p && p.rol !== 'director') {
      // CORRECCIÓN: _prev para indicar argumento no usado
      setNuevoTurno(_prev => ({ ..._prev, profesional: p.nombre_completo }));
    }

    await Promise.all([fetchAlumnos(), fetchPersonales(), fetchTurnos(p)]);
  }, [fetchAlumnos, fetchPersonales, fetchTurnos]);

  // 2. EFECTO DE CARGA
  useEffect(() => {
    initCalendario();
  }, [initCalendario]);

  const agendarTurno = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('turnos').insert([{ ...nuevoTurno, fecha: fechaSeleccionada }]);
    if (!error) {
      setNuevoTurno({ 
        alumno_id: '', titulo: '', hora: '', 
        profesional: perfil?.rol === 'director' ? '' : perfil?.nombre_completo 
      });
      fetchTurnos(perfil);
    }
  };

  const eliminarTurno = async (id) => {
    if (!window.confirm("¿Eliminar este turno?")) return;
    await supabase.from('turnos').delete().eq('id', id);
    fetchTurnos(perfil);
  };

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent font-sans text-gray-800 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-[#84bd00] transition mb-4">
              <ArrowLeft size={18} /> Volver al Dashboard
            </button>
            <h1 className="text-4xl font-black text-[#1a3a5f] tracking-tighter uppercase leading-none">
              Agenda <span className="text-[#84bd00]">Institucional</span>
            </h1>
          </div>
          <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 px-6 py-3">
             <CalendarIcon className="text-[#84bd00]" size={20}/>
             <input type="date" className="bg-transparent font-black uppercase text-xs outline-none text-gray-600 cursor-pointer" value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white sticky top-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-2"><Plus size={18} className="text-[#84bd00]"/> Nuevo Registro</h3>
              <form onSubmit={agendarTurno} className="space-y-4">
                <select required className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs font-bold" value={nuevoTurno.alumno_id} onChange={e => setNuevoTurno({...nuevoTurno, alumno_id: e.target.value})}>
                  <option value="">Alumno...</option>
                  {alumnos.map(a => <option key={a.id} value={a.id}>{a.apellido}, {a.nombre}</option>)}
                </select>
                <input type="text" required placeholder="Práctica" className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs font-bold" value={nuevoTurno.titulo} onChange={e => setNuevoTurno({...nuevoTurno, titulo: e.target.value})} />
                <input type="time" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs font-bold" value={nuevoTurno.hora} onChange={e => setNuevoTurno({...nuevoTurno, hora: e.target.value})} />
                <select required disabled={perfil?.rol !== 'director'} className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs font-bold disabled:opacity-50" value={nuevoTurno.profesional} onChange={e => setNuevoTurno({...nuevoTurno, profesional: e.target.value})}>
                  <option value="">Profesional...</option>
                  {personales.map(p => <option key={p.nombre_completo} value={p.nombre_completo}>{p.nombre_completo}</option>)}
                </select>
                <button type="submit" className="w-full bg-[#84bd00] text-white p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-[1.02] transition-all">Confirmar Turno</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            {loading ? <div className="p-20 text-center animate-pulse font-black text-[#84bd00] uppercase text-xs">Sincronizando...</div> : turnos.length === 0 ? <div className="bg-white/40 border-2 border-dashed border-gray-200 p-20 rounded-[3rem] text-center text-gray-300 font-black uppercase text-xs">Sin actividades</div> : turnos.map(t => (
                <div key={t.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-sm border border-white flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex items-center gap-6">
                    <div className="bg-gray-50 p-4 rounded-3xl text-center min-w-[90px] shadow-inner">
                      <span className="block text-[#84bd00] font-black text-xl leading-none">{t.hora.substring(0,5)}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-[#1a3a5f] uppercase text-lg tracking-tighter leading-none mb-1">{t.alumnos?.apellido}, {t.alumnos?.nombre}</h4>
                      <p className="text-[#84bd00] text-[9px] font-black uppercase tracking-widest italic">{t.titulo}</p>
                    </div>
                  </div>
                  {perfil?.rol === 'director' && <button onClick={() => eliminarTurno(t.id)} className="p-3 text-gray-200 hover:text-red-500 transition-all"><Trash2 size={18} /></button>}
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