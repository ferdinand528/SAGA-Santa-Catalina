import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Mail, Briefcase, 
  FileText, Key, UploadCloud, Loader2, 
  CheckCircle, Lock, MapPin, Phone
} from 'lucide-react';

const NOMBRE_BUCKET = 'documentacion_personal';

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

  const [nuevosArchivos, setNuevosArchivos] = useState({});

  useEffect(() => {
    async function cargarDatos() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const targetId = id || user.id;
        
        const { data, error } = await supabase.from('perfiles').select('*').eq('id', targetId).single();
        if (error) throw error;
        
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
      const updatesDocMetadata = {};

      for (const [campo, archivo] of Object.entries(nuevosArchivos)) {
        const extension = archivo.name.split('.').pop();
        const rutaArchivo = `${perfil.id}/${campo}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(NOMBRE_BUCKET)
          .upload(rutaArchivo, archivo, { upsert: true });

        if (uploadError) throw uploadError;
        updatesDocMetadata[campo] = true;
      }

      const updates = {
        nombre_completo: perfil.nombre_completo.toUpperCase(),
        dni: perfil.dni,
        cuit: perfil.cuit,
        domicilio: perfil.domicilio?.toUpperCase(),
        celular: perfil.celular,
        ...docs,
        ...updatesDocMetadata 
      };

      // 🛡️ SOLUCIÓN AL ERROR DE CONTRASEÑA
      if (perfil.password && perfil.password.trim().length >= 6) {
        const { error: authError } = await supabase.auth.updateUser({ password: perfil.password });
        
        if (authError) {
          // Si el error es que la clave es igual a la anterior, lo ignoramos para que guarde el resto de los datos
          if (!authError.message.includes("should be different")) {
            throw authError;
          }
        }
      }

      const { error } = await supabase.from('perfiles').update(updates).eq('id', perfil.id);
      if (error) throw error;

      alert("Legajo y Archivos actualizados correctamente.");
      
      // Limpiamos los campos de password después de guardar con éxito
      setPerfil(prev => ({ ...prev, password: '', repetir_password: '' }));
      setNuevosArchivos({}); 

    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const DocSlot = ({ label, campo }) => {
    const tieneArchivoEnDB = docs[campo];
    const tieneArchivoNuevo = nuevosArchivos[campo];

    return (
      <div className="relative group">
        <input 
          type="file" 
          accept="image/*,application/pdf"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setNuevosArchivos({ ...nuevosArchivos, [campo]: file });
              setDocs({ ...docs, [campo]: true });
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
        <div 
          className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all active:scale-95 ${
            tieneArchivoNuevo 
              ? 'bg-blue-50 border-blue-400 scale-105 shadow-lg' 
              : tieneArchivoEnDB 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-dashed border-gray-200 hover:border-[#84bd00]'
          }`}
        >
          <div className={`p-4 rounded-2xl ${
            tieneArchivoNuevo
              ? 'bg-blue-500 text-white animate-bounce'
              : tieneArchivoEnDB 
                ? 'bg-green-100 text-green-600 shadow-sm' 
                : 'bg-white text-gray-300 shadow-sm'
          }`}>
            {tieneArchivoNuevo ? <CheckCircle size={24}/> : tieneArchivoEnDB ? <FileText size={24}/> : <UploadCloud size={24}/>}
          </div>
          <span className={`text-[8px] font-black uppercase text-center tracking-tighter ${
            tieneArchivoNuevo ? 'text-blue-600' : tieneArchivoEnDB ? 'text-green-600' : 'text-gray-400'
          }`}>
            {tieneArchivoNuevo ? 'LISTO PARA SUBIR' : tieneArchivoEnDB ? `YA CARGADO` : label}
          </span>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-[#84bd00] animate-pulse uppercase text-xs tracking-widest">
      Cargando Legajo Santa Catalina...
    </div>
  );

  return (
    /* 🖼️ CAMBIO: bg-transparent para ver el logo institucional de fondo */
    <div className="min-h-screen p-6 md:p-10 bg-transparent animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-[#84bd00] transition bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm w-fit">
          <ArrowLeft size={16} /> Volver
        </button>

        <form onSubmit={handleGuardar} className="bg-white/90 backdrop-blur-md rounded-[3rem] shadow-2xl border border-white overflow-hidden">
          <div className="bg-[#1a3a5f] p-10 text-white flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="bg-white/10 p-4 rounded-3xl"><Briefcase size={40} /></div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{perfil.nombre_completo}</h2>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-2 italic">Legajo Digital Personal • v4.9</p>
              </div>
            </div>
            <div className="bg-[#84bd00] px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
              {perfil.rol}
            </div>
          </div>

          <div className="p-10 space-y-12">
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

              <div className="space-y-1 opacity-60">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-4 flex items-center gap-2"><Lock size={10}/> Correo Institucional</label>
                <div className="w-full p-5 bg-gray-100 rounded-2xl font-bold text-sm text-gray-500 flex items-center gap-3 cursor-not-allowed border-2 border-transparent">
                  <Mail size={16}/> {perfil.email}
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50/50 rounded-[3.5rem] border border-gray-100 shadow-inner">
              <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <UploadCloud size={20} className="text-[#84bd00]"/>
                <h3 className="text-[10px] font-black text-[#1a3a5f] uppercase tracking-widest italic">Haga clic en un recuadro para subir el archivo (PDF o Imagen)</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <DocSlot label="DNI Frente" campo="doc_dni_frente" />
                <DocSlot label="DNI Atrás" campo="doc_dni_atras" />
                <DocSlot label="CV" campo="doc_cv" />
                <DocSlot label="Título" campo="doc_titulo" />
                <DocSlot label="Cond." campo="doc_conducta" />
                <DocSlot label="AFIP" campo="doc_afip" />
                <DocSlot label="CBU" campo="doc_cbu" />
              </div>
            </div>

            <div className="p-8 bg-blue-50/30 rounded-[3rem] border border-blue-100 space-y-6">
              <div className="flex items-center gap-3 text-blue-600 font-black">
                <Key size={20}/>
                <h3 className="text-[10px] font-black uppercase tracking-widest">Seguridad de la Cuenta</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="password" value={perfil.password} placeholder="Nueva Clave" className="p-5 bg-white rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-blue-500" onChange={e => setPerfil({...perfil, password: e.target.value})} />
                <input type="password" value={perfil.repetir_password} placeholder="Confirmar Clave" className="p-5 bg-white rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-blue-500" onChange={e => setPerfil({...perfil, repetir_password: e.target.value})} />
              </div>
            </div>

            <button disabled={saving} className="w-full bg-[#1a3a5f] text-white p-7 rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-[#84bd00] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin" /> : <Save size={24}/>}
              {saving ? 'PROCESANDO ARCHIVOS...' : 'GUARDAR CAMBIOS EN LEGAJO'}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default MiPerfil;