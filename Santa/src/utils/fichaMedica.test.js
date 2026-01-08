import { describe, it, expect } from 'vitest';

const validarDatosCriticos = (alumno) => {
  const camposObligatorios = ['patologia', 'obraSocial', 'contactoUrgencia'];
  return camposObligatorios.every(campo => alumno[campo] && alumno[campo].length > 0);
};

describe('Validación de Ficha Médica v2.0', () => {
  it('debería validar que existan los datos de contacto y salud mínimos', () => {
    const alumnoIncompleto = { nombre: "Juan", patologia: "Asma" };
    expect(validarDatosCriticos(alumnoIncompleto)).toBe(false);
  });

  it('debería aprobar un legajo con todos los datos de emergencia', () => {
    const alumnoCompleto = { 
      nombre: "Juan", 
      patologia: "Asma", 
      obraSocial: "OSDE 210", 
      contactoUrgencia: "11-2233-4455" 
    };
    expect(validarDatosCriticos(alumnoCompleto)).toBe(true);
  });
});