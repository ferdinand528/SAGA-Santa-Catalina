import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from "../../lib/supabase";
import { useNavigate } from 'react-router-dom';
import { 
  Search, UserPlus, Edit, Trash2, User, 
  Loader2, ArrowLeft, FileText, ExternalLink, 
  Briefcase, DownloadCloud 
} from 'lucide-react';

const ListaPersonal = () => {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  // 1. CARGA DE DATOS: Solo activos
  const fetchPersonal = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('activo', true) // Filtro para Santa Catalina v2.1
        .order('nombre_completo', { ascending: true });

      if (error) throw error;
      setPersonal(data || []);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonal();
  }, [fetchPersonal]);

  // 2. LÓGICA DE ARCHIVACIÓN (SOFT DELETE)
  const archivarPersonal = async (id, nombre) => {
    const confirmar = window.confirm(`¿Desea enviar al ARCHIVO PASIVO al profesional ${nombre}?`);
    
    if (confirmar) {
      try {
        const { error } = await supabase
          .from('perfiles')
          .update({ activo: false })
          .eq('id', id);

        if (error) throw error;

        // Quitamos de la lista local para feedback instantáneo
        setPersonal(prev => prev.filter(p => p.id !== id));
        alert("Personal archivado correctamente.");
      } catch (error) {
        alert("Error al archivar: " + error.message);
      }
    }
  };

  const filtrados = personal.filter(p => 
    `${p.nombre_completo} ${p.profesion}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const BotonDocumento = ({ url, etiqueta }) => {
    if (!url) return null;
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-[#84bd00] hover:text-white transition-all text-[9px] font-black uppercase tracking-tighter border border-gray-100"
      >
        <FileText size={12} /> {etiqueta}
      </a>
    );
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-[#84bd00] font-black uppercase tracking-widest text-xs italic animate-pulse">
      Sincronizando Archivo General v2.1...
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#fcfaf7] animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-4 hover:text-[#84bd00] transition bg-white px-4 py-2 rounded-full shadow-sm">
              <ArrowLeft size={16} /> Volver al Panel
            </button>
            <h1 className="text-4xl font-black text-[#1a3a5f] tracking-tighter uppercase leading-none">Staff Profesional</h1>
            <p className="text-[10px] font-black text-[#84bd00] uppercase tracking-[0.3em] mt-2 italic">
              Santa Catalina • Gestión Directiva v2.1
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/registro-personal')} 
            className="bg-[#84bd00] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <UserPlus size={18}/> Alta de Personal
          </button>
        </header>

        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-8">
          <div className="relative mb-8">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={22} />
            <input 
              type="text" placeholder="BUSCAR POR NOMBRE O FUNCIÓN..." 
              className="w-full pl-16 pr-6 py-6 bg-gray-50/50 rounded-[2rem] outline-none font-bold text-sm focus:ring-4 focus:ring-[#84bd00]/10 border-none shadow-inner"
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="space-y-6">
            {filtrados.map(p => (
              <div key={p.id} className="bg-white border border-gray-50 rounded-[2.5rem] p-8 hover:border-[#84bd00]/30 transition-all hover:shadow-lg group">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  
                  {/* IDENTIDAD */}
                  <div className="flex items-center gap-6">
                    <div className="bg-[#1a3a5f] p-5 rounded-3xl text-white shadow-lg group-hover:bg-[#84bd00] transition-colors">
                      <User size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#1a3a5f] uppercase tracking-tight leading-none mb-1">{p.nombre_completo}</h3>
                      <p className="text-[10px] font-black text-[#84bd00] uppercase tracking-widest flex items-center gap-2">
                        <Briefcase size={12}/> {p.profesion} • {p.rol === 'director' ? 'Administración' : 'Cuerpo Docente'}
                      </p>
                    </div>
                  </div>

                  {/* ACCIONES DE GESTIÓN */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => navigate(`/editar-personal/${p.id}`)} 
                      className="p-4 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      title="Editar Datos"
                    >
                      <Edit size={20}/>
                    </button>
                    
                    {/* BOTÓN ARCHIVAR VINCULADO */}
                    <button 
                      onClick={() => archivarPersonal(p.id, p.nombre_completo)}
                      className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      title="Enviar a Archivo Pasivo"
                    >
                      <Trash2 size={20}/>
                    </button>
                  </div>
                </div>

                {/* EXPEDIENTE DIGITAL */}
                <div className="mt-8 pt-6 border-t border-dashed border-gray-100 flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex items-center gap-2 shrink-0">
                    <DownloadCloud size={14} className="text-gray-300" />
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Legajo:</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <BotonDocumento url={p.url_dni_frente} etiqueta="DNI F" />
                    <BotonDocumento url={p.url_dni_dorso} etiqueta="DNI D" />
                    <BotonDocumento url={p.url_cv} etiqueta="CV" />
                    <BotonDocumento url={p.url_buena_conducta} etiqueta="Conducta" />
                    <BotonDocumento url={p.url_afip} etiqueta="AFIP" />
                    <BotonDocumento url={p.url_titulo} etiqueta="Título" />
                    <BotonDocumento url={p.url_cbu} etiqueta="CBU" />
                    
                    {!(p.url_dni_frente || p.url_cv || p.url_buena_conducta || p.url_afip || p.url_titulo || p.url_cbu) && (
                      <p className="text-[8px] font-bold text-gray-300 italic uppercase">Sin documentación digital</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaPersonal;