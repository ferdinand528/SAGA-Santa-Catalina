import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, ClipboardList, History } from 'lucide-react';

const EvolucionesAlumno = ({ alumnoId, profesionalId, areaProfesional }) => {
  const [nota, setNota] = useState("");
  const [historial, setHistorial] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchEvoluciones(); }, [alumnoId]);

  async function fetchEvoluciones() {
    const { data } = await supabase
      .from('evoluciones')
      .select('*, perfiles(nombre_completo)')
      .eq('alumno_id', alumnoId)
      .order('fecha', { ascending: false });
    setHistorial(data || []);
  }

  const guardarEvolucion = async () => {
    if (!nota) return;
    setSaving(true);
    const { error } = await supabase.from('evoluciones').insert([{
      alumno_id: alumnoId,
      profesional_id: profesionalId,
      contenido: nota,
      area: areaProfesional
    }]);
    if (!error) { setNota(""); fetchEvoluciones(); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* AREA DE CARGA */}
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2.5rem] border border-blue-100">
        <h3 className="text-xs font-black text-blue-600 uppercase mb-4 flex items-center gap-2">
          <ClipboardList size={16}/> Nueva Evolución - {areaProfesional}
        </h3>
        <textarea 
          className="w-full p-6 bg-gray-50/50 rounded-3xl border border-gray-100 outline-none focus:ring-2 focus:ring-blue-200 font-medium text-sm text-gray-700 min-h-[150px]"
          placeholder="Escriba aquí el informe de la sesión o actividad..."
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />
        <button 
          onClick={guardarEvolucion}
          disabled={saving}
          className="mt-4 w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-blue-700 transition"
        >
          {saving ? 'Guardando...' : 'Registrar Informe'}
        </button>
      </div>

      {/* HISTORIAL DE INFORMES */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-gray-100">
        <h3 className="text-xs font-black text-gray-400 uppercase mb-6 flex items-center gap-2">
          <History size={16}/> Historial de Evoluciones
        </h3>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {historial.map(e => (
            <div key={e.id} className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-blue-600 uppercase">{e.area}</span>
                <span className="text-[10px] font-bold text-gray-400">{new Date(e.fecha).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{e.contenido}</p>
              <p className="text-[9px] font-bold text-gray-400 mt-3 text-right">Firma: {e.perfiles?.nombre_completo}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};