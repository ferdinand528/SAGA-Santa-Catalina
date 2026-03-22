import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, ChevronDown, ChevronRight, 
  User, Loader2, Search, HeartPulse 
} from 'lucide-react';

const CensoObraSocial = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [expandido, setExpandido] = useState(null);

  const fetchCenso = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alumnos')
        .select('id, apellido, nombre, obra_social, dni')
        .eq('activo', true)
        .order('apellido', { ascending: true });

      if (error) throw error;

      const agrupado = data.reduce((acc, alumno) => {
        const os = alumno.obra_social?.toUpperCase() || "SIN OBRA SOCIAL / PARTICULAR";
        if (!acc[os]) acc[os] = [];
        acc[os].push(alumno);
        return acc;
      }, {});

      setDatos(Object.entries(agrupado).sort((a, b) => b[1].length - a[1].length));
    } catch (err) {
      console.error("Error en censo:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCenso(); }, [fetchCenso]);

  const datosFiltrados = datos.filter(([os]) => 
    os.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    /* CAMBIO: bg-transparent permite que se vea el logo de App.jsx */
    <div className="min-h-screen p-6 md:p-10 bg-transparent font-sans text-[#1a3a5f]">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate('/reportes')} 
          className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-purple-600 transition bg-white px-4 py-2 rounded-full shadow-sm"
        >
          <ArrowLeft size={16} /> Volver a Reportes
        </button>

        <header className="mb-12">
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">
            Censo <span className="text-purple-600">Obra Social</span>
          </h1>
          <p className="text-purple-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">
            S.A.G.A v2.1 • Padrón de Alumnos por Convenio
          </p>
        </header>

        <div className="relative mb-8">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          <input 
            type="text" 
            placeholder="BUSCAR OBRA SOCIAL..." 
            className="w-full pl-16 pr-8 py-6 bg-white rounded-[2rem] shadow-sm outline-none font-bold text-xs uppercase border border-transparent focus:border-purple-200 transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-gray-200">
            <Loader2 className="animate-spin text-purple-500 mb-4" size={32} />
            <p className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Generando Padrón...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {datosFiltrados.map(([os, lista]) => (
              <div key={os} className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] shadow-sm border border-white overflow-hidden">
                <button 
                  onClick={() => setExpandido(expandido === os ? null : os)}
                  className="w-full p-8 flex justify-between items-center hover:bg-gray-50/50 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="bg-purple-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-purple-100">
                      {lista.length}
                    </div>
                    <div className="text-left">
                      <h3 className="font-black uppercase text-sm tracking-tight">{os}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Alumnos inscriptos</p>
                    </div>
                  </div>
                  {expandido === os ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>

                {expandido === os && (
                  <div className="px-8 pb-8 pt-2 grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50/30 border-t border-gray-50">
                    {lista.map(alumno => (
                      <div key={alumno.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                        <div className="bg-purple-50 p-2 rounded-full">
                          <User size={14} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-black uppercase text-[11px] leading-none mb-1">{alumno.apellido}, {alumno.nombre}</p>
                          <p className="text-[9px] text-gray-400 font-bold">DNI: {alumno.dni}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CensoObraSocial;