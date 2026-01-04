import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- IMPORTACIÓN DE PÁGINAS ---
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Módulo de Alumnos (Legajos)
import Legajos from './pages/Legajos'; 
import FichaAlumno from './pages/FichaAlumno';
import EditarAlumno from './pages/EditarAlumno';
import AltaAlumno from './pages/AltaAlumno';
import Evoluciones from './pages/Evoluciones';

// Módulo de Personal y Profesionales
import ListaPersonal from './pages/ListaPersonal';
import RegistroProfesional from './pages/RegistroProfesional'; 
import EditarPersonal from './pages/EditarPersonal';
import MiPerfil from './pages/MiPerfil'; // <--- NUEVA IMPORTACIÓN

// Módulo de Administración y Pagos
import RegistroPago from './pages/RegistroPago';
import Estadisticas from './pages/Estadisticas';

// Otros Módulos
import Calendario from './pages/Calendario';

function App() {
  return (
    <Router>
      {/* CONTENEDOR PRINCIPAL: bg-transparent para ver el logo de fondo */}
      <div className="relative min-h-screen bg-transparent font-sans overflow-x-hidden">
        
        {/* LOGO INSTITUCIONAL (MARCA DE AGUA) */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none -z-10">
          <img 
            src="/logo-instituto.jpeg" 
            alt="Logo Santa Catalina" 
            className="w-[500px] md:w-[850px] opacity-[0.06] grayscale select-none" 
          />
        </div>

        {/* ENRUTADOR DE SECCIONES: Z-index positivo para quedar sobre el logo */}
        <div className="relative z-10">
          <Routes>
            {/* 1. ACCESO CENTRAL */}
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* 2. GESTIÓN DE ALUMNOS (ABM completo) */}
            <Route path="/legajos" element={<Legajos />} />
            <Route path="/legajo/:id" element={<FichaAlumno />} />
            <Route path="/alta-alumno" element={<AltaAlumno />} />
            <Route path="/editar-alumno/:id" element={<EditarAlumno />} />
            <Route path="/evoluciones" element={<Evoluciones />} />

            {/* 3. GESTIÓN DE PAGOS Y CAJA */}
            <Route path="/registro-pago" element={<RegistroPago />} />
            <Route path="/estadisticas" element={<Estadisticas />} />

            {/* 4. GESTIÓN DE PERSONAL Y RRHH */}
            <Route path="/personal" element={<ListaPersonal />} />
            <Route path="/registro-personal" element={<RegistroProfesional />} />
            <Route path="/editar-personal/:id" element={<EditarPersonal />} />
            <Route path="/mi-perfil" element={<MiPerfil />} /> {/* <--- NUEVA RUTA */}

            {/* 5. AGENDA Y CALENDARIO */}
            <Route path="/calendario" element={<Calendario />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;