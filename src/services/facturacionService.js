export const generarFacturaCuota = async (datosAlumno, monto, concepto) => {
  const payload = {
    "Ambito": "Servicios",
    "CondicionIVA": "Consumidor Final", // O la que corresponda
    "DocumentoTipo": "DNI",
    "DocumentoNumero": datosAlumno.dni_tutor,
    "RazonSocial": `${datosAlumno.apellido_tutor}, ${datosAlumno.nombre_tutor}`,
    "Items": [{
      "Descripcion": `Cuota Mensual - ${concepto}`,
      "Cantidad": 1,
      "PrecioUnitario": monto,
      "Bonificacion": 0
    }],
    "PuntoVenta": 1, // El que configuraste en Facturante
    "TipoComprobante": "Factura B" // O C, según Santa Catalina
  };

  try {
    const response = await fetch(`${import.meta.env.VITE_FACTURANTE_URL}/Comprobantes`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${import.meta.env.VITE_FACTURANTE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (error) {
    console.error("Error en Facturante:", error);
  }
};