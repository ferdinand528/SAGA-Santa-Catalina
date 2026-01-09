import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { APP_CONFIG } from './constants/Config';

// --- IMPORTACIÓN DE PÁGINAS ---
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calendario from './pages/Calendario';

// Módulo Alumnos
import Legajos from './pages/Legajos'; 
import FichaAlumno from './pages/FichaAlumno';
import AltaAlumno from './pages/AltaAlumno';
import EditarAlumno from './pages/EditarAlumno';
import Evoluciones from './pages/Evoluciones';
import FichaEmergencia from './components/FichaEmergencia'; 

// Módulo RRHH / Personal
import ListaPersonal from './pages/ListaPersonal';
import RegistroProfesional from './pages/RegistroProfesional'; 
import MiPerfil from './pages/MiPerfil';

// Módulo Administración
import ListaCobranzas from './pages/ListaCobranzas';
import RegistroPagoAlumno from './pages/RegistroPagoAlumno';

// Módulo Reportes y Auditoría
import ReportesMenu from './pages/ReportesMenu';
import ReporteLegajos from './pages/ReporteLegajos';
import ReporteLegajosAlumnos from './pages/ReporteLegajosAlumnos';
import ReporteCaja from './pages/ReporteCaja';
import ReporteAsistencia from './pages/ReporteAsistencia';

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

        {/* CONTENIDO DE RUTAS */}
        <div className="relative z-10">
          <Routes>
            {/* ACCESO Y DASHBOARD */}
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendario" element={<Calendario />} />

            {/* MÓDULO ALUMNOS */}
            <Route path="/legajos" element={<Legajos />} />
            <Route path="/legajo/:id" element={<FichaAlumno />} />
            <Route path="/alta-alumno" element={<AltaAlumno />} />
            <Route path="/editar-alumno/:id" element={<EditarAlumno />} />
            <Route path="/evoluciones" element={<Evoluciones />} />
            <Route path="/alumno/:id/ficha-medica" element={<FichaEmergencia />} />

            {/* MÓDULO RRHH / PERSONAL (MiPerfil unificado) */}
            <Route path="/personal" element={<ListaPersonal />} />
            <Route path="/registro-personal" element={<RegistroProfesional />} />
            <Route path="/mi-perfil" element={<MiPerfil />} />
            <Route path="/perfil/:id" element={<MiPerfil />} />
            <Route path="/editar-personal/:id" element={<MiPerfil />} />

            {/* MÓDULO ADMINISTRACIÓN */}
            <Route path="/cobranzas" element={<ListaCobranzas />} />
            <Route path="/registrar-pago/:alumnoId" element={<RegistroPagoAlumno />} />
            
            {/* MÓDULO REPORTES Y AUDITORÍA v2.0 */}
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