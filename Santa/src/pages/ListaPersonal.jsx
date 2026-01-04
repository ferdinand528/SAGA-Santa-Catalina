import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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

  useEffect(() => {
    fetchPersonal();
  }, []);

  async function fetchPersonal() {
    try {
      setLoading(true);
      // Traemos todos los campos, incluyendo las URLs de los documentos
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .order('nombre_completo', { ascending: true });

      if (error) throw error;
      setPersonal(data || []);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  const filtrados = personal.filter(p => 
    `${p.nombre_completo} ${p.profesion}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Componente interno para los botones de descarga
  const BotonDocumento = ({ url, etiqueta }) => {
    if (!url) return null; // Si no hay archivo, no mostramos el botón
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
    <div className="h-screen flex items-center justify-center text-[#84bd00] font-black uppercase tracking-widest text-xs">
      Abriendo Archivo General...
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-4 hover:text-[#84bd00] transition">
              <ArrowLeft size={16} /> Volver al Panel
            </button>
            <h1 className="text-4xl font-black text-[#1a3a5f] tracking-tighter uppercase leading-none">Staff Profesional</h1>
            <p className="text-[10px] font-black text-[#84bd00] uppercase tracking-[0.3em] mt-2">
              S.A.G.A ver 1.5 • Dirección Santa Catalina
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/registro-personal')} 
            className="bg-[#84bd00] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2"
          >
            <UserPlus size={18}/> Alta de Personal
          </button>
        </header>

        <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-sm border border-white/50 p-8">
          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
            <input 
              type="text" placeholder="Buscar por nombre o función..." 
              className="w-full pl-14 pr-6 py-5 bg-gray-50/50 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-[#84bd00]/10"
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="space-y-6">
            {filtrados.map(p => (
              <div key={p.id} className="bg-white/40 border border-gray-100 rounded-3xl p-6 hover:border-[#84bd00]/30 transition-all">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  
                  {/* IDENTIDAD */}
                  <div className="flex items-center gap-5">
                    <div className="bg-gray-800 p-4 rounded-2xl text-white shadow-lg"><User size={24} /></div>
                    <div>
                      <h3 className="text-xl font-black text-[#1a3a5f] uppercase tracking-tight">{p.nombre_completo}</h3>
                      <p className="text-[10px] font-black text-[#84bd00] uppercase tracking-widest flex items-center gap-2">
                        <Briefcase size={12}/> {p.profesion} • {p.rol === 'director' ? 'Administración' : 'Cuerpo Docente'}
                      </p>
                    </div>
                  </div>

                  {/* ACCIONES DE EDICIÓN */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/editar-personal/${p.id}`)} className="p-4 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-800 hover:text-white transition-all"><Edit size={20}/></button>
                    <button className="p-4 bg-red-50 text-red-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20}/></button>
                  </div>
                </div>

                {/* SECCIÓN DE LEGAJO DIGITAL (Botones de Descarga) */}
                <div className="mt-6 pt-6 border-t border-dashed border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <DownloadCloud size={14} className="text-gray-400" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Expediente Digital:</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {/* Verificamos cada campo que agregamos en el perfil */}
                    <BotonDocumento url={p.url_dni} etiqueta="DNI" />
                    <BotonDocumento url={p.url_cv} etiqueta="CV" />
                    <BotonDocumento url={p.url_buena_conducta} etiqueta="Conducta" />
                    <BotonDocumento url={p.url_afip} etiqueta="AFIP" />
                    <BotonDocumento url={p.url_titulo} etiqueta="Título" />
                    <BotonDocumento url={p.url_cuil} etiqueta="CUIL" />
                    
                    {/* Si no tiene nada subido, mostramos aviso */}
                    {!(p.url_dni || p.url_cv || p.url_buena_conducta || p.url_afip || p.url_titulo || p.url_cuil) && (
                      <p className="text-[8px] font-bold text-gray-300 italic uppercase">Sin documentación digital cargada</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-20 py-10 text-center opacity-30">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
          version 1.5 <span className="mx-2 text-[#84bd00]">|</span> diciembre 2025
        </p>
      </footer>
    </div>
  );
};

export default ListaPersonal;