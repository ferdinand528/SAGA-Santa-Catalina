import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const FichaAdministrativa = ({ alumnoId }) => {
  const [pagos, setPagos] = useState([]);
  const anioActual = new Date().getFullYear();

  // Función para registrar un pago rápidamente
  const registrarPago = async (mes, tipo) => {
    // Aquí iría la lógica para hacer el UPDATE en la tabla pagos_alumnos
    alert(`Registrando pago de Mes ${mes}`);
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black uppercase tracking-tighter text-blue-900">Seguimiento de Pagos {anioActual}</h2>
        <div className="flex gap-4 text-[10px] font-black uppercase">
          <span className="flex items-center gap-1 text-green-600"><CheckCircle size={14}/> Pagado</span>
          <span className="flex items-center gap-1 text-orange-500"><Clock size={14}/> Pendiente</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[1,2,3,4,5,6,7,8,9,10,11,12].map(mes => (
          <div key={mes} className="p-4 rounded-2xl border border-gray-50 bg-gray-50/50 hover:border-blue-200 transition-all">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Mes {mes}</p>
            <div className="space-y-3">
              <button onClick={() => registrarPago(mes, 'cuota')} className="w-full flex justify-between items-center text-[10px] font-bold">
                CUOTA <CheckCircle size={16} className="text-gray-300" />
              </button>
              <button onClick={() => registrarPago(mes, 'os')} className="w-full flex justify-between items-center text-[10px] font-bold">
                OBRA SOC. <Clock size={16} className="text-orange-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};