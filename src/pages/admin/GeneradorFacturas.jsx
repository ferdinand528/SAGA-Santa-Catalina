import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Loader2, CheckCircle2, AlertCircle, Receipt
} from 'lucide-react';

const GeneradorFacturas = () => {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);

  // CONSULTA LIMPIA: Usamos apellido, nombre y dni segun tu base de datos
  const fetchAlumnosParaFacturar = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alumnos')
        .select('id, apellido, nombre, dni, monto_cuota, tipo_factura, email_tutor')
        .eq('activo', true) 
        .order('apellido', { ascending: true });

      if (error) throw error;
      setAlumnos(data.map(a => ({ ...a, estado: 'pendiente' })));
    } catch (err) {
      console.error("Error detallado:", err);
      alert("Error al cargar alumnos: Verifique que la columna sea 'dni'");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchAlumnosParaFacturar(); 
  }, [fetchAlumnosParaFacturar]);

  const procesarFacturacionMasiva = async () => {
    if (!window.confirm(`¿Emitir facturas para ${alumnos.length} alumnos?`)) return;

    setProcesando(true);
    for (let alumno of alumnos) {
      if (alumno.estado === 'completado') continue;
      try {
        setAlumnos(prev => prev.map(a => a.id === alumno.id ? { ...a, estado: 'procesando' } : a));
        
        // Simulación conexión Facturante / ARCA
        await new Promise(resolve => setTimeout(resolve, 600)); 
        
        setAlumnos(prev => prev.map(a => a.id === alumno.id ? { ...a, estado: 'completado' } : a));
      } catch (error) {
        setAlumnos(prev => prev.map(a => a.id === alumno.id ? { ...a, estado: 'error' } : a));
      }
    }
    setProcesando(false);
    alert("Proceso de facturación finalizado.");
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#84bd00]" size={40} /></div>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#fcfaf7] font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start mb-10 gap-4">
          <div>
            <button onClick={() => navigate('/cobranzas')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-4">
              <ArrowLeft size={16} /> Volver a Cobranzas
            </button>
            <h1 className="text-5xl font-black text-[#1a3a5f] tracking-tighter uppercase leading-none">Generador de <span className="text-[#84bd00]">Lote</span></h1>
          </div>
          <button 
            onClick={procesarFacturacionMasiva}
            disabled={procesando || alumnos.length === 0}
            className="bg-[#1a3a5f] text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-[#84bd00] transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {procesando ? <Loader2 className="animate-spin" /> : <Receipt size={20}/>}
            Ejecutar Facturación Mensual
          </button>
        </header>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-white overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase">Alumno / DNI</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase text-center">Tipo</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase text-center">Monto</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase text-right">Estado Emisión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {alumnos.map(alumno => (
                <tr key={alumno.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-8">
                    <p className="font-black text-[#1a3a5f] uppercase text-sm">{alumno.apellido}, {alumno.nombre}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">DNI: {alumno.dni}</p>
                  </td>
                  <td className="p-8 text-center font-black text-[10px] text-gray-400">FACTURA {alumno.tipo_factura || 'B'}</td>
                  <td className="p-8 text-center font-black text-[#1a3a5f]">$ {alumno.monto_cuota?.toLocaleString()}</td>
                  <td className="p-8 text-right">
                    {alumno.estado === 'pendiente' && <span className="text-gray-300 font-black text-[9px] uppercase tracking-widest">En espera</span>}
                    {alumno.estado === 'procesando' && <span className="text-blue-500 font-black text-[9px] uppercase animate-pulse">Procesando...</span>}
                    {alumno.estado === 'completado' && <div className="text-[#84bd00] flex items-center justify-end gap-1 font-black text-[9px] uppercase"><CheckCircle2 size={16}/> CAE Generado</div>}
                    {alumno.estado === 'error' && <div className="text-red-500 flex items-center justify-end gap-1 font-black text-[9px] uppercase"><AlertCircle size={16}/> Error ARCA</div>}
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