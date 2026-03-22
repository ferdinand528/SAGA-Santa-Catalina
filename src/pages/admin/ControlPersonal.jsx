import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, User, FileCheck, FileX, Mail, 
  Phone, MapPin, Edit, Eye, Plus, Printer, 
  XCircle, ExternalLink, Download, Maximize2, UserX, UserCheck 
} from 'lucide-react';

const NOMBRE_BUCKET = 'documentacion_personal'; 

const ControlPersonal = () => {
  const navigate = useNavigate();
  const [personal, setPersonal] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vistaPrevia, setVistaPrevia] = useState(null); 

  useEffect(() => {
    cargarPersonal();
  }, []);

  async function cargarPersonal() {
    setLoading(true);
    const { data } = await supabase.from('perfiles').select('*').order('nombre_completo');
    setPersonal(data || []);
    setLoading(false);
  }

  // --- NUEVA FUNCIÓN PARA CAMBIAR ESTADO (BAJA LÓGICA) ---
  const toggleEstado = async (id, nombre, estadoActual) => {
    const nuevoEstado = !estadoActual;
    const accion = nuevoEstado ? 'ACTIVAR' : 'DESACTIVAR';
    
    if (window.confirm(`¿Seguro desea ${accion} a ${nombre}?\n${nuevoEstado ? 'Recuperará acceso al sistema.' : 'Perderá acceso pero se conservará su legajo.'}`)) {
      const { error } = await supabase
        .from('perfiles')
        .update({ activo: nuevoEstado })
        .eq('id', id);
      
      if (error) {
        alert("Error al cambiar estado: " + error.message);
      } else {
        await cargarPersonal();
      }
    }
  };

  const obtenerUrlDoc = (userId, campoDoc) => {
    const { data } = supabase.storage.from(NOMBRE_BUCKET).getPublicUrl(`${userId}/${campoDoc}`);
    return data?.publicUrl;
  };

  const imprimirDocumentoSolo = (url) => {
    const ventana = window.open(url, '_blank');
    ventana.onload = () => { ventana.print(); };
  };

  const descargarArchivo = async (url, nombreArchivo) => {
    try {
      const respuesta = await fetch(url);
      const blob = await respuesta.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `LEGAJO_${seleccionado.nombre_completo}_${nombreArchivo}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) { alert("Error al descargar"); }
  };

  const filtrados = personal.filter(p => 
    p.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-[#84bd00] animate-pulse uppercase text-xs">
      Sincronizando Staff Santa Catalina...
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-12 bg-[#fcfaf7] font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {!seleccionado && (
          <div className="print:hidden animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
              <div>
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-4 hover:text-[#1a3a5f]">
                  <ArrowLeft size={16} /> VOLVER AL PANEL
                </button>
                <h1 className="text-6xl font-black text-[#1a3a5f] uppercase tracking-tighter leading-none">
                  Staff <span className="text-[#1a3a5f]">Profesional</span>
                </h1>
                <p className="text-[10px] font-black text-[#84bd00] uppercase tracking-widest mt-2 italic font-black">SANTA CATALINA • GESTIÓN DE ESTADOS v4.9</p>
              </div>
              <button onClick={() => navigate('/registro-personal')} className="bg-[#84bd00] text-white px-8 py-5 rounded-[1.5rem] font-black uppercase text-[10px] shadow-xl flex items-center gap-3">
                <Plus size={20}/> ALTA DE PERSONAL
              </button>
            </header>

            <div className="relative mb-12">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
              <input type="text" placeholder="BUSCAR PROFESIONAL..." className="w-full pl-20 pr-10 py-8 bg-white rounded-[2.5rem] outline-none font-bold text-sm shadow-sm border border-white focus:ring-4 focus:ring-[#84bd00]/5 uppercase" onChange={(e) => setBusqueda(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 gap-6 mb-20">
              {filtrados.map(p => (
                <div key={p.id} className={`bg-white p-8 rounded-[2.5rem] shadow-sm border border-white flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all ${!p.activo ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                  <div className="flex items-center gap-8 flex-1">
                    <div className={`${p.activo ? 'bg-[#1a3a5f]' : 'bg-gray-400'} p-6 rounded-3xl text-white shadow-lg`}>
                      <User size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-[#1a3a5f] uppercase tracking-tighter leading-none">{p.nombre_completo}</h3>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black ${p.activo ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {p.activo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </div>
                      <p className="text-[10px] font-black text-[#84bd00] uppercase tracking-widest mt-2">{p.rol}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSeleccionado(p)} className="bg-[#1a3a5f] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 hover:bg-[#84bd00] shadow-lg transition-all"><Eye size={18}/> EXPEDIENTE</button>
                    <div className="flex gap-2 border-l pl-4 border-gray-100">
                      <button onClick={() => navigate(`/perfil/${p.id}`)} className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><Edit size={22} /></button>
                      
                      {/* --- BOTÓN DE ESTADO (Reemplaza al de Borrar) --- */}
                      <button 
                        onClick={() => toggleEstado(p.id, p.nombre_completo, p.activo)} 
                        className={`p-4 rounded-2xl transition-all ${p.activo ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}
                        title={p.activo ? 'Desactivar' : 'Activar'}
                      >
                        {p.activo ? <UserX size={22} /> : <UserCheck size={22} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VISTA EXPEDIENTE --- */}
        {seleccionado && (
          <div className="animate-fade-in print:static print:bg-white print:p-0">
            <div className="flex justify-between items-center mb-10 print:hidden">
              <button onClick={() => setSeleccionado(null)} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-red-500 transition"><XCircle size={24}/> CERRAR</button>
              <button onClick={() => window.print()} className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 shadow-xl"><Printer size={18}/> IMPRIMIR CARPETA</button>
            </div>

            <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl border border-white mb-10 print:shadow-none print:p-0 relative overflow-hidden">
              <div className="hidden print:flex absolute inset-0 z-0 items-center justify-center pointer-events-none opacity-[0.06]"><img src="/logo-instituto.jpeg" alt="" className="w-[80%] grayscale" /></div>
              
              <div className="relative z-10">
                <header className="flex justify-between items-start mb-12 border-b-4 border-gray-800 pb-10">
                  <div className="text-left">
                    <div className="flex items-center gap-4">
                      <h1 className="text-5xl font-black text-[#1a3a5f] uppercase tracking-tighter leading-none">{seleccionado.nombre_completo}</h1>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${seleccionado.activo ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {seleccionado.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-3 italic">SANTA CATALINA • LEGAJO DIGITAL</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[#1a3a5f] uppercase tracking-widest font-black">I.A.D. SANTA CATALINA</p>
                  </div>
                </header>

                {/* ... (Resto del expediente: Datos y Grilla de archivos igual a v4.8) ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
                  <div className="space-y-6">
                    <h3 className="text-[11px] font-black text-[#1a3a5f] uppercase tracking-[0.3em] border-b-2 border-[#84bd00] pb-2 w-fit">Datos Identidad</h3>
                    <p className="text-sm font-bold text-gray-500 uppercase">DNI: <span className="text-black ml-2 font-black text-lg">{seleccionado.dni}</span></p>
                    <p className="text-sm font-bold text-gray-500 uppercase">CUIT: <span className="text-black ml-2 font-black">{seleccionado.cuit}</span></p>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-[11px] font-black text-[#1a3a5f] uppercase tracking-[0.3em] border-b-2 border-[#84bd00] pb-2 w-fit">Contacto</h3>
                    <p className="text-sm font-bold text-gray-500 uppercase">Celular: <span className="text-black ml-2 font-black">{seleccionado.celular || 'S/D'}</span></p>
                    <p className="text-sm font-bold text-gray-500 uppercase">Domicilio: <span className="text-black ml-2">{seleccionado.domicilio || 'S/D'}</span></p>
                  </div>
                </div>

                <div className="bg-gray-50 p-10 rounded-[3.5rem] border border-gray-100 print:bg-white print:border-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {[
                      { label: 'DNI F.', id: 'doc_dni_frente' }, { label: 'DNI A.', id: 'doc_dni_atras' },
                      { label: 'CV', id: 'doc_cv' }, { label: 'Título', id: 'doc_titulo' },
                      { label: 'Cond.', id: 'doc_conducta' }, { label: 'AFIP', id: 'doc_afip' },
                      { label: 'CBU', id: 'doc_cbu' }
                    ].map((doc, idx) => {
                      const tiene = seleccionado[doc.id];
                      const url = tiene ? obtenerUrlDoc(seleccionado.id, doc.id) : null;
                      return (
                        <div key={idx} onClick={() => tiene && setVistaPrevia({ url, label: doc.label })} className={`flex flex-col items-center gap-3 p-5 rounded-3xl border transition-all cursor-pointer ${tiene ? 'bg-white border-[#84bd00]/40' : 'bg-gray-100 opacity-40'}`}>
                          {tiene ? <FileCheck className="text-[#84bd00]" size={30}/> : <FileX className="text-gray-300" size={30}/>}
                          <span className="text-[7px] font-black uppercase text-center text-gray-400 leading-tight">{doc.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL VISUALIZADOR --- */}
        {vistaPrevia && (
          <div className="fixed inset-0 z-[100] bg-[#1a3a5f]/95 flex items-center justify-center p-4 md:p-10 animate-fade-in backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border-8 border-white">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="bg-[#1a3a5f] text-white p-3 rounded-2xl"><Eye size={20}/></div>
                  <div><h4 className="text-xs font-black text-[#1a3a5f] uppercase tracking-widest">{vistaPrevia.label}</h4><p className="text-[10px] font-bold text-gray-400 uppercase">{seleccionado?.nombre_completo}</p></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => imprimirDocumentoSolo(vistaPrevia.url)} className="bg-black text-white px-5 py-3 rounded-xl font-black text-[9px] uppercase flex items-center gap-2 shadow-md"><Printer size={14}/> IMPRIMIR</button>
                  <button onClick={() => descargarArchivo(vistaPrevia.url, vistaPrevia.label)} className="bg-[#84bd00] text-white px-5 py-3 rounded-xl font-black text-[9px] uppercase flex items-center gap-2 shadow-md"><Download size={14}/> DESCARGAR</button>
                  <button onClick={() => setVistaPrevia(null)} className="text-gray-400 hover:text-red-500 transition-all ml-4"><XCircle size={32}/></button>
                </div>
              </div>
              <div className="flex-1 bg-gray-200 flex items-center justify-center overflow-auto p-4"><img src={vistaPrevia.url} alt={vistaPrevia.label} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg border-2 border-white" /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPersonal;