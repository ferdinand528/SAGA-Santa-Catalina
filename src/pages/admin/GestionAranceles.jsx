import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, DollarSign, Loader2, 
  Receipt, CheckCircle2, AlertCircle, User 
} from 'lucide-react';

const GestionAranceles = () => {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [guardando, setGuardando] = useState(null);

  const fetchAlumnos = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alumnos')
        .select('*')
        .eq('activo', true)
        .order('apellido', { ascending: true });
      if (error) throw error;
      setAlumnos(data || []);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAlumnos(); }, [fetchAlumnos]);

  // Actualiza tipo de factura o monto en la base de datos
  const actualizarAlumno = async (id, campo, valor) => {
    setGuardando(id);
    try {
      const { error } = await supabase
        .from('alumnos')
        .update({ [campo]: valor })
        .eq('id', id);
      if (error) throw error;
      setAlumnos(prev => prev.map(a => a.id === id ? { ...a, [campo]: valor } : a));
    } catch (error) {
      alert("Error al actualizar: " + error.message);
    } finally {
      setGuardando(null);
    }
  };

  const emitirLoteFacturante = async () => {
    setProcesando(true);
    setResultado(null);

    const comprobantes = filtrados.map(a => {
      // Mapeo dinámico según la elección manual
      let tipoCod = 6; // Por defecto B
      if (a.tipo_factura === 'A') tipoCod = 1;
      if (a.tipo_factura === 'C') tipoCod = 11;

      return {
        TipoComprobante: tipoCod,
        PuntoVenta: 2, 
        Concepto: 2, 
        Receptor: {
          TipoDocumento: a.tipo_factura === 'A' ? 80 : 96, // CUIT (80) para A, DNI (96) para B
          NumeroDocumento: a.dni_tutor || a.dni,
          Denominacion: (a.nombre_tutor_facturacion || `${a.apellido} ${a.nombre}`).toUpperCase(),
          Email: a.email_tutor || "" 
        },
        Items: [{
          Descripcion: `Cuota Arancelaria - ${new Date().toLocaleString('es-AR', { month: 'long' }).toUpperCase()}`,
          Cantidad: 1,
          PrecioUnitario: a.monto_cuota,
          IvaId: a.tipo_factura === 'A' ? 5 : 3, // 21% para A (ejemplo), Exento para B
          ImporteTotal: a.monto_cuota
        }]
      };
    });

    try {
      // Llamada a la función que conecta con Facturante
      const { data, error } = await supabase.functions.invoke('emitir-facturas-facturante', {
        body: { comprobantes }
      });
      if (error) throw error;
      setResultado({ success: true, mensaje: `Se enviaron ${comprobantes.length} facturas a Facturante.` });
    } catch (error) {
      setResultado({ success: false, mensaje: "Error de conexión con el servicio." });
    } finally {
      setProcesando(false);
    }
  };

  const filtrados = alumnos.filter(a => 
    `${a.apellido} ${a.nombre}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 md:p-12 bg-[#fcfaf7] font-sans text-[#1a3a5f]">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-4 hover:text-[#1a3a5f] transition">
              <ArrowLeft size={16} /> Volver
            </button>
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">
              Control <span className="text-[#00aae4]">Facturante</span>
            </h1>
          </div>
          
          <button 
            onClick={emitirLoteFacturante}
            disabled={procesando || filtrados.length === 0}
            className="bg-[#00aae4] text-white px-10 py-5 rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {procesando ? <Loader2 className="animate-spin" /> : <Receipt size={20}/>}
            Emitir Facturas Seleccionadas
          </button>
        </header>

        {resultado && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 font-bold uppercase text-[10px] ${resultado.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {resultado.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {resultado.mensaje}
          </div>
        )}

        <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 p-10">
          <div className="relative mb-10">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
            <input 
              type="text" 
              placeholder="BUSCAR ALUMNO POR APELLIDO..." 
              className="w-full pl-20 pr-10 py-8 bg-gray-50/50 rounded-[2.5rem] outline-none font-bold text-sm uppercase" 
              value={busqueda} 
              onChange={(e) => setBusqueda(e.target.value)} 
            />
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="pb-8 px-4">Alumno / Responsable</th>
                <th className="pb-8 px-4 text-center">Tipo Factura</th>
                <th className="pb-8 px-4 text-right">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map(a => (
                <tr key={a.id} className="hover:bg-gray-50/30 transition-all">
                  <td className="py-8 px-4">
                    <p className="font-black uppercase text-sm text-[#1a3a5f]">{a.apellido}, {a.nombre}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                      Doc: {a.dni_tutor || a.dni} — {a.nombre_tutor_facturacion || 'Sin Tutor'}
                    </p>
                  </td>
                  <td className="py-8 px-4 text-center">
                    <select 
                      className="bg-gray-100 border-none rounded-xl font-black text-[11px] px-4 py-2 outline-none focus:ring-2 focus:ring-[#00aae4] cursor-pointer"
                      value={a.tipo_factura || 'B'}
                      onChange={(e) => actualizarAlumno(a.id, 'tipo_factura', e.target.value)}
                    >
                      <option value="A">FACTURA A</option>
                      <option value="B">FACTURA B</option>
                      <option value="C">FACTURA C</option>
                    </select>
                  </td>
                  <td className="py-8 px-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {guardando === a.id && <Loader2 size={14} className="animate-spin text-gray-300" />}
                      <div className="bg-gray-50 px-4 py-2 rounded-xl font-black text-sm text-[#1a3a5f]">
                        $ {Number(a.monto_cuota).toLocaleString()}
                      </div>
                    </div>
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

export default GestionAranceles;