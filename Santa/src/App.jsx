import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- IMPORTACIÓN DE PÁGINAS ---
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// 1. Módulo de Alumnos (Legajos y Evoluciones)
import Legajos from './pages/Legajos'; 
import FichaAlumno from './pages/FichaAlumno';
import EditarAlumno from './pages/EditarAlumno';
import AltaAlumno from './pages/AltaAlumno';
import Evoluciones from './pages/Evoluciones';
import FichaEmergencia from './components/FichaEmergencia'; // <--- NUEVA IMPORTACIÓN v2.0

// 2. Módulo de Personal y RRHH
import ListaPersonal from './pages/ListaPersonal';
import RegistroProfesional from './pages/RegistroProfesional'; 
import EditarPersonal from './pages/EditarPersonal';
import MiPerfil from './pages/MiPerfil';

// 3. Módulo de Administración y Cobranzas
import ListaCobranzas from './pages/ListaCobranzas';
import RegistroPagoAlumno from './pages/RegistroPagoAlumno';
import Estadisticas from './pages/Estadisticas'; 

// 4. Hub de Reportes Institucionales y Auditoría
import ReportesMenu from './pages/ReportesMenu';
import ReporteDocumentacion from './pages/ReporteDocumentacion';
import ResumenCajaDiaria from './pages/ResumenCajaDiaria'; 
import ReporteObraSocial from './pages/ReporteObraSocial'; 

// 5. Otros Módulos
import Calendario from './pages/Calendario';

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

        {/* ENRUTADOR DE SECCIONES */}
        <div className="relative z-10">
          <Routes>
            {/* ACCESO Y DASHBOARD */}
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* GESTIÓN DE ALUMNOS v2.0 */}
            <Route path="/legajos" element={<Legajos />} />
            <Route path="/legajo/:id" element={<FichaAlumno />} />
            <Route path="/alta-alumno" element={<AltaAlumno />} />
            <Route path="/editar-alumno/:id" element={<EditarAlumno />} />
            <Route path="/evoluciones" element={<Evoluciones />} />
            {/* RUTA PARA IMPRESIÓN DE FICHA MÉDICA */}
            <Route path="/alumno/:id/ficha-medica" element={<FichaEmergencia />} />

            {/* COBRANZAS Y FINANZAS */}
            <Route path="/cobranzas" element={<ListaCobranzas />} />
            <Route path="/registrar-pago/:alumnoId" element={<RegistroPagoAlumno />} />

            {/* HUB DE REPORTES Y AUDITORÍA */}
            <Route path="/reportes" element={<ReportesMenu />} />
            <Route path="/reporte-documentacion" element={<ReporteDocumentacion />} />
            <Route path="/reporte-caja-diaria" element={<ResumenCajaDiaria />} />
            <Route path="/reporte-obra-social" element={<ReporteObraSocial />} />
            <Route path="/estadisticas" element={<Estadisticas />} />

            {/* PERSONAL Y CONFIGURACIÓN */}
            <Route path="/personal" element={<ListaPersonal />} />
            <Route path="/registro-personal" element={<RegistroProfesional />} />
            <Route path="/editar-personal/:id" element={<EditarPersonal />} />
            <Route path="/mi-perfil" element={<MiPerfil />} />

            {/* AGENDA Y CALENDARIO */}
            <Route path="/calendario" element={<Calendario />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;