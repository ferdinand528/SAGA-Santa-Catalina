import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Search, ChevronRight, X, Heart } from 'lucide-react';

const Alumnos = () => {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: p } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
      setPerfil(p);
      const { data: alu } = await supabase.from('alumnos').select('*, datos_medicos(diagnostico)').order('apellido');
      setAlumnos(alu || []);
      setLoading(false);
    }
    init();
  }, []);

  const alumnosFiltrados = alumnos.filter(a => {
    const t = busqueda.toLowerCase();
    return a.nombre.toLowerCase().includes(t) || a.apellido.toLowerCase().includes(t) || a.dni.includes(t);
  });

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse">CARGANDO...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 bg-white/90 backdrop-blur-sm p-8 rounded-[2.5rem] border border-blue-50 shadow-sm">
          <div className="w-full md:w-auto">
            <button onClick={() => navigate('/dashboard')} className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2 mb-2"><ArrowLeft size={14}/> Volver</button>
            <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Alumnos</h1>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
            <input type="text" placeholder="Buscar por nombre o DNI..." className="w-full pl-12 pr-4 py-4 bg-gray-50/50 rounded-2xl outline-none border border-gray-100 font-bold" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumnosFiltrados.map(a => (
            <div key={a.id} onClick={() => navigate(`/legajo/${a.id}`)} className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-gray-100 hover:shadow-xl cursor-pointer transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-blue-900 uppercase">{a.apellido}, {a.nombre}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">DNI: {a.dni}</p>
                </div>
                <div className="bg-blue-50 text-blue-600 p-2 rounded-xl"><ChevronRight size={16}/></div>
              </div>
              
              {/* VISTA SEGÚN ROL */}
              {perfil?.rol === 'director' ? (
                <div className="bg-green-50/50 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-[9px] font-black text-green-600 uppercase">Cuota</span>
                  <span className="font-black text-green-900">${a.cuota_monto_mensual}</span>
                </div>
              ) : (
                <div className="bg-red-50/50 p-3 rounded-xl flex items-center gap-2">
                  <Heart size={12} className="text-red-500" />
                  <span className="text-[9px] font-black text-red-700 uppercase truncate">
                    {a.datos_medicos?.[0]?.diagnostico || "Sin diagnóstico cargado"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alumnos;