import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { ClipboardList, History, Loader2 } from 'lucide-react';

const EvolucionesAlumno = ({ alumnoId, profesionalId, areaProfesional }) => {
  const [nota, setNota] = useState("");
  const [historial, setHistorial] = useState([]);
  const [saving, setSaving] = useState(false);
  // CORRECCIÓN: Nace en true para evitar el error de cascada en el useEffect
  const [loading, setLoading] = useState(true);

  // 1. DEFINICIÓN ARRIBA (Memorizada)
  const fetchEvoluciones = useCallback(async () => {
    if (!alumnoId) {
      setLoading(false);
      return;
    }
    
    try {
      const { data } = await supabase
        .from('evoluciones')
        .select('*, perfiles(nombre_completo)')
        .eq('alumno_id', alumnoId)
        .order('fecha', { ascending: false });
      
      setHistorial(data || []);
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false); // Solo actualizamos para terminar la carga
    }
  }, [alumnoId]);

  // 2. USO ABAJO
  useEffect(() => { 
    fetchEvoluciones(); 
  }, [fetchEvoluciones]);

  const guardarEvolucion = async () => {
    if (!nota.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('evoluciones').insert([{
        alumno_id: alumnoId,
        profesional_id: profesionalId,
        contenido: nota,
        area: areaProfesional
      }]);
      
      if (!error) { 
        setNota(""); 
        fetchEvoluciones(); 
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
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
          disabled={saving || loading}
          className="mt-4 w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Registrar Informe'}
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-gray-100">
        <h3 className="text-xs font-black text-gray-400 uppercase mb-6 flex items-center gap-2">
          <History size={16}/> Historial de Evoluciones
        </h3>
        
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="animate-spin text-blue-400" />
            </div>
          ) : historial.length === 0 ? (
            <p className="text-center text-gray-400 text-[10px] font-black uppercase py-10">Sin registros</p>
          ) : (
            historial.map(e => (
              <div key={e.id} className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-blue-600 uppercase">{e.area}</span>
                  <span className="text-[10px] font-bold text-gray-400">{new Date(e.fecha).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{e.contenido}</p>
                <p className="text-[9px] font-bold text-gray-400 mt-3 text-right italic">Firma: {e.perfiles?.nombre_completo}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EvolucionesAlumno;