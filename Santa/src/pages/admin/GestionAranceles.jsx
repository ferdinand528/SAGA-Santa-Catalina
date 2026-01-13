import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx'; // Importación para el Plan B
import { 
  ArrowLeft, Search, Receipt, DollarSign, 
  Loader2, FilePlus, X, Send, Download 
} from 'lucide-react';

const GestionAranceles = () => {
  const navigate = useNavigate();

  // --- ESTADOS PRINCIPALES ---
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [guardando, setGuardando] = useState(null);
  
  // --- ESTADOS MODAL FACTURA MANUAL ---
  const [modalAbierto, setModalAbierto] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [datosManuales, setDatosManuales] = useState({ monto: "", concepto: "", tipo: "B" });
  const [enviandoManual, setEnviandoManual] = useState(false);

  // --- 1. CARGA DE DATOS ---
  const fetchAlumnos = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alumnos')
        .select('id, apellido, nombre, monto_cuota, tipo_factura, condicion_iva, dni_tutor, nombre_tutor_facturacion, dni_alumno, email_tutor, activo')
        .order('apellido', { ascending: true });

      if (error) throw error;
      const soloActivos = data?.filter(a => a.activo === true) || [];
      setAlumnos(soloActivos);
    } catch (error) {
      console.error("Error técnico:", error.message);
      alert("Error al cargar alumnos: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlumnos();
  }, [fetchAlumnos]);

  // --- 2. ACCIONES DE BASE DE DATOS (AUTO-SAVE) ---
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
      alert("No se pudo guardar el cambio: " + error.message);
    } finally {
      setGuardando(null);
    }
  };

  // --- 3. LÓGICA PLAN B: EXPORTACIÓN PARA FACTURADOR PLUS (ARCA) ---
  const exportarFacturadorPlus = () => {
    const fechaActual = new Date();
    const nombreMes = fechaActual.toLocaleString('es-AR', { month: 'long' }).toUpperCase();
    const anio = fechaActual.getFullYear();
    const fechaFormatoAFIP = fechaActual.toLocaleDateString('es-AR').split('/').reverse().join(''); // AAAAMMDD

    // Mapeo basado en la factura real de Silvana Vallejos
    const lotes = filtrados.map(a => ({
      "Fecha": fechaFormatoAFIP,
      "Tipo Comp.": a.tipo_factura === 'A' ? '001' : '006', // 006 es Factura B 
      "Punto de Venta": "00002", // Tu nuevo Punto de Venta Masivo
      "Doc. Tipo": "96", // DNI 
      "Doc. Nro": a.dni_tutor || "0",
      "Nombre Receptor": a.nombre_tutor_facturacion || `${a.apellido} ${a.nombre}`,
      "Imp. Total": a.monto_cuota || 0,
      "Concepto": "2", // 2 = Servicios 
      "Detalle": `beneficiario ${a.nombre} ${a.apellido} dni: ${a.dni_alumno} prestacion brindada centro de dia jornada simple con dependencia mes ${nombreMes} ${anio}` // 
    }));

    if (lotes.length === 0) {
      alert("No hay alumnos para exportar.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(lotes);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Facturacion");
    XLSX.writeFile(wb, `SAGA_ARCA_PuntoVenta2_${nombreMes}_${anio}.xlsx`);
  };

  // --- 4. FACTURACIÓN MANUAL (OVERRIDE) ---
  const prepararFacturaManual = (alumno) => {
    setAlumnoSeleccionado(alumno);
    setDatosManuales({
      monto: alumno.monto_cuota || 0,
      concepto: `CUOTA MES ${new Date().toLocaleString('es-AR', { month: 'long' }).toUpperCase()}`,
      tipo: alumno.tipo_factura || "B"
    });
    setModalAbierto(true);
  };

  const enviarFacturaManual = async () => {
    if (!datosManuales.monto || datosManuales.monto <= 0) {
      alert("El monto debe ser mayor a 0");
      return;
    }
    setEnviandoManual(true);
    try {
      // Simulación de conexión (Plan A)
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Simulación Plan A: Factura enviada para ${alumnoSeleccionado.apellido}`);
      setModalAbierto(false);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setEnviandoManual(false);
    }
  };

  const filtrados = alumnos.filter(a => 
    `${a.apellido} ${a.nombre}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-[#1a3a5f] uppercase tracking-widest animate-pulse">
      <Loader2 className="animate-spin mr-3 text-[#84bd00]" size={24} /> Cargando Tesorería v3.0...
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#fcfaf7] animate-fade-in relative font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER CON NUEVO BOTÓN EXPORTAR */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-4 hover:text-[#84bd00] transition bg-white px-4 py-2 rounded-full shadow-sm">
              <ArrowLeft size={16} /> Volver al Panel
            </button>
            <h1 className="text-4xl font-black text-[#1a3a5f] tracking-tighter uppercase leading-none">Tesorería General</h1>
            <p className="text-[10px] font-black text-[#84bd00] uppercase tracking-[0.3em] mt-2 italic">Santa Catalina • Plan B: Exportación Masiva</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={exportarFacturadorPlus} 
              className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              <Download size={18}/> Exportar Excel ARCA (PV 2)
            </button>
            <button 
              onClick={() => navigate('/generar-facturas')} 
              className="bg-[#1a3a5f] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2"
            >
              <Receipt size={18}/> Generador Automático
            </button>
          </div>
        </header>

        {/* TABLA DE GESTIÓN */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-8">
          <div className="relative mb-8">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={22} />
            <input 
              type="text" placeholder="BUSCAR ALUMNO..." 
              className="w-full pl-16 pr-6 py-6 bg-gray-50/50 rounded-[2rem] outline-none font-bold text-sm focus:ring-4 focus:ring-[#84bd00]/10 border-none shadow-inner uppercase"
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-50">
                  <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Alumno / Tutor</th>
                  <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center px-4">Tipo Comp.</th>
                  <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Monto Cuota Base</th>
                  <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right px-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map(a => (
                  <tr key={a.id} className="group hover:bg-gray-50/30 transition-colors">
                    <td className="py-6 px-4">
                      <p className="font-black text-[#1a3a5f] uppercase text-sm leading-none mb-1">{a.apellido}, {a.nombre}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                        Tutor: {a.nombre_tutor_facturacion || 'No cargado'} | DNI: {a.dni_tutor}
                      </p>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <select 
                        value={a.tipo_factura || "B"}
                        onChange={(e) => actualizarAlumno(a.id, 'tipo_factura', e.target.value)}
                        className="bg-gray-100 border-none rounded-xl font-black text-[10px] p-3 focus:ring-2 focus:ring-[#84bd00] cursor-pointer outline-none"
                      >
                        <option value="B">FACTURA B</option>
                        <option value="A">FACTURA A</option>
                        <option value="M">FACTURA M</option>
                      </select>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-2 bg-gray-50 w-40 px-4 py-3 rounded-xl border-2 border-transparent focus-within:border-[#84bd00] transition-all">
                        <DollarSign size={14} className="text-gray-400" />
                        <input 
                          type="number"
                          className="bg-transparent border-none outline-none w-full font-black text-sm text-[#1a3a5f]"
                          defaultValue={a.monto_cuota}
                          onBlur={(e) => actualizarAlumno(a.id, 'monto_cuota', e.target.value)}
                        />
                      </div>
                    </td>
                    <td className="py-6 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                         {guardando === a.id && <Loader2 size={16} className="animate-spin text-[#84bd00]" />}
                        <button 
                          onClick={() => prepararFacturaManual(a)}
                          className="px-4 py-3 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-sm flex items-center gap-2 font-black text-[9px] uppercase tracking-widest"
                        >
                          <FilePlus size={16}/> Manual
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL OVERLAY: EMISIÓN MANUAL */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-[#1a3a5f]/30 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl border border-white p-10 relative">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="bg-orange-100 text-orange-600 text-[8px] font-black px-2 py-1 rounded uppercase tracking-tighter mb-2 inline-block">Proceso Excepcional</span>
                <h2 className="text-3xl font-black text-[#1a3a5f] uppercase tracking-tighter leading-none">Emitir Factura</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 italic">Destinatario: {alumnoSeleccionado?.nombre_tutor_facturacion || alumnoSeleccionado?.apellido}</p>
              </div>
              <button onClick={() => setModalAbierto(false)} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"><X size={20}/></button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest">Detalle en Factura</label>
                <textarea 
                  className="w-full p-5 bg-gray-50 rounded-[1.5rem] border-none outline-none font-bold text-gray-600 focus:ring-4 focus:ring-orange-500/10 h-24 resize-none"
                  value={datosManuales.concepto}
                  onChange={(e) => setDatosManuales({...datosManuales, concepto: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest">Monto</label>
                  <div className="flex items-center gap-2 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <DollarSign size={16} className="text-orange-500" />
                    <input 
                      type="number" 
                      className="bg-transparent border-none outline-none font-black text-xl text-[#1a3a5f] w-full"
                      value={datosManuales.monto}
                      onChange={(e) => setDatosManuales({...datosManuales, monto: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest">Tipo</label>
                  <select 
                    className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-black text-[#1a3a5f]"
                    value={datosManuales.tipo}
                    onChange={(e) => setDatosManuales({...datosManuales, tipo: e.target.value})}
                  >
                    <option value="B">FACTURA B</option>
                    <option value="A">FACTURA A</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={enviarFacturaManual}
                disabled={enviandoManual}
                className="w-full bg-[#84bd00] text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-[#1a3a5f] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {enviandoManual ? <Loader2 className="animate-spin" /> : <Send size={20}/>}
                Firmar y Enviar a ARCA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionAranceles;