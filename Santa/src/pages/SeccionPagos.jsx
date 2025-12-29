import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, Clock, CreditCard, Landmark, RefreshCw } from 'lucide-react';

const SeccionPagos = ({ alumnoId, cuotaActual }) => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const anioActual = new Date().getFullYear();

  useEffect(() => { fetchPagos(); }, [alumnoId]);

  async function fetchPagos() {
    setLoading(true);
    const { data } = await supabase
      .from('pagos_alumnos')
      .select('*')
      .eq('alumno_id', alumnoId)
      .eq('anio', anioActual);
    setPagos(data || []);
    setLoading(false);
  }

  const togglePago = async (mes, campo, estadoActual) => {
    const nuevoEstado = estadoActual === 'pagado' ? 'pendiente' : 'pagado';
    
    // Intentamos actualizar o insertar si no existe el registro del mes
    const registroExistente = pagos.find(p => p.mes === mes);

    if (registroExistente) {
      await supabase.from('pagos_alumnos')
        .update({ [campo]: nuevoEstado })
        .eq('id', registroExistente.id);
    } else {
      await supabase.from('pagos_alumnos').insert([{
        alumno_id: alumnoId,
        mes,
        anio: anioActual,
        [campo]: nuevoEstado,
        monto_capturado: cuotaActual // Guardamos el precio de HOY para este mes
      }]);
    }
    fetchPagos();
  };

  const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  return (
    <div className="mt-10 bg-white rounded-[2.5rem] p-10 shadow-sm border border-blue-50">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter flex items-center gap-3">
            <Landmark className="text-blue-600" /> Control de Cobranzas {anioActual}
          </h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Cuota actual: ${cuotaActual}</p>
        </div>
        <button onClick={fetchPagos} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:rotate-180 transition-all duration-500">
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {MESES.map((nombre, index) => {
          const mesNum = index + 1;
          const dato = pagos.find(p => p.mes === mesNum);
          
          return (
            <div key={nombre} className="bg-gray-50 p-6 rounded-3xl border border-transparent hover:border-blue-200 transition-all group">
              <p className="text-xs font-black text-blue-900 uppercase mb-4 text-center border-b border-blue-100 pb-2">{nombre}</p>
              
              <div className="space-y-4">
                {/* Control de Cuota Particular */}
                <button 
                  onClick={() => togglePago(mesNum, 'cuota_estado', dato?.cuota_estado)}
                  className={`w-full p-3 rounded-xl flex justify-between items-center transition-all ${
                    dato?.cuota_estado === 'pagado' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-400 border border-gray-100'
                  }`}
                >
                  <span className="text-[9px] font-black uppercase">Cuota</span>
                  {dato?.cuota_estado === 'pagado' ? <CheckCircle size={14} /> : <Clock size={14} />}
                </button>

                {/* Control de Obra Social */}
                <button 
                  onClick={() => togglePago(mesNum, 'os_estado', dato?.os_estado)}
                  className={`w-full p-3 rounded-xl flex justify-between items-center transition-all ${
                    dato?.os_estado === 'pagado' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-400 border border-gray-100'
                  }`}
                >
                  <span className="text-[9px] font-black uppercase">O. Social</span>
                  {dato?.os_estado === 'pagado' ? <CheckCircle size={14} /> : <Clock size={14} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeccionPagos;