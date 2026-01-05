import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, User, DollarSign, ChevronRight } from 'lucide-react';

const ListaCobranzas = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAlumnos() {
      const { data } = await supabase.from('alumnos').select('id, nombre, apellido, dni, obra_social').order('apellido');
      setAlumnos(data || []);
    }
    fetchAlumnos();
  }, []);

  const filtrados = alumnos.filter(a => `${a.nombre} ${a.apellido} ${a.dni}`.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#fcfaf7]">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-emerald-500 transition">
          <ArrowLeft size={16} /> Volver al Panel
        </button>

        <header className="mb-10">
          <h1 className="text-4xl font-black text-[#1a3a5f] uppercase tracking-tighter">Gestión de Cobros</h1>
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Seleccione un alumno para registrar pago</p>
        </header>

        <div className="relative mb-8">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" placeholder="Buscar por nombre o DNI..." 
            className="w-full pl-14 pr-6 py-5 bg-white rounded-3xl outline-none font-bold text-sm shadow-sm border border-gray-100"
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filtrados.map(a => (
            <div 
              key={a.id} 
              onClick={() => navigate(`/registrar-pago/${a.id}`)}
              className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between hover:border-emerald-300 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-2xl text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors"><User size={20}/></div>
                <div>
                  <h3 className="font-black text-gray-800 uppercase text-sm tracking-tight">{a.apellido}, {a.nombre}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{a.obra_social} • DNI: {a.dni}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-emerald-500 uppercase opacity-0 group-hover:opacity-100 transition-all">Registrar Pago</span>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-emerald-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListaCobranzas;