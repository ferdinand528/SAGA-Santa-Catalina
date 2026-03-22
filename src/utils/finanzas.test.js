import { describe, it, expect } from 'vitest';

// Función a testear (podrías moverla a un archivo de utilidades luego)
const calcularTotalRecaudado = (pagos) => {
  return pagos.reduce((acc, pago) => acc + parseFloat(pago.monto), 0);
};

describe('Módulo de Finanzas S.A.G.A v1.8', () => {
  it('debería sumar correctamente una lista de pagos de diferentes métodos', () => {
    const pagosDePrueba = [
      { monto: "1500.50", metodo: "Efectivo" },
      { monto: "2000.00", metodo: "Transferencia" },
      { monto: "500.00", metodo: "Cheque" }
    ];

    const resultado = calcularTotalRecaudado(pagosDePrueba);
    
    // El resultado esperado es 4000.50
    expect(resultado).toBe(4000.50);
  });

  it('debería devolver 0 si la lista de pagos está vacía', () => {
    expect(calcularTotalRecaudado([])).toBe(0);
  });
});