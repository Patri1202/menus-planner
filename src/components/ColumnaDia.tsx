// src/components/ColumnaDia.tsx

// Importamos la estructura de un día que creamos en dateUtils
import type { InformacionDia } from "../utils/dateUtils";

// Importamos el tipo Plato y TipoComida de nuestros modelos
import type { Plato, TipoComida } from "../types/menuPlan";

// Importamos la casilla individual que creamos antes
import { CasillaMenuCard } from "./CasillaMenuCard";

// ---------------------------------------------------------------------------
// 1. Propiedades (Props) que necesita la columna de un día
// ---------------------------------------------------------------------------
export interface ColumnaDiaProps {
  // Los datos del día: fecha, nombre ('Lunes'), número, esHoy, etc.
  dia: InformacionDia;

  // El plato que haya asignado para el almuerzo (o null si está libre)
  platoAlmuerzo: Plato | null;

  // El plato que haya asignado para la cena (o null si está libre)
  platoCena: Plato | null;

  // Función para avisar al padre de que se ha pulsado en un momento concreto ('almuerzo' o 'cena')
  alPulsarMomento: (fecha: string, momento: TipoComida) => void;

  // Función para avisar al padre de que se quiere vaciar un momento concreto
  alEliminarMomento: (fecha: string, momento: TipoComida) => void;
}

// ---------------------------------------------------------------------------
// 2. Componente visual ColumnaDia
// ---------------------------------------------------------------------------

export const ColumnaDia = ({
  dia,
  platoAlmuerzo,
  platoCena,
  alPulsarMomento,
  alEliminarMomento,
}: ColumnaDiaProps) => {
  return (
    // Contenedor principal de la columna (un día de la semana)
    <div
      className={`flex flex-col gap-3 p-3 rounded-2xl border transition-all ${
        dia.esHoy
          ? "bg-emerald-50/40 border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs"
          : "bg-slate-50/70 border-slate-200/80 hover:border-slate-300"
      }`}
    >
      {/* Cabecera del día (Nombre y Número) */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
        <div>
          {/* Nombre del día (ej: Lunes) */}
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            {dia.nombreDia}
          </span>
          {/* Número del día (ej: 2) */}
          <span
            className={`text-lg font-black leading-none ${
              dia.esHoy ? "text-emerald-700" : "text-slate-800"
            }`}
          >
            {dia.numeroDia}
          </span>
        </div>

        {/* Pequeña insignia visible únicamente si es la fecha de hoy */}
        {dia.esHoy && (
          <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
            Hoy
          </span>
        )}
      </div>

      {/* Casilla 1: Almuerzo */}
      <CasillaMenuCard
        tipoComida="almuerzo"
        plato={platoAlmuerzo}
        alPulsarCasilla={() => alPulsarMomento(dia.claveFecha, "almuerzo")}
        alEliminarPlato={() => alEliminarMomento(dia.claveFecha, "almuerzo")}
      />

      {/* Casilla 2: Cena */}
      <CasillaMenuCard
        tipoComida="cena"
        plato={platoCena}
        alPulsarCasilla={() => alPulsarMomento(dia.claveFecha, "cena")}
        alEliminarPlato={() => alEliminarMomento(dia.claveFecha, "cena")}
      />
    </div>
  );
};

/* Detalles para tus notas:
Funciones flecha en las props (() => alPulsarMomento(...)): Hacemos esto para enviar parámetros específicos (dia.claveFecha, 'almuerzo') a la función padre solo cuando el usuario hace clic real, sin que se ejecute sola al cargar la página.

Clases dinámicas con ${dia.esHoy ? '...' : '...'}: Es la forma estándar en React y Tailwind de alternar estilos según el valor de una variable booleana. */
