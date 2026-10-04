// src/utils/dateUtils.ts

// ---------------------------------------------------------------------------
// 1. Convertir un objeto Date en texto "YYYY-MM-DD" (hora local)
// ---------------------------------------------------------------------------

// Recibe un objeto Date (la fecha de hoy) y devuelve un string ("2026-10-02").
// En JavaScript existe fecha.toISOString(), pero con trampa: usa la hora del meridiano de Greenwich (UTC).
// Si en España estás a las 00:30 de la noche y llamas a toISOString(), te dirá que todavía es el día anterior.
// Para evitar ese bug, extraemos el año, mes y día locales a mano.

export const formatearFechaAClave = (fecha: Date): string => {
  const anio = fecha.getFullYear();

  // getMonth() devuelve los meses del 0 al 11 (enero es 0), por eso sumamos 1
  // padStart(2, '0') añade un cero delante si el número solo tiene una cifra (el 4 pasa a ser "04")
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");

  // getDate() devuelve el número de día del mes (1 al 31)
  // Igual que antes, le forzamos a tener 2 cifras (el 2 pasa a ser "02")
  const dia = String(fecha.getDate()).padStart(2, "0");

  // Devolvemos el texto unido por guiones
  return `${anio}-${mes}-${dia}`;
};

// ---------------------------------------------------------------------------
// 2. Calcular la fecha del lunes de la semana actual
// ---------------------------------------------------------------------------

// Recibe cualquier fecha y devuelve un nuevo objeto Date fijado en el lunes previo
export const obtenerLunesDeLaSemana = (fechaReferencia: Date): Date => {
  // Creamos una copia nueva para no modificar la fecha original
  const fecha = new Date(fechaReferencia);

  // Obtenemos qué día de la semana es (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  const diaSemana = fecha.getDay();

  // Si es domingo (0), restamos 6 días. Si no, calculamos (1 - diaSemana)
  const diasParaRestar = diaSemana === 0 ? -6 : 1 - diaSemana;

  // Modificamos el día restando o sumando la diferencia obtenida
  fecha.setDate(fecha.getDate() + diasParaRestar);

  // Ponemos las horas a las 00:00:00 para que no haya desajustes con los horarios
  fecha.setHours(0, 0, 0, 0);

  // Devolvemos el lunes calculado
  return fecha;
};

// ---------------------------------------------------------------------------
// 3. Estructura y generación de los 7 días de la semana
// ---------------------------------------------------------------------------

// Describimos qué datos va a tener cada una de las 7 columnas del calendario
export interface InformacionDia {
  // Clave en formato "YYYY-MM-DD" para guardar los datos de este día
  claveFecha: string;

  // Nombre del día en español (ej: "Lunes", "Martes")
  nombreDia: string;

  // Número del día en el mes (ej: 2, 15, 31)
  numeroDia: number;

  // El objeto Date nativo por si necesitamos hacer más operaciones
  fechaCompleta: Date;

  // Indica si este día coincide con la fecha real actual
  esHoy: boolean;
}

// Recibe la fecha del lunes y devuelve una lista con los 7 días (Lunes a Domingo)
export const obtenerDiasDeLaSemana = (fechaLunes: Date): InformacionDia[] => {
  // Array vacío donde iremos acumulando los 7 días
  const diasSemana: InformacionDia[] = [];

  // Obtenemos la fecha de hoy en formato "YYYY-MM-DD" para comparar
  const claveHoy = formatearFechaAClave(new Date());

  // Nombres de los días ordenados de lunes a domingo
  const nombresDias = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  // Bucle de 7 vueltas: una por cada día de la semana (del 0 al 6)
  for (let i = 0; i < 7; i++) {
    // Sacamos una copia de la fecha del lunes
    const fechaActual = new Date(fechaLunes);

    // Sumamos 'i' días al lunes: con i=0 es Lunes, con i=1 es Martes, etc.
    fechaActual.setDate(fechaLunes.getDate() + i);

    // Generamos su clave "YYYY-MM-DD" usando la primera función que creamos
    const claveFecha = formatearFechaAClave(fechaActual);

    // Añadimos el día con todos sus datos a la lista
    diasSemana.push({
      claveFecha,
      nombreDia: nombresDias[i],
      numeroDia: fechaActual.getDate(),
      fechaCompleta: fechaActual,
      // Si su clave coincide exactamente con la de hoy, esHoy será true
      esHoy: claveFecha === claveHoy,
    });
  }

  // Devolvemos el array con los 7 días listos
  return diasSemana;
};

// ---------------------------------------------------------------------------
// 4. Formatear el rango de fechas para el encabezado (ej: "28 sept - 4 oct 2026")
// ---------------------------------------------------------------------------

// Recibe la fecha del lunes y devuelve un texto amigable con el rango hasta el domingo
export const formatearRangoSemana = (fechaLunes: Date): string => {
  // Calculamos la fecha del domingo sumando 6 días al lunes
  const fechaDomingo = new Date(fechaLunes);
  fechaDomingo.setDate(fechaLunes.getDate() + 6);

  // Extraemos el número del día inicial (del lunes)
  const diaInicio = fechaLunes.getDate();

  // Obtenemos el nombre corto del mes del lunes en español (ej: "sept", "oct")
  const mesInicio = fechaLunes.toLocaleDateString('es-ES', { month: 'short' });

  // Extraemos el número del día final (del domingo)
  const diaFin = fechaDomingo.getDate();

  // Obtenemos el mes corto del domingo
  const mesFin = fechaDomingo.toLocaleDateString('es-ES', { month: 'short' });

  // Obtenemos el año
  const anio = fechaDomingo.getFullYear();

  // Si la semana empieza y termina dentro del mismo mes, no repetimos el mes
  if (mesInicio === mesFin) {
    return `${diaInicio} - ${diaFin} de ${mesInicio} ${anio}`;
  }

  // Si la semana cruza de un mes a otro
  return `${diaInicio} de ${mesInicio} - ${diaFin} de ${mesFin} ${anio}`;
};
