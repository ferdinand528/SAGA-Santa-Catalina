import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Landmark, User, BadgeDollarSign } from 'lucide-react';

const RegistroPago = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [alumnos, setAlumnos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [pagos, setPagos] = useState([]);
  const anioActual = new Date().getFullYear();

  useEffect(() => {
    async function fetchAlumnos() {
      const { data } = await supabase.from('alumnos').select('*').order('apellido');
      setAlumnos(data || []);
    }
    fetchAlumnos();
  }, []);

  useEffect(() => {
    if (seleccionado) fetchPagos();
  }, [seleccionado]);

  async function fetchPagos() {
    const { data } = await supabase.from('pagos_alumnos').select('*').eq('alumno_id', seleccionado.id).eq('anio', anioActual);
    setPagos(data || []);
  }

  const updatePago = async (mes, campo, valor) => {
    const registro = pagos.find(p => p.mes === mes);
    if (registro) {
      await supabase.from('pagos_alumnos').update({ [campo]: valor }).eq('id', registro.id);
    } else {
      await supabase.from('pagos_alumnos').insert([{ alumno_id: seleccionado.id, mes, anio: anioActual, [campo]: valor }]);
    }
    fetchPagos();
  };

  const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

  return (
    <div className="min-h-screen p-10">
      <header className="mb-10 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="p-3 bg-white rounded-2xl shadow-sm"><ArrowLeft size={20}/></button>
        <h1 className="text-3xl font-black text-blue-900 uppercase">Sección Registro de Pago</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* BUSCADOR */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-sm h-fit">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Buscar alumno..." className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
          <div className="space-y-2">
            {alumnos.filter(a => a.apellido.toLowerCase().includes(busqueda.toLowerCase())).map(a => (
              <div key={a.id} onClick={() => setSeleccionado(a)} className={`p-4 rounded-2xl cursor-pointer transition ${seleccionado?.id === a.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 hover:bg-blue-50'}`}>
                <p className="font-black uppercase text-[10px]">{a.apellido}, {a.nombre}</p>
              </div>
            ))}
          </div>
        </div>

        {/* GRILLA DE PAGOS */}
        <div className="lg:col-span-3">
          {seleccionado ? (
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-blue-50">
              <h2 className="text-2xl font-black text-blue-900 uppercase mb-8">{seleccionado.apellido}, {seleccionado.nombre}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {MESES.map((nombre, index) => {
                  const mesNum = index + 1;
                  const dato = pagos.find(p => p.mes === mesNum);
                  return (
                    <div key={nombre} className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 mb-4">{nombre}</p>
                      <input type="number" placeholder="Monto $" className="w-full p-3 bg-white rounded-xl border border-gray-100 font-black text-blue-900 mb-3" value={dato?.monto_pagado || ''} onChange={e => updatePago(mesNum, 'monto_pagado', e.target.value)} />
                      <select className="w-full p-3 bg-white rounded-xl border border-gray-100 font-bold text-[10px] uppercase" value={dato?.tipo_pago || 'Particular'} onChange={e => updatePago(mesNum, 'tipo_pago', e.target.value)}>
                        <option value="Particular">Particular</option>
                        <option value="Obra Social">Obra Social</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white/50 border-2 border-dashed border-gray-200 h-96 rounded-[3rem] flex flex-col items-center justify-center opacity-40">
              <Landmark size={64} className="mb-4" />
              <p className="font-black uppercase text-xs">Seleccione un alumno para cargar pagos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default RegistroPago;