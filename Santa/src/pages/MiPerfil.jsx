import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  User, Mail, Briefcase, Shield, Save, FileText, 
  ArrowLeft, MapPin, IdCard, Phone, Upload, CheckCircle, Lock 
} from 'lucide-react';

const MiPerfil = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetPerfil, setTargetPerfil] = useState({
    nombre_completo: '', profesion: '', rol: '', email: '', 
    dni: '', cuit: '', domicilio: '', celular: '',
    url_dni_frente: '', url_dni_dorso: '', url_cv: '', url_titulo: '', 
    url_seguro: '', url_matricula: '', url_cbu: ''
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

  const cargosRaw = [
    "Psicopedagogía", "Fonoaudiología", "Kinesiología", "Estimulación del Lenguaje",
    "Estimulación Visual", "Maestra Integradora", "Docente Orientadora de Sala", 
    "Auxiliar de Sala", "Medico Clinico", "Terapia Ocupacional", "Docente de Apoyo", 
    "Psicología", "Psicomotricidad", "Trabajo Social", "Nutrición", "Administración"
  ];
  const listaCargos = [...cargosRaw].sort((a, b) => a.localeCompare('es'));

  const esDirector = currentUser?.rol === 'director' || currentUser?.rol === 'administrador';
  const esPropioPerfil = !id || id === currentUser?.id;

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/'); return; }
        const { data: currentP } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
        setCurrentUser(currentP);

        const targetId = id || user.id;
        const { data: targetP } = await supabase.from('perfiles').select('*').eq('id', targetId).single();
        if (targetP) setTargetPerfil(targetP);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    }
    loadData();
  }, [id, navigate]);

  const handleFileUpload = async (e, campo) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(campo);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${targetPerfil.id}/${campo}_${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('legajos_profesionales').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('legajos_profesionales').getPublicUrl(filePath);
      await supabase.from('perfiles').update({ [campo]: publicUrl }).eq('id', targetPerfil.id);
      
      setTargetPerfil({ ...targetPerfil, [campo]: publicUrl });
      alert("Documento subido con éxito.");
    } catch (error) { alert("Error al subir: " + error.message); } 
    finally { setUploading(null); }
  };

  const handleUpdate = async () => {
    // Validación de contraseña antes de procesar
    if (password && password !== confirmPassword) {
      alert("Las contraseñas no coinciden. Por favor, verificalas.");
      return;
    }

    const updates = {
      nombre_completo: targetPerfil.nombre_completo,
      profesion: targetPerfil.profesion,
      dni: targetPerfil.dni,
      cuit: targetPerfil.cuit,
      domicilio: targetPerfil.domicilio,
      celular: targetPerfil.celular,
      ...(esDirector && !esPropioPerfil && { rol: targetPerfil.rol })
    };

    try {
      const { error } = await supabase.from('perfiles').update(updates).eq('id', targetPerfil.id);
      if (error) throw error;

      if (password && esPropioPerfil) {
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        setPassword('');
        setConfirmPassword('');
        alert("Perfil y contraseña actualizados correctamente.");
      } else {
        alert("Perfil actualizado correctamente.");
      }
    } catch (error) { alert("Error: " + error.message); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#84bd00] animate-pulse">Sincronizando Legajo...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-transparent font-sans text-gray-800 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-8">
          <button onClick={() => navigate(esPropioPerfil ? '/dashboard' : '/personal')} className="flex items-center gap-2 text-gray-500 font-black uppercase text-[10px] hover:text-[#84bd00] transition bg-white/50 px-4 py-2 rounded-full shadow-sm">
            <ArrowLeft size={18} /> Volver
          </button>
        </header>

        <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-100">
          {/* HEADER TARJETA */}
          <div className="bg-[#84bd00] p-10 text-white flex items-center gap-6">
            <div className="bg-white/20 p-4 rounded-3xl"><User size={48}/></div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{esPropioPerfil ? 'Mi Perfil' : 'Legajo Digital'}</h1>
              <p className="text-green-100 text-[10px] font-bold uppercase mt-2">v2.0 • Instituto Santa Catalina</p>
            </div>
          </div>

          <div className="p-10 space-y-12">
            
            {/* 1. IDENTIDAD Y CONTACTO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3"><h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2"><IdCard size={14}/> Identidad y Contacto</h3></div>
              
              <div><label className="text-[9px] font-black uppercase text-gray-500 ml-3 block mb-1">DNI</label>
              <input className="w-full p-5 bg-gray-50 rounded-3xl border-none font-bold text-gray-700 shadow-inner" value={targetPerfil.dni || ''} onChange={(e) => setTargetPerfil({...targetPerfil, dni: e.target.value})} /></div>
              
              <div><label className="text-[9px] font-black uppercase text-gray-500 ml-3 block mb-1">CUIL / CUIT</label>
              <input className="w-full p-5 bg-gray-50 rounded-3xl border-none font-bold text-gray-700 shadow-inner" value={targetPerfil.cuit || ''} onChange={(e) => setTargetPerfil({...targetPerfil, cuit: e.target.value})} /></div>
              
              <div><label className="text-[9px] font-black uppercase text-gray-500 ml-3 block mb-1">Celular</label>
              <div className="relative"><input className="w-full p-5 pl-12 bg-gray-50 rounded-3xl border-none font-bold text-gray-700 shadow-inner" value={targetPerfil.celular || ''} onChange={(e) => setTargetPerfil({...targetPerfil, celular: e.target.value})} /><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} /></div></div>
              
              <div className="md:col-span-2"><label className="text-[9px] font-black uppercase text-gray-500 ml-3 block mb-1">Domicilio Particular</label>
              <input className="w-full p-5 bg-gray-50 rounded-3xl border-none font-bold text-gray-700 shadow-inner" value={targetPerfil.domicilio || ''} onChange={(e) => setTargetPerfil({...targetPerfil, domicilio: e.target.value})} /></div>
              
              <div><label className="text-[9px] font-black uppercase text-gray-500 ml-3 block mb-1">Cargo</label>
              <select className="w-full p-5 bg-gray-50 rounded-3xl border-none font-bold text-gray-700 shadow-inner" value={targetPerfil.profesion || ''} onChange={(e) => setTargetPerfil({...targetPerfil, profesion: e.target.value})}>
                <option value="">Seleccionar...</option>
                {listaCargos.map(c => <option key={c} value={c}>{c}</option>)}
              </select></div>
            </div>

            {/* 2. SEGURIDAD Y CLAVES (LA PARTE QUE FALTABA) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t pt-10">
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2"><Shield size={14}/> Acceso</h3>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-3 block mb-1">Nombre Completo</label>
                  <input className="w-full p-5 bg-gray-50 rounded-3xl border-none font-bold text-gray-700 shadow-inner" value={targetPerfil.nombre_completo || ''} onChange={(e) => setTargetPerfil({...targetPerfil, nombre_completo: e.target.value})} />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-3 block mb-1">Rol de Sistema</label>
                  <select disabled={!(esDirector && !esPropioPerfil)} className="w-full p-5 bg-gray-100 text-gray-500 rounded-3xl border-none font-black uppercase text-xs shadow-inner opacity-70" value={targetPerfil.rol || 'docente'} onChange={(e) => setTargetPerfil({...targetPerfil, rol: e.target.value})}>
                    <option value="director">Director</option>
                    <option value="docente">Docente / Profesional</option>
                    <option value="administrador">Administrativo</option>
                  </select>
                </div>
              </div>

              {esPropioPerfil && (
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest border-b pb-2 flex items-center gap-2"><Lock size={14}/> Cambiar Contraseña</h3>
                  <div className="bg-orange-50 p-6 rounded-[2.5rem] border border-orange-100 space-y-4 shadow-sm">
                    <input type="password" placeholder="Nueva Contraseña" className="w-full p-4 rounded-2xl border-none shadow-inner text-sm font-bold" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <input type="password" placeholder="Confirmar Contraseña" className="w-full p-4 rounded-2xl border-none shadow-inner text-sm font-bold" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <p className="text-[8px] font-bold text-orange-400 uppercase text-center">Debe coincidir para guardar</p>
                  </div>
                </div>
              )}
            </div>

            {/* 3. DOCUMENTACIÓN DIGITAL (LOS 7 REQUISITOS) */}
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-4 mb-6 flex items-center gap-2"><FileText size={14}/> Archivos del Legajo</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { id: 'url_dni_frente', label: 'DNI Frente' },
                  { id: 'url_dni_dorso', label: 'DNI Dorso' },
                  { id: 'url_cv', label: 'Curriculum Vitae' },
                  { id: 'url_titulo', label: 'Título / Analítico' },
                  { id: 'url_seguro', label: 'Seguro / Mala Praxis' },
                  { id: 'url_cbu', label: 'Constancia CBU' },
                  { id: 'url_matricula', label: 'Matrícula Prof.' }
                ].map((doc) => (
                  <div key={doc.id}>
                    <label className={`flex flex-col items-center justify-center p-6 rounded-[2.5rem] border-2 border-dashed transition-all cursor-pointer h-36 ${targetPerfil[doc.id] ? 'border-[#84bd00] bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-[#84bd00]'}`}>
                      <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, doc.id)} disabled={uploading === doc.id} />
                      {uploading === doc.id ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#84bd00]"></div>
                      ) : targetPerfil[doc.id] ? (
                        <>
                          <CheckCircle className="text-[#84bd00] mb-2" size={24}/>
                          <span className="text-[8px] font-black text-[#84bd00] uppercase text-center">{doc.label}</span>
                          <div className="flex gap-2 mt-2">
                            <a href={targetPerfil[doc.id]} target="_blank" rel="noreferrer" className="text-[7px] font-black text-white bg-[#84bd00] px-3 py-1 rounded-full uppercase shadow-sm shadow-green-200">Ver</a>
                            <span className="text-[7px] font-black text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 uppercase">Cambiar</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="text-gray-300 mb-2" size={24}/>
                          <span className="text-[9px] font-black text-gray-500 uppercase text-center leading-tight">{doc.label}</span>
                        </>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 bg-gray-50 border-t flex justify-end">
              <button onClick={handleUpdate} className="bg-[#84bd00] text-white px-10 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95">
                <Save size={20}/> Guardar Legajo Completo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiPerfil;