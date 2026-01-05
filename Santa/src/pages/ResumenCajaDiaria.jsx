import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, DollarSign, Wallet, CreditCard, 
  CheckCircle2, Printer, Loader2, TrendingUp 
} from 'lucide-react';

const ResumenCajaDiaria = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pagosHoy, setPagosHoy] = useState([]);
  const [totales, setTotales] = useState({ efectivo: 0, transferencia: 0, cheque: 0, total: 0 });

  useEffect(() => {
    fetchCajaHoy();
  }, []);

  async function fetchCajaHoy() {
    try {
      // 1. Definir rango de "hoy"
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('pagos')
        .select(`
          *,
          alumnos (nombre, apellido)
        `)
        .gte('fecha_registro', hoy.toISOString())
        .order('fecha_registro', { ascending: false });

      if (error) throw error;

      // 2. Calcular Totales por Método
      const calculos = data.reduce((acc, pago) => {
        const monto = parseFloat(pago.monto);
        acc.total += monto;
        if (pago.metodo_pago === 'Efectivo') acc.efectivo += monto;
        if (pago.metodo_pago === 'Transferencia') acc.transferencia += monto;
        if (pago.metodo_pago === 'Cheque') acc.cheque += monto;
        return acc;
      }, { efectivo: 0, transferencia: 0, cheque: 0, total: 0 });

      setTotales(calculos);
      setPagosHoy(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-emerald-500 uppercase text-xs">Calculando cierre de caja...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#fcfaf7] animate-fade-in">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-start mb-10">
          <button onClick={() => navigate('/reportes')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-emerald-600 transition">
            <ArrowLeft size={16} /> Volver a Reportes
          </button>
          <button onClick={() => window.print()} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest print:hidden">
            <Printer size={16}/> Imprimir Arqueo
          </button>
        </div>

        <header className="mb-12">
          <h1 className="text-4xl font-black text-[#1a3a5f] uppercase tracking-tighter">Resumen de Caja Diaria</h1>
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <TrendingUp size={14}/> Fecha: {new Date().toLocaleDateString()} • Santa Catalina v1.8
          </p>
        </header>

        {/* TARJETAS DE TOTALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
            <div className="bg-emerald-500 w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4"><DollarSign size={20}/></div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Recaudación Total</p>
            <p className="text-3xl font-black text-[#1a3a5f] tracking-tighter mt-1">${totales.total}</p>
          </div>
          <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
            <div className="bg-gray-800 w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4"><Wallet size={20}/></div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Efectivo en Caja</p>
            <p className="text-3xl font-black text-gray-800 tracking-tighter mt-1">${totales.efectivo}</p>
          </div>
          <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
            <div className="bg-blue-500 w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4"><CreditCard size={20}/></div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Transferencias</p>
            <p className="text-3xl font-black text-blue-600 tracking-tighter mt-1">${totales.transferencia}</p>
          </div>
          <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm border-l-4 border-l-orange-500">
            <div className="bg-orange-500 w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4"><CheckCircle2 size={20}/></div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Cheques</p>
            <p className="text-3xl font-black text-orange-600 tracking-tighter mt-1">${totales.cheque}</p>
          </div>
        </div>

        {/* DETALLE DE MOVIMIENTOS */}
        <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
             <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Detalle de Ingresos</h3>
             <span className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[9px] font-black uppercase">{pagosHoy.length} Operaciones</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase">Alumno</th>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase">Mes/Año</th>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase">Método</th>
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pagosHoy.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-6 font-black text-[#1a3a5f] uppercase text-xs">{p.alumnos.apellido}, {p.alumnos.nombre}</td>
                    <td className="p-6 font-bold text-gray-500 text-[10px] uppercase">{p.mes} {p.anio}</td>
                    <td className="p-6">
                       <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${
                         p.metodo_pago === 'Efectivo' ? 'bg-gray-100 border-gray-200 text-gray-600' :
                         p.metodo_pago === 'Transferencia' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                         'bg-orange-50 border-orange-100 text-orange-600'
                       }`}>
                         {p.metodo_pago}
                       </span>
                    </td>
                    <td className="p-6 text-right font-black text-emerald-600 text-sm">${p.monto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenCajaDiaria;