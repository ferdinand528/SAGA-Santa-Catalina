import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, ArrowLeft, Loader2, Send, CheckCircle2, 
  AlertCircle, User, CreditCard, Receipt
} from 'lucide-react';

const GeneradorFacturas = () => {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const fetchAlumnosParaFacturar = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alumnos')
        .select('id, apellido, nombre, dni_tutor, monto_cuota, tipo_factura, email_tutor')
        .eq('activo', true)
        .order('apellido', { ascending: true });

      if (error) throw error;
      setAlumnos(data.map(a => ({ ...a, estado: 'pendiente' })));
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAlumnosParaFacturar(); }, [fetchAlumnosParaFacturar]);

  // Lógica para Facturante (Maneja A, B y M)
  const procesarFacturacionMasiva = async () => {
    setProcesando(true);
    for (let alumno of alumnos) {
      if (alumno.estado === 'completado') continue;

      try {
        // Aquí conectamos con tu API de Facturante
        // La lógica detectará automáticamente si es A, B o M según el campo alumno.tipo_factura
        console.log(`Emitiendo Factura ${alumno.tipo_factura} para ${alumno.apellido} por $${alumno.monto_cuota}`);
        
        // Simulación de éxito (Aquí iría el fetch a Facturante que vimos antes)
        await new Promise(resolve => setTimeout(resolve, 500)); 
        
        setAlumnos(prev => prev.map(a => 
          a.id === alumno.id ? { ...a, estado: 'completado' } : a
        ));
      } catch (error) {
        setAlumnos(prev => prev.map(a => 
          a.id === alumno.id ? { ...a, estado: 'error' } : a
        ));
      }
    }
    setProcesando(false);
    alert("Proceso de facturación mensual finalizado.");
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#84bd00]" size={40} /></div>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#fcfaf7] animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-4 hover:text-[#84bd00] transition">
              <ArrowLeft size={16} /> Volver
            </button>
            <h1 className="text-4xl font-black text-[#1a3a5f] tracking-tighter uppercase">Lote de Facturación</h1>
            <p className="text-[10px] font-black text-[#84bd00] uppercase tracking-widest mt-1">Santa Catalina v3.0 • ARCA / Facturante</p>
          </div>

          <button 
            onClick={procesarFacturacionMasiva}
            disabled={procesando}
            className="bg-[#1a3a5f] text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-[#84bd00] transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {procesando ? <Loader2 className="animate-spin" /> : <Receipt size={20}/>}
            Ejecutar Facturación del Mes
          </button>
        </header>

        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase">Alumno</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase">Tipo</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase">Monto</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {alumnos.map(alumno => (
                <tr key={alumno.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-6">
                    <p className="font-black text-[#1a3a5f] uppercase text-sm">{alumno.apellido}, {alumno.nombre}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">DNI Tutor: {alumno.dni_tutor}</p>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full font-black text-[10px] ${alumno.tipo_factura === 'A' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                      FACTURA {alumno.tipo_factura}
                    </span>
                  </td>
                  <td className="p-6 font-black text-[#1a3a5f]">$ {alumno.monto_cuota}</td>
                  <td className="p-6 text-right">
                    {alumno.estado === 'pendiente' && <span className="text-gray-300 font-black text-[9px] uppercase">En espera</span>}
                    {alumno.estado === 'completado' && <div className="text-[#84bd00] flex items-center justify-end gap-1 font-black text-[9px] uppercase"><CheckCircle2 size={14}/> Emitida</div>}
                    {alumno.estado === 'error' && <div className="text-red-500 flex items-center justify-end gap-1 font-black text-[9px] uppercase"><AlertCircle size={14}/> Error ARCA</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GeneradorFacturas;