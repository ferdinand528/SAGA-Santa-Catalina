import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; // Un solo nivel para subir a src/
import { CheckCircle, Clock, Landmark, RefreshCw, Loader2 } from 'lucide-react';

const SeccionPagos = ({ alumnoId, cuotaActual }) => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true); // Nace en true para evitar el setState inicial
  const anioActual = new Date().getFullYear();
  const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const fetchPagos = useCallback(async () => {
    if (!alumnoId) {
      setLoading(false);
      return;
    }

    // Solo activamos loading manualmente si ya fue desactivado antes (ej. en un refresh)
    setLoading(prev => !prev ? true : true); 

    try {
      const { data } = await supabase
        .from('pagos_alumnos')
        .select('*')
        .eq('alumno_id', alumnoId)
        .eq('anio', anioActual);
      setPagos(data || []);
    } catch (error) {
      console.error("Error en cobranzas:", error);
    } finally {
      setLoading(false);
    }
  }, [alumnoId, anioActual]);

  useEffect(() => { 
    fetchPagos(); 
  }, [fetchPagos]);

  const togglePago = async (mes, campo, estadoActual) => {
    const nuevoEstado = estadoActual === 'pagado' ? 'pendiente' : 'pagado';
    const registroExistente = pagos.find(p => p.mes === mes);

    try {
      if (registroExistente) {
        await supabase.from('pagos_alumnos').update({ [campo]: nuevoEstado }).eq('id', registroExistente.id);
      } else {
        await supabase.from('pagos_alumnos').insert([{
          alumno_id: alumnoId, mes, anio: anioActual,
          [campo]: nuevoEstado, monto_capturado: cuotaActual 
        }]);
      }
      fetchPagos();
    } catch (error) {
      console.error("Error al actualizar pago:", error);
    }
  };

  return (
    <div className="mt-10 bg-white rounded-[2.5rem] p-10 shadow-sm border border-blue-50">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter flex items-center gap-3">
          <Landmark className="text-blue-600" /> Cobranzas {anioActual}
        </h2>
        <button 
          onClick={fetchPagos} 
          disabled={loading}
          className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:rotate-180 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {MESES.map((nombre, index) => {
          const mesNum = index + 1;
          const datoMes = pagos.find(p => p.mes === mesNum);
          const estadoMes = datoMes?.cuota_estado;
          
          return (
            <div key={nombre} className="bg-gray-50 p-4 rounded-3xl text-center border border-transparent hover:border-blue-100 transition-all shadow-sm">
              <p className="text-[10px] font-black uppercase mb-3 border-b pb-1 text-blue-900">{nombre}</p>
              <button 
                onClick={() => togglePago(mesNum, 'cuota_estado', estadoMes)}
                className={`w-full p-2 rounded-xl flex justify-between items-center mb-2 transition-colors ${estadoMes === 'pagado' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-300'}`}
              >
                <span className="text-[8px] font-black uppercase">Cuota</span>
                {estadoMes === 'pagado' ? <CheckCircle size={12}/> : <Clock size={12}/>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeccionPagos;