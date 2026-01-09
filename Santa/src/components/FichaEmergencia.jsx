import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Printer, ArrowLeft, Heart, Phone, Loader2 } from 'lucide-react';

const FichaEmergencia = () => {
  const { id } = useParams();
  const [alumno, setAlumno] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDatos() {
      try {
        const { data } = await supabase
          .from('alumnos')
          .select('*, datos_medicos(*)')
          .eq('id', id)
          .single();
        setAlumno(data);
      } catch (err) {
        console.error("Error en protocolo médico:", err);
      } finally {
        setLoading(false);
      }
    }
    getDatos();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="font-black text-blue-600 uppercase text-[10px] tracking-widest">Cargando Protocolo Médico...</p>
    </div>
  );
  
  if (!alumno) return <div className="p-10 text-center text-red-600 font-black uppercase">Alumno no encontrado</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 sm:p-10 font-sans">
      {/* --- INGENIERÍA CSS PARA IMPRESIÓN --- */}
      <style type="text/css" media="print">
        {`
          @page { size: A4; margin: 1cm; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        `}
      </style>

      {/* Cabecera de Control (Se oculta al imprimir) */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-10 print:hidden border-b pb-6 border-blue-100">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 font-black text-[10px] uppercase text-blue-400 hover:text-blue-900 transition-colors">
          <ArrowLeft size={16} /> Volver al Perfil
        </button>
        <button onClick={() => window.print()} className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-red-700 flex items-center gap-2 transition-all active:scale-95">
          <Printer size={18} /> Imprimir Ficha Oficial
        </button>
      </div>

      {/* CUERPO DE LA FICHA (Formato A4) */}
      <div className="max-w-[21cm] mx-auto border-[3px] border-blue-900 p-8 print:border-none print:p-0 bg-white shadow-2xl print:shadow-none">
        
        <header className="flex justify-between items-start border-b-[3px] border-blue-900 pb-6 mb-8">
          <div>
             <h1 className="text-4xl font-black tracking-tighter uppercase leading-none text-blue-900">I.A.D. SANTA CATALINA</h1>
             <p className="text-[10px] font-black tracking-[0.3em] mt-2 text-blue-600 uppercase italic">Sistema de Gestión v2.1 • Legajo Médico</p>
          </div>
          <img 
            src="/logo-instituto.jpeg" 
            alt="Logo Santa Catalina" 
            className="w-24 h-auto object-contain"
          />
        </header>

        <h2 className="text-center text-2xl font-black bg-blue-900 text-white py-3 mb-10 tracking-widest uppercase">FICHA MÉDICA DE EMERGENCIA</h2>

        <div className="grid grid-cols-2 gap-12 mb-10">
          <section>
            <h3 className="text-[10px] font-black text-blue-800 uppercase border-b-2 border-blue-200 mb-4 tracking-widest">Identificación</h3>
            <p className="text-xl font-black uppercase leading-tight text-blue-900">{alumno.apellido}, {alumno.nombre}</p>
            <p className="text-sm font-bold mt-2 text-gray-700">DNI: {alumno.dni}</p>
            <p className="text-sm text-gray-700">F. Nacimiento: {alumno.fecha_nac || 'No registrada'}</p>
          </section>
          <section>
            <h3 className="text-[10px] font-black text-blue-800 uppercase border-b-2 border-blue-200 mb-4 tracking-widest">Cobertura</h3>
            <p className="text-lg font-black uppercase text-blue-600">{alumno.obra_social || 'S/D'}</p>
            <p className="text-sm font-bold text-gray-700">Nro Afiliado: {alumno.nro_afiliado || '-'}</p>
          </section>
        </div>

        {/* ALERTA MÉDICA CRÍTICA */}
        <section className="mb-10 border-[4px] border-red-600 p-6 bg-red-50 rounded-xl">
          <h3 className="flex items-center gap-2 text-red-700 font-black text-lg uppercase mb-4 underline decoration-2">
            <Heart size={20} fill="currentColor" /> Datos Médicos Críticos
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase text-red-900/60">Diagnóstico Principal:</p>
              {/* CORRECCIÓN: Comillas escapadas para pasar ESLint */}
              <p className="text-xl font-black text-red-900 italic uppercase leading-tight">
                &quot;{alumno.datos_medicos?.diagnostico || 'SIN DIAGNÓSTICO DECLARADO'}&quot;
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-red-200">
              <div>
                <p className="text-[9px] font-black uppercase text-red-900/60 tracking-tighter">Medicación Actual:</p>
                <p className="font-bold text-sm uppercase text-gray-900 leading-tight">{alumno.datos_medicos?.medicamentos || 'NO REGISTRA'}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-red-900/60 tracking-tighter">Alergias Conocidas:</p>
                <p className="font-bold text-sm uppercase text-red-600 leading-tight">{alumno.alergias || 'SIN ALERGIAS'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACTO DE EMERGENCIA */}
        <section className="bg-blue-50 p-8 rounded-3xl border-2 border-dashed border-blue-300">
          <h3 className="text-[10px] font-black text-blue-600 uppercase mb-4 flex items-center gap-2 tracking-widest"><Phone size={14}/> Urgencias llamar a:</h3>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-black uppercase tracking-tighter text-blue-900">{alumno.contacto_nombre || 'S/D'}</p>
              <p className="text-xs font-bold text-blue-500 uppercase italic">Vínculo: {alumno.contacto_parentesco || '-'}</p>
            </div>
            <p className="text-4xl font-black tracking-tighter tabular-nums text-blue-900">{alumno.contacto_tel || '-'}</p>
          </div>
        </section>

        <footer className="mt-20 text-center border-t border-blue-100 pt-6">
          <p className="text-[9px] font-black text-blue-300 uppercase tracking-[0.4em]">Documento Oficial Reservado • Santa Catalina v2.1</p>
        </footer>
      </div>
    </div>
  );
};

export default FichaEmergencia;