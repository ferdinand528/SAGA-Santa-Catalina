import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- PÁGINAS RAÍZ ---
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// --- MÓDULO ADMIN ---
import Calendario from './pages/admin/Calendario';
import ListaCobranzas from './pages/admin/ListaCobranzas';
import RegistroPagoAlumno from './pages/admin/RegistroPagoAlumno';

// --- MÓDULO ALUMNOS ---
import Legajos from './pages/alumnos/Legajos'; // Este es el listado general
import FichaAlumno from './pages/alumnos/FichaAlumno'; // Este es el detalle con ID
import AltaAlumno from './pages/alumnos/AltaAlumno';
import EditarAlumno from './pages/alumnos/EditarAlumno';
import Evoluciones from './pages/alumnos/Evoluciones';
import FichaEmergencia from './components/FichaEmergencia'; 

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

            {/* MÓDULO ALUMNOS v2.1 */}
            <Route path="/legajos" element={<Legajos />} /> 
            <Route path="/legajo/:id" element={<FichaAlumno />} />
            <Route path="/alta-alumno" element={<AltaAlumno />} />
            <Route path="/editar-alumno/:id" element={<EditarAlumno />} />
            <Route path="/evoluciones" element={<Evoluciones />} />
            <Route path="/alumno/:id/ficha-medica" element={<FichaEmergencia />} />

            {/* MÓDULO RRHH */}
            <Route path="/personal" element={<ListaPersonal />} />
            <Route path="/registro-personal" element={<RegistroProfesional />} />
            <Route path="/mi-perfil" element={<MiPerfil />} />
            <Route path="/perfil/:id" element={<MiPerfil />} />
            <Route path="/editar-personal/:id" element={<MiPerfil />} />

            {/* ADMINISTRACIÓN Y REPORTES */}
            <Route path="/cobranzas" element={<ListaCobranzas />} />
            <Route path="/registrar-pago/:alumnoId" element={<RegistroPagoAlumno />} />
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