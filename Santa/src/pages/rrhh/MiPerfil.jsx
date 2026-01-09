import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  User, Save, ArrowLeft, Mail, 
  IdCard, Phone, Upload, CheckCircle, 
  Lock, FileText, Loader2, Hash, ShieldAlert 
} from 'lucide-react';

const MiPerfil = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

  // ESTADO DEL PERFIL CON LOS 7 CAMPOS DE ARCHIVOS SOLICITADOS
  const [targetPerfil, setTargetPerfil] = useState({
    nombre_completo: '', profesion: '', rol: '', email: '', 
    dni: '', cuit: '', domicilio: '', celular: '',
    url_dni_frente: '', url_dni_dorso: '', url_cv: '', 
    url_titulo: '', url_buena_conducta: '', url_afip: '', url_cbu: ''
  });

  const cargosRaw = ["Psicopedagogía", "Fonoaudiología", "Kinesiología", "Nutrición", "Administración", "Docencia"];
  const listaCargos = [...cargosRaw].sort((a, b) => a.localeCompare('es'));

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }
      
      const { data: currentP } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
      setCurrentUser(currentP);

      const targetId = id || user.id;
      const { data: targetP } = await supabase.from('perfiles').select('*').eq('id', targetId).single();
      if (targetP) setTargetPerfil(targetP);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFileUpload = async (e, campo) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(campo);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${targetPerfil.id}/${campo}_${Date.now()}.${fileExt}`;
      const { error: upError } = await supabase.storage.from('legajos_profesionales').upload(fileName, file);
      if (upError) throw upError;

      const { data: { publicUrl } } = supabase.storage.from('legajos_profesionales').getPublicUrl(fileName);
      await supabase.from('perfiles').update({ [campo]: publicUrl }).eq('id', targetPerfil.id);
      setTargetPerfil(prev => ({ ...prev, [campo]: publicUrl }));
      alert("Documento actualizado.");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setUploading(null);
    }
  };

  const handleUpdate = async () => {
    try {
      if (newPassword !== '' && newPassword !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
      }
      const updates = {
        nombre_completo: targetPerfil.nombre_completo,
        profesion: targetPerfil.profesion,
        dni: targetPerfil.dni, 
        cuit: targetPerfil.cuit,
        domicilio: targetPerfil.domicilio, 
        celular: targetPerfil.celular,
      };
      const { error } = await supabase.from('perfiles').update(updates).eq('id', targetPerfil.id);
      if (error) throw error;

      if (newPassword !== '') {
        await supabase.auth.updateUser({ password: newPassword });
        setNewPassword(''); setConfirmPassword('');
      }
      alert("Legajo guardado correctamente.");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#fcfaf7]"><Loader2 className="animate-spin text-[#84bd00]" size={32} /></div>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#fcfaf7] font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] hover:text-[#84bd00] transition bg-white px-4 py-2 rounded-full shadow-sm">
            <ArrowLeft size={18} /> Volver
          </button>
        </header>

        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#84bd00] p-10 text-white flex items-center gap-6">
            <div className="bg-white/20 p-4 rounded-3xl"><User size={48}/></div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{targetPerfil.nombre_completo}</h1>
              <p className="text-green-100 text-[10px] font-black uppercase tracking-widest mt-2 italic">Santa Catalina v2.1 • Carpeta Digital</p>
            </div>
          </div>

          <div className="p-10 space-y-10">
            {/* CORREO (BLOQUEADO Y MINÚSCULA) */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-4 italic">Email Institucional</label>
              <div className="p-5 bg-gray-50 text-gray-400 rounded-3xl font-black text-xs lowercase italic flex items-center gap-3 border border-gray-100">
                <Mail size={16}/> {targetPerfil.email}
              </div>
            </div>

            {/* DATOS PERSONALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none shadow-inner" value={targetPerfil.dni || ''} placeholder="DNI" onChange={(e) => setTargetPerfil({...targetPerfil, dni: e.target.value})} />
              <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none shadow-inner" value={targetPerfil.profesion || ''} onChange={(e) => setTargetPerfil({...targetPerfil, profesion: e.target.value})}>
                 {listaCargos.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none shadow-inner" value={targetPerfil.celular || ''} placeholder="Celular" onChange={(e) => setTargetPerfil({...targetPerfil, celular: e.target.value})} />
              <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none shadow-inner" value={targetPerfil.cuit || ''} placeholder="CUIT" onChange={(e) => setTargetPerfil({...targetPerfil, cuit: e.target.value})} />
            </div>

            {/* LEGAJO DIGITAL: LOS 7 ARCHIVOS REQUERIDOS */}
            <div className="space-y-6 pt-6 border-t border-gray-50">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14}/> Carpeta de Documentación Requerida (PDF/JPG)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { id: 'url_dni_frente', label: 'DNI Frente' },
                  { id: 'url_dni_dorso', label: 'DNI Atrás' },
                  { id: 'url_cv', label: 'CV Actualiz.' },
                  { id: 'url_titulo', label: 'Título' },
                  { id: 'url_buena_conducta', label: 'B. Conducta' },
                  { id: 'url_afip', label: 'Const. AFIP' },
                  { id: 'url_cbu', label: 'Const. CBU' }
                ].map((doc) => (
                  <label key={doc.id} className={`relative flex flex-col items-center justify-center p-4 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer h-32 ${targetPerfil[doc.id] ? 'border-[#84bd00] bg-green-50' : 'border-gray-100 bg-gray-50/50 hover:border-[#84bd00]'}`}>
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, doc.id)} />
                    {uploading === doc.id ? <Loader2 className="animate-spin text-[#84bd00]" /> : targetPerfil[doc.id] ? <CheckCircle className="text-[#84bd00]" /> : <Upload className="text-gray-300" />}
                    <span className={`text-[7px] font-black uppercase mt-2 text-center leading-tight ${targetPerfil[doc.id] ? 'text-[#84bd00]' : 'text-gray-400'}`}>{doc.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* SEGURIDAD CON DOBLE CAMPO */}
            <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 space-y-4">
              <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-2"><Lock size={14}/> Seguridad de Acceso</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="password" placeholder="Nueva Clave" className="w-full p-4 bg-white rounded-2xl font-bold border-none" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <input type="password" placeholder="Repetir Clave" className={`w-full p-4 bg-white rounded-2xl font-bold border-2 transition-all ${confirmPassword && newPassword !== confirmPassword ? 'border-red-300' : 'border-transparent'}`} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>

            <button onClick={handleUpdate} className="w-full bg-[#84bd00] text-white p-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-3">
              <Save size={20}/> Actualizar Mi Legajo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiPerfil;