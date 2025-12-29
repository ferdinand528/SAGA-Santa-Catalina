import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// IMPORTACIÓN DE PÁGINAS
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Alumnos from './pages/Legajos'; 
import FichaAlumno from './pages/FichaAlumno';
import RegistroPago from './pages/RegistroPago'; 
import ListaPersonal from './pages/ListaPersonal';
import RegistroProfesional from './pages/RegistroProfesional';
import Calendario from './pages/Calendario';
import Estadisticas from './pages/Estadisticas';

function App() {
  return (
    <Router>
      {/* EL SECRETO: El contenedor principal tiene bg-transparent 
      */}
      <div className="relative min-h-screen bg-transparent">
        
        {/* LOGO DE FONDO (MARCA DE AGUA) */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none -z-10">
          <img 
            src="/logo-instituto.jpeg" 
            alt="Fondo Santa Catalina" 
            className="w-[500px] md:w-[800px] opacity-[0.08] grayscale select-none" 
            /* Subimos la opacidad a 0.08 para que sea más visible */
          />
        </div>

        {/* CONTENIDO CON Z-INDEX POSITIVO */}
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/legajos" element={<Alumnos />} />
            <Route path="/legajo/:id" element={<FichaAlumno />} />
            <Route path="/registro-pago" element={<RegistroPago />} />
            <Route path="/personal" element={<ListaPersonal />} />
            <Route path="/registro-personal" element={<RegistroProfesional />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/estadisticas" element={<Estadisticas />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;