import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, User, BadgeDollarSign, CalendarDays, Filter } from 'lucide-react';

const RegistroPago = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [alumnos, setAlumnos] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [pagos, setPagos] = useState([]);
  
  // ESTADOS PARA DISCRIMINAR POR PERIODO
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [mesFiltro, setMesFiltro] = useState("TODOS"); // Filtro visual

  const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const ANIOS = [2024, 2025, 2026, 2027, 2028];

  useEffect(() => { fetchAlumnos(); }, []);
  useEffect(() => { if (alumnoSeleccionado) fetchPagos(); }, [alumnoSeleccionado, anioSeleccionado]);

  async function fetchAlumnos() {
    const { data } = await supabase.from('alumnos').select('*').order('apellido');
    setAlumnos(data || []);
  }

  async function fetchPagos() {
    const { data } = await supabase.from('pagos_alumnos')
      .select('*')
      .eq('alumno_id', alumnoSeleccionado.id)
      .eq('anio', anioSeleccionado);
    setPagos(data || []);
  }

  const registrarPago = async (mes, campo, valor) => {
    const registroExistente = pagos.find(p => p.mes === mes);
    if (registroExistente) {
      await supabase.from('pagos_alumnos').update({ [campo]: valor }).eq('id', registroExistente.id);
    } else {
      await supabase.from('pagos_alumnos').insert([{ 
        alumno_id: alumnoSeleccionado.id, mes, anio: anioSeleccionado, [campo]: valor 
      }]);
    }
    fetchPagos();
  };

  const filtrados = alumnos.filter(a => 
    `${a.apellido} ${a.nombre}`.toLowerCase().includes(busqueda.toLowerCase()) || a.dni.includes(busqueda)
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-blue-600 transition">
            <ArrowLeft size={16}/> Volver al Panel
          </button>
          <div className="text-right">
            <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Registro de Pago</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">S.A.G.A ver 1.0 • Control por Periodo</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* BUSCADOR Y SELECTOR DE AÑO */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-sm border border-blue-50">
              <label className="text-[9px] font-black text-blue-600 uppercase ml-2 mb-2 block tracking-widest">Seleccionar Año</label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                <select 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none font-black text-sm text-blue-900 appearance-none border-none shadow-inner"
                  value={anioSeleccionado}
                  onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
                >
                  {ANIOS.map(a => <option key={a} value={a}>GESTIÓN {a}</option>)}
                </select>
              </div>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" placeholder="Buscar alumno..." 
                className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-xl rounded-2xl border border-blue-50 outline-none font-bold text-sm shadow-sm"
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 p-4 max-h-[400px] overflow-y-auto custom-scrollbar shadow-sm">
              {filtrados.map(a => (
                <div 
                  key={a.id} onClick={() => setAlumnoSeleccionado(a)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all mb-2 ${alumnoSeleccionado?.id === a.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-blue-50 text-gray-700'}`}
                >
                  <p className="font-black uppercase text-xs">{a.apellido}, {a.nombre}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PLANILLA ANUAL DISCRIMINADA */}
          <div className="lg:col-span-3">
            {alumnoSeleccionado ? (
              <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[3rem] border border-blue-50 shadow-sm animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-gray-100 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-100"><User size={24}/></div>
                    <div>
                      <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">{alumnoSeleccionado.apellido}, {alumnoSeleccionado.nombre}</h2>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Legajo: {alumnoSeleccionado.dni} • Cuota: ${alumnoSeleccionado.cuota_monto_mensual}</p>
                    </div>
                  </div>
                  
                  {/* FILTRO DE MES */}
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                    <Filter size={14} className="ml-2 text-gray-400"/>
                    <select 
                      className="bg-transparent outline-none font-black text-[10px] uppercase text-gray-600 pr-4"
                      value={mesFiltro}
                      onChange={(e) => setMesFiltro(e.target.value)}
                    >
                      <option value="TODOS">Ver Año Completo</option>
                      {MESES.map((m, i) => <option key={m} value={i + 1}>{m.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {MESES.map((nombre, index) => {
                    const mesNum = index + 1;
                    // Lógica de discriminación visual por mes
                    if (mesFiltro !== "TODOS" && mesFiltro != mesNum) return null;
                    
                    const dato = pagos.find(p => p.mes === mesNum);
                    return (
                      <div key={nombre} className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 hover:shadow-md transition-all animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                           <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{nombre} {anioSeleccionado}</p>
                           {dato?.monto_pagado > 0 && <BadgeDollarSign size={16} className="text-green-500" />}
                        </div>
                        
                        <div className="space-y-3">
                          <input 
                            type="number" placeholder="Monto $" 
                            className="w-full p-4 bg-white rounded-xl border border-gray-100 font-black text-blue-900 outline-none"
                            value={dato?.monto_pagado || ''}
                            onChange={(e) => registrarPago(mesNum, 'monto_pagado', e.target.value)}
                          />
                          <select 
                            className="w-full p-4 bg-white rounded-xl border border-gray-100 font-bold text-[10px] uppercase outline-none"
                            value={dato?.tipo_pago || 'Particular'}
                            onChange={(e) => registrarPago(mesNum, 'tipo_pago', e.target.value)}
                          >
                            <option value="Particular">Particular</option>
                            <option value="Obra Social">Obra Social</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200 opacity-50 p-20">
                <BadgeDollarSign size={64} className="text-gray-300 mb-4" />
                <p className="font-black uppercase text-xs tracking-widest text-gray-400">Seleccione un alumno para discriminar pagos por año y mes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroPago;