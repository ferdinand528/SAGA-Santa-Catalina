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
import ControlPersonal from './pages/admin/ControlPersonal'; 

// --- MÓDULO ALUMNOS (Administración / Back-Office) ---
import Legajos from './pages/alumnos/Legajos'; 
import FichaAlumno from './pages/alumnos/FichaAlumno'; 
import AltaAlumno from './pages/alumnos/AltaAlumno'; 
import EditarAlumno from './pages/alumnos/EditarAlumno'; 
import FichaEmergencia from './components/FichaEmergencia'; 

// --- MÓDULO OPERATIVO (Actividad Diaria / Front-Office) ---
import ActividadDiaria from './pages/alumnos/ActividadDiaria'; 

// --- MÓDULO RRHH ---
import RegistroProfesional from './pages/rrhh/RegistroProfesional'; 
import MiPerfil from './pages/rrhh/MiPerfil';

// --- MÓDULO REPORTES ---
import ReportesMenu from './pages/reportes/ReportesMenu';
import ReporteLegajos from './pages/reportes/ReporteLegajos';
import ReporteLegajosAlumnos from './pages/reportes/ReporteLegajosAlumnos';
import ReporteCaja from './pages/reportes/ReporteCaja';
import ReporteAsistencia from './pages/reportes/ReporteAsistencia';
import CensoObraSocial from './pages/reportes/CensoObraSocial'; 
import ReporteAccesos from './pages/reportes/ReporteAccesos';


function App() {
  return (
    <Router>
      {/* CONTENEDOR PRINCIPAL CON FONDO CLARO */}
      <div className="relative min-h-screen bg-[#fcfaf7] font-sans overflow-x-hidden">
        
        {/* LOGO INSTITUCIONAL (MARCA DE AGUA) */}
        {/* Usamos z-0 para el logo y z-10 para el contenido */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <img 
            src="/logo-instituto.jpeg" 
            alt="Logo Santa Catalina" 
            className="w-[500px] md:w-[850px] opacity-[0.07] grayscale select-none" 
          />
        </div>

        {/* CONTENIDO DE LA APLICACIÓN */}
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendario" element={<Calendario />} />

            {/* 🛡️ PARTE 1: GESTIÓN ADMINISTRATIVA */}
            <Route path="/legajos" element={<Legajos />} /> 
            <Route path="/legajo/:id" element={<FichaAlumno />} />
            <Route path="/alta-alumno" element={<AltaAlumno />} />
            <Route path="/editar-alumno/:id" element={<EditarAlumno />} />
            <Route path="/alumno/:id/ficha-medica" element={<FichaEmergencia />} />

            {/* 🚀 PARTE 2: GESTIÓN OPERATIVA */}
            <Route path="/actividad-diaria" element={<ActividadDiaria />} />

            {/* 👥 MÓDULO RRHH */}
            <Route path="/personal" element={<ControlPersonal />} /> 
            <Route path="/control-personal" element={<ControlPersonal />} />
            <Route path="/registro-personal" element={<RegistroProfesional />} />
            <Route path="/mi-perfil" element={<MiPerfil />} />
            <Route path="/perfil/:id" element={<MiPerfil />} />
            <Route path="/editar-personal/:id" element={<MiPerfil />} />

            {/* 💰 MÓDULO ADMINISTRACIÓN Y FACTURACIÓN */}
            <Route path="/cobranzas" element={<ListaCobranzas />} />
            <Route path="/registrar-pago/:alumnoId" element={<RegistroPagoAlumno />} />
            <Route path="/gestion-aranceles" element={<GestionAranceles />} />
            <Route path="/generar-facturas" element={<GeneradorFacturas />} />

            {/* 📊 MÓDULO REPORTES */}
            <Route path="/reportes" element={<ReportesMenu />} />
            <Route path="/reporte-legajos" element={<ReporteLegajos />} />
            <Route path="/reporte-legajos-alumnos" element={<ReporteLegajosAlumnos />} />
            <Route path="/reportes-caja" element={<ReporteCaja />} />
            <Route path="/reportes-asistencia" element={<ReporteAsistencia />} />
            <Route path="/censo-obra-social" element={<CensoObraSocial />} /> 
            <Route path="/reporte-accesos" element={<ReporteAccesos />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;