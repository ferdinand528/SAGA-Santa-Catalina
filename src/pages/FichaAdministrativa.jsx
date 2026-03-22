import React from 'react'; // Eliminamos useState y useEffect si no hay lógica real aún
import { CheckCircle, Clock } from 'lucide-react'; // Dejamos solo los que usás

const FichaAdministrativa = ({ alumnoId }) => {
  const anioActual = new Date().getFullYear();

  // Función para registrar un pago rápidamente
  const registrarPago = (mes, tipo) => {
    // Usamos alumnoId para que el linter vea que la prop tiene una función
    console.log(`Iniciando registro para alumno ID: ${alumnoId}`);
    alert(`Registrando pago de ${tipo.toUpperCase()} - Mes ${mes}`);
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-[#1a3a5f]">
            Seguimiento de Pagos {anioActual}
          </h2>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Control Administrativo Interno
          </p>
        </div>
        <div className="flex gap-4 text-[10px] font-black uppercase">
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <CheckCircle size={14}/> Pagado
          </span>
          <span className="flex items-center gap-1 text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
            <Clock size={14}/> Pendiente
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(mes => (
          <div key={mes} className="p-5 rounded-[2rem] border border-gray-50 bg-gray-50/30 hover:border-blue-200 hover:bg-white transition-all group">
            <p className="text-[10px] font-black text-gray-300 group-hover:text-blue-600 uppercase mb-4 transition-colors">
              Mes {mes < 10 ? `0${mes}` : mes}
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => registrarPago(mes, 'cuota')} 
                className="w-full flex justify-between items-center text-[9px] font-black uppercase text-gray-400 hover:text-green-600 transition-colors"
              >
                CUOTA <CheckCircle size={16} className="text-gray-100 group-hover:text-green-200 transition-colors" />
              </button>
              <button 
                onClick={() => registrarPago(mes, 'os')} 
                className="w-full flex justify-between items-center text-[9px] font-black uppercase text-gray-400 hover:text-orange-500 transition-colors"
              >
                OBRA SOC. <Clock size={16} className="text-orange-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <p className="text-[9px] font-bold text-gray-400 uppercase text-center leading-relaxed">
          Este tablero es solo de visualización rápida. Para emitir recibos oficiales o cargar montos específicos, 
          dirigirse al módulo de <span className="text-blue-600">Cobranzas</span>.
        </p>
      </div>
    </div>
  );
};

export default FichaAdministrativa;