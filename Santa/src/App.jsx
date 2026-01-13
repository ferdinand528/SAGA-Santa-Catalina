import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- PÁGINAS RAÍZ ---
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// --- MÓDULO ADMIN & FACTURACIÓN (Tesorería v3.1) ---
import Calendario from './pages/admin/Calendario';
import ListaCobranzas from './pages/admin/ListaCobranzas';
import RegistroPagoAlumno from './pages/admin/RegistroPagoAlumno';
import GestionAranceles from './pages/admin/GestionAranceles'; 
import GeneradorFacturas from './pages/admin/GeneradorFacturas'; 

// --- MÓDULO ALUMNOS (Administración / Back-Office) ---
import Legajos from './pages/alumnos/Legajos'; 
import FichaAlumno from './pages/alumnos/FichaAlumno'; 
import AltaAlumno from './pages/alumnos/AltaAlumno'; // Gestión 14 puntos v3.1
import EditarAlumno from './pages/alumnos/EditarAlumno'; // Gestión 14 puntos v3.1
import FichaEmergencia from './components/FichaEmergencia'; 

// --- MÓDULO OPERATIVO (Actividad Diaria / Front-Office) ---
import ActividadDiaria from './pages/alumnos/ActividadDiaria'; // <--- Nueva v3.1

// --- MÓDULO RRHH ---
import ListaPersonal from './pages/rrhh/ListaPersonal';
import RegistroProfesional from './pages/rrhh/RegistroProfesional'; 
import MiPerfil from './pages/rrhh/MiPerfil';

// --- MÓDULO REPORTES ---
import ReportesMenu from './pages/reportes/ReportesMenu';
import ReporteLegajos from './pages/reportes/ReporteLegajos';
import ReporteLegajosAlumnos from './pages/reportes/ReporteLegajosAlumnos';
import ReporteCaja from './pages/reportes/ReporteCaja';
import ReporteAsistencia from './pages/reportes/ReporteAsistencia';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-transparent font-sans overflow-x-hidden">
        
        {/* LOGO INSTITUCIONAL (MARCA DE AGUA) */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none -z-10">
          <img 
            src="/logo-instituto.jpeg" 
            alt="Logo Santa Catalina" 
            className="w-[500px] md:w-[850px] opacity-[0.06] grayscale select-none" 
          />
        </div>

        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendario" element={<Calendario />} />

            {/* 🛡️ PARTE 1: GESTIÓN ADMINISTRATIVA (Legajos y Datos Maestros) */}
            <Route path="/legajos" element={<Legajos />} /> 
            <Route path="/legajo/:id" element={<FichaAlumno />} />
            <Route path="/alta-alumno" element={<AltaAlumno />} />
            <Route path="/editar-alumno/:id" element={<EditarAlumno />} />
            <Route path="/alumno/:id/ficha-medica" element={<FichaEmergencia />} />

            {/* 🚀 PARTE 2: GESTIÓN OPERATIVA (Actividad Diaria / Evoluciones) */}
            <Route path="/actividad-diaria" element={<ActividadDiaria />} />

            {/* MÓDULO RRHH */}
            <Route path="/personal" element={<ListaPersonal />} />
            <Route path="/registro-personal" element={<RegistroProfesional />} />
            <Route path="/mi-perfil" element={<MiPerfil />} />
            <Route path="/perfil/:id" element={<MiPerfil />} />
            <Route path="/editar-personal/:id" element={<MiPerfil />} />

            {/* MÓDULO ADMINISTRACIÓN Y FACTURACIÓN (Unificado ARCA) */}
            <Route path="/cobranzas" element={<ListaCobranzas />} />
            <Route path="/registrar-pago/:alumnoId" element={<RegistroPagoAlumno />} />
            <Route path="/gestion-aranceles" element={<GestionAranceles />} />
            <Route path="/generar-facturas" element={<GeneradorFacturas />} />

            {/* MÓDULO REPORTES */}
            <Route path="/reportes" element={<ReportesMenu />} />
            <Route path="/reporte-legajos" element={<ReporteLegajos />} />
            <Route path="/reporte-legajos-alumnos" element={<ReporteLegajosAlumnos />} />
            <Route path="/reportes-caja" element={<ReporteCaja />} />
            <Route path="/reportes-asistencia" element={<ReporteAsistencia />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;