import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, UserCircle, Phone, Calendar, 
  Lock, Loader2, FileText, Upload, CheckCircle 
} from 'lucide-react';

const MiPerfil = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [form, setForm] = useState({
    nombre_completo: '', celular: '', fecha_nacimiento: '',
    url_dni: '', url_cv: '', url_buena_conducta: '', 
    url_afip: '', url_titulo: '', url_cuil: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
      if (data) setForm(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  // FUNCIÓN PARA SUBIR ARCHIVOS A STORAGE
  const handleFileUpload = async (e, campo) => {
    const file = e.target.files[0];
    if (!file) return;

    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${campo}_${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Subir al bucket 'documentos_personal'
      const { error: uploadError } = await supabase.storage
        .from('documentos_personal')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('documentos_personal')
        .getPublicUrl(filePath);

      setForm(prev => ({ ...prev, [campo]: publicUrl }));
      alert("Documento cargado en memoria. No olvides Guardar Cambios al final.");
    } catch (err) {
      alert("Error al subir: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) return alert("Las claves no coinciden.");

    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Actualizar tabla perfiles
      const { error } = await supabase.from('perfiles').update(form).eq('id', user.id);
      if (error) throw error;

      if (password) await supabase.auth.updateUser({ password });

      alert("Legajo actualizado con éxito.");
      navigate('/dashboard');
    } catch (err) { alert(err.message); } finally { setUpdating(false); }
  };

  const InputFile = ({ label, campo, value }) => (
    <div className="space-y-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex justify-between items-center">
        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        {value && <CheckCircle size={14} className="text-[#84bd00]" />}
      </div>
      <div className="relative">
        <input 
          type="file" 
          accept=".pdf,image/*"
          onChange={(e) => handleFileUpload(e, campo)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
          <Upload size={16} />
          <span className="text-[10px] font-bold uppercase">
            {value ? "Archivo cargado (Click para cambiar)" : "Subir PDF o Imagen"}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#84bd00] uppercase text-xs">Cargando legajo...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-[#fcfaf7] animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-8 hover:text-gray-800 transition">
          <ArrowLeft size={16} /> Volver al Panel
        </button>

        <form onSubmit={handleSave} className="bg-white/90 backdrop-blur-xl rounded-4xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="bg-gray-800 p-10 text-white flex items-center gap-6">
            <UserCircle size={48} />
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Mi Perfil</h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">S.A.G.A v1.5 • Documentación Digital</p>
            </div>
          </div>

          <div className="p-10 space-y-10">
            {/* DATOS PERSONALES */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 border-b pb-2"><h3 className="text-[10px] font-black uppercase text-[#84bd00]">Datos Generales</h3></div>
              <input placeholder="Nombre" className="p-4 bg-gray-50 rounded-xl font-bold text-sm" value={form.nombre_completo} onChange={e => setForm({...form, nombre_completo: e.target.value})} />
              <input placeholder="Celular" className="p-4 bg-gray-50 rounded-xl font-bold text-sm" value={form.celular} onChange={e => setForm({...form, celular: e.target.value})} />
            </section>

            {/* SECCIÓN DE DOCUMENTOS (NUEVA) */}
            <section>
              <div className="border-b pb-2 mb-6"><h3 className="text-[10px] font-black uppercase text-[#84bd00]">Legajo Digital (PDF/Fotos)</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputFile label="DNI (Frente/Dorso)" campo="url_dni" value={form.url_dni} />
                <InputFile label="Curriculum Vitae" campo="url_cv" value={form.url_cv} />
                <InputFile label="Buena Conducta" campo="url_buena_conducta" value={form.url_buena_conducta} />
                <InputFile label="Constancia AFIP" campo="url_afip" value={form.url_afip} />
                <InputFile label="Título Profesional" campo="url_titulo" value={form.url_titulo} />
                <InputFile label="Constancia CUIL" campo="url_cuil" value={form.url_cuil} />
              </div>
            </section>

            {/* SEGURIDAD */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-green-50/30 rounded-3xl border border-green-100">
              <input type="password" placeholder="Nueva Contraseña" className="p-4 bg-white rounded-xl font-bold text-sm" value={password} onChange={e => setPassword(e.target.value)} />
              <input type="password" placeholder="Confirmar Contraseña" className="p-4 bg-white rounded-xl font-bold text-sm" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </section>

            <button disabled={updating} className="w-full bg-[#84bd00] text-white p-6 rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
              {updating ? <Loader2 className="animate-spin" /> : <Save size={20}/>}
              {updating ? "PROCESANDO..." : "GUARDAR TODO EL LEGAJO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MiPerfil;