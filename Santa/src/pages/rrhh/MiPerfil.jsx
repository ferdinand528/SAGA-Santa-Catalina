import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Mail, Fingerprint, Briefcase, 
  FileText, ShieldCheck, Key, UploadCloud, Loader2, 
  CheckCircle, Lock, MapPin, Phone 
} from 'lucide-react';

const MiPerfil = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [perfil, setPerfil] = useState({
    nombre_completo: '', 
    email: '', 
    dni: '', 
    cuit: '', 
    domicilio: '',
    celular: '',
    rol: '',
    password: '', 
    repetir_password: ''
  });

  const [docs, setDocs] = useState({
    doc_dni_frente: false, doc_dni_atras: false, doc_cv: false,
    doc_titulo: false, doc_conducta: false, doc_afip: false, doc_cbu: false
  });

  useEffect(() => {
    async function cargarDatos() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const targetId = id || user.id;
        
        const { data, error } = await supabase.from('perfiles').select('*').eq('id', targetId).single();
        if (error) throw error;
        
        // Sincronizamos todos los datos existentes
        setPerfil({
          ...data,
          password: '',
          repetir_password: ''
        });

        setDocs({
          doc_dni_frente: data.doc_dni_frente || false,
          doc_dni_atras: data.doc_dni_atras || false,
          doc_cv: data.doc_cv || false,
          doc_titulo: data.doc_titulo || false,
          doc_conducta: data.doc_conducta || false,
          doc_afip: data.doc_afip || false,
          doc_cbu: data.doc_cbu || false
        });
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, [id]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (perfil.password && perfil.password !== perfil.repetir_password) {
      alert("Las nuevas claves no coinciden.");
      return;
    }

    setSaving(true);
    try {
      const updates = {
        nombre_completo: perfil.nombre_completo.toUpperCase(),
        dni: perfil.dni,
        cuit: perfil.cuit,
        domicilio: perfil.domicilio.toUpperCase(),
        celular: perfil.celular,
        ...docs
      };

      if (perfil.password) {
        const { error: authError } = await supabase.auth.updateUser({ password: perfil.password });
        if (authError) throw authError;
      }

      const { error } = await supabase.from('perfiles').update(updates).eq('id', perfil.id);
      if (error) throw error;

      alert("Carpeta Digital actualizada correctamente.");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const DocSlot = ({ label, campo }) => (
    <div 
      onClick={() => setDocs({...docs, [campo]: !docs[campo]})}
      className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 cursor-pointer transition-all active:scale-95 ${docs[campo] ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-dashed border-gray-200 hover:border-[#84bd00]'}`}
    >
      <div className={`p-4 rounded-2xl ${docs[campo] ? 'bg-green-100 text-green-600 shadow-sm' : 'bg-white text-gray-300 shadow-sm'}`}>
        {docs[campo] ? <CheckCircle size={24}/> : <UploadCloud size={24}/>}
      </div>
      <span className={`text-[8px] font-black uppercase text-center tracking-tighter ${docs[campo] ? 'text-green-600' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-[#84bd00] animate-pulse uppercase text-xs">
      Cargando Datos del Personal...
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#fcfaf7] animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-[#84bd00] transition bg-white px-4 py-2 rounded-full shadow-sm w-fit">
          <ArrowLeft size={16} /> Volver al Panel Principal
        </button>

        <form onSubmit={handleGuardar} className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white overflow-hidden">
          
          <div className="bg-[#1a3a5f] p-10 text-white flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="bg-white/10 p-4 rounded-3xl"><Briefcase size={40} /></div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{perfil.nombre_completo}</h2>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-2 italic">Legajo RRHH • Carpeta Digital v3.1</p>
              </div>
            </div>
            <div className="bg-[#84bd00] px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
              {perfil.rol}
            </div>
          </div>

          <div className="p-10 space-y-12">
            
            {/* SECCIÓN 1: DATOS MODIFICABLES (INCLUYE CELULAR Y DOMICILIO) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-4">Nombre Completo</label>
                <input required value={perfil.nombre_completo} className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-[#84bd00]" onChange={e => setPerfil({...perfil, nombre_completo: e.target.value.toUpperCase()})} />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-4">DNI</label>
                <input required value={perfil.dni} className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-[#84bd00]" onChange={e => setPerfil({...perfil, dni: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-4">CUIL / CUIT</label>
                <input required value={perfil.cuit} className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-[#84bd00]" onChange={e => setPerfil({...perfil, cuit: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-4 flex items-center gap-2"><MapPin size={10}/> Domicilio Actual</label>
                <input required value={perfil.domicilio} className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-[#84bd00]" onChange={e => setPerfil({...perfil, domicilio: e.target.value.toUpperCase()})} />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-4 flex items-center gap-2"><Phone size={10}/> Celular de Contacto</label>
                <input required value={perfil.celular} className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-[#84bd00]" onChange={e => setPerfil({...perfil, celular: e.target.value})} />
              </div>

              {/* BLOQUEADO: CORREO */}
              <div className="space-y-1 opacity-60">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-4 flex items-center gap-2"><Lock size={10}/> Correo de Acceso</label>
                <div className="w-full p-5 bg-gray-100 rounded-2xl font-bold text-sm text-gray-500 flex items-center gap-3 cursor-not-allowed">
                  <Mail size={16}/> {perfil.email}
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: CARPETA DE DOCUMENTACIÓN */}
            <div className="p-8 bg-gray-50/50 rounded-[3.5rem] border border-gray-100 shadow-inner">
              <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <FileText size={20} className="text-[#84bd00]"/>
                <h3 className="text-[10px] font-black text-[#1a3a5f] uppercase tracking-widest">Estado de Carpeta Física (Auditoría)</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <DocSlot label="DNI Frente" campo="doc_dni_frente" />
                <DocSlot label="DNI Atrás" campo="doc_dni_atras" />
                <DocSlot label="CV Actualiz." campo="doc_cv" />
                <DocSlot label="Título" campo="doc_titulo" />
                <DocSlot label="B. Conducta" campo="doc_conducta" />
                <DocSlot label="Const. AFIP" campo="doc_afip" />
                <DocSlot label="Const. CBU" campo="doc_cbu" />
              </div>
            </div>

            {/* SECCIÓN 3: SEGURIDAD */}
            <div className="p-8 bg-blue-50/30 rounded-[3rem] border border-blue-100 space-y-6">
              <div className="flex items-center gap-3 text-blue-600">
                <Key size={20}/>
                <h3 className="text-[10px] font-black uppercase tracking-widest">Cambiar Clave de Ingreso</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="password" placeholder="Nueva Clave" className="p-5 bg-white rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-blue-500" onChange={e => setPerfil({...perfil, password: e.target.value})} />
                <input type="password" placeholder="Confirmar Clave" className="p-5 bg-white rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-blue-500" onChange={e => setPerfil({...perfil, repetir_password: e.target.value})} />
              </div>
            </div>

            <button disabled={saving} className="w-full bg-[#1a3a5f] text-white p-7 rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-[#84bd00] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin" /> : <Save size={24}/>}
              {saving ? 'GUARDANDO CAMBIOS...' : 'ACTUALIZAR MI CARPETA v3.1'}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default MiPerfil;