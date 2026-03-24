import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, DollarSign, CheckCircle, Clock, ArrowLeft, Receipt, Loader2, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ListaCobranzas = () => {
  const navigate = useNavigate();
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [perfil, setPerfil] = useState(null); // 👈 Para validar el rol

  // 🛡️ RESTRICCIÓN DE SEGURIDAD: Solo el Director accede a Tesorería
  useEffect(() => {
    const verificarAcceso = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/'); return; }

        const { data } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
        
        if (data?.rol?.toLowerCase() !== 'director') {
          alert("Acceso denegado: Esta sección es exclusiva de la Dirección.");
          navigate('/dashboard');
        }
        setPerfil(data);
      } catch (error) {
        navigate('/dashboard');
      }
    };
    verificarAcceso();
  }, [navigate]);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pagos')
        .select(`
          *,
          alumnos (
            apellido,
            nombre,
            dni
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPagos(data || []);
    } catch (err) {
      console.error("Error:", err);
      alert("Error al cargar cobranzas: Verifique la tabla Alumnos");
    } finally {
      setLoading(false);
    }
  }

  // 📈 LÓGICA DE BALANCE GENERAL (Mes y Año)
  const mesActual = new Date().getMonth() + 1;
  const anioActual = new Date().getFullYear();

  const balanceMensual = pagos
    .filter(p => Number(p.mes_facturado) === mesActual && Number(p.anio_facturado) === anioActual)
    .reduce((acc, curr) => acc + (Number(curr.monto_total) || 0), 0);

  const balanceAnual = pagos
    .filter(p => Number(p.anio_facturado) === anioActual)
    .reduce((acc, curr) => acc + (Number(curr.monto_total) || 0), 0);

  const filtrados = pagos.filter(p => {
    const nombreCompleto = `${p.alumnos?.apellido} ${p.alumnos?.nombre}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase());
  });

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-[#84bd00] animate-pulse uppercase">
      <Loader2 className="animate-spin mr-3" /> Sincronizando Caja Santa Catalina...
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-12 bg-[#fcfaf7] font-sans text-[#1a3a5f]">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-4 hover:text-[#1a3a5f] transition">
              <ArrowLeft size={16} /> Volver
            </button>
            <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">
              Control <span className="text-[#84bd00]">Cobranzas</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 italic">
              I.A.D. SANTA CATALINA • TESORERÍA v3.8
            </p>
          </div>

          {/* 📊 INDICADORES DE BALANCE GENERAL (Solo Director) */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-white flex items-center gap-4 min-w-[200px]">
              <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-100">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Recaudación Mes</p>
                <p className="text-xl font-black text-emerald-600 mt-1 font-mono">${balanceMensual.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-[#1a3a5f] p-6 rounded-3xl shadow-xl flex items-center gap-4 min-w-[200px]">
              <div className="bg-white/10 text-[#84bd00] p-3 rounded-2xl">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">Total Anual</p>
                <p className="text-xl font-black text-white mt-1 font-mono">${balanceAnual.toLocaleString()}</p>
              </div>
            </div>

            <button 
              onClick={() => navigate('/generar-facturas')}
              className="bg-[#1a3a5f] text-white px-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#84bd00] transition-all flex items-center gap-3"
            >
              <Receipt size={20}/> GENERAR LOTE MENSUAL
            </button>
          </div>
        </header>

        <div className="relative mb-10">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
          <input 
            type="text" 
            placeholder="BUSCAR ALUMNO..." 
            className="w-full pl-20 pr-10 py-7 bg-white rounded-[2.5rem] outline-none font-bold text-sm shadow-sm border border-white focus:ring-4 focus:ring-[#84bd00]/5 uppercase"
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-white">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase">Alumno / DNI</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase">Período</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase">Total</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase">Estado</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase text-right">Cobro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-8">
                    <p className="font-black uppercase text-sm">{p.alumnos?.apellido}, {p.alumnos?.nombre}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">DNI: {p.alumnos?.dni}</p>
                  </td>
                  <td className="p-8 font-bold text-xs">{p.mes_facturado}/{p.anio_facturado}</td>
                  <td className="p-8 font-black text-sm text-[#1a3a5f] font-mono">$ {p.monto_total?.toLocaleString()}</td>
                  <td className="p-8">
                    <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase flex items-center gap-2 w-fit ${p.estado === 'pagado' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {p.estado === 'pagado' ? <CheckCircle size={14}/> : <Clock size={14}/>} {p.estado}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    <button onClick={() => navigate(`/registrar-pago/${p.alumno_id}`)} className="p-4 bg-gray-100 text-gray-400 rounded-2xl hover:bg-[#84bd00] hover:text-white transition-all shadow-sm">
                      <DollarSign size={20}/>
                    </button>
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

export default ListaCobranzas;