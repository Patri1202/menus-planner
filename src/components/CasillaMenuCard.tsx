// src/components/CasillaMenuCard.tsx

// Importamos el tipo Plato que definimos en nuestro archivo de modelos
import type { Plato, TipoComida } from "../types/menuPlan";

// ---------------------------------------------------------------------------
// 1. Propiedades (Props) que necesita una casilla individual
// ---------------------------------------------------------------------------
export interface CasillaMenuCardProps {
  // Momento del día: 'almuerzo' o 'cena'
  tipoComida: TipoComida;

  // El plato asignado a esta casilla, o null si todavía está vacía
  plato: Plato | null;

  // Función que se disparará cuando el usuario pulse para añadir o editar el plato
  alPulsarCasilla: () => void;

  // Función que se disparará si el usuario pulsa el botón de eliminar el plato asignado
  alEliminarPlato?: () => void;
}

// ---------------------------------------------------------------------------
// 2. Componente visual CasillaMenuCard
// ---------------------------------------------------------------------------

export const CasillaMenuCard = ({
  tipoComida,
  plato,
  alPulsarCasilla,
  alEliminarPlato,
}: CasillaMenuCardProps) => {
  // Determinamos el título legible según sea comida o cena
  const esAlmuerzo = tipoComida === "almuerzo";
  const etiquetaTitulo = esAlmuerzo ? "Comida" : "Cena";

  return (
    // Contenedor de la casilla con margen vertical pequeño
    <div className="flex flex-col gap-1 w-full">
      {/* Cabecera del momento del día en negrita */}
      <div className="flex items-center text-[11px] font-bold text-slate-600 uppercase tracking-wider px-1">
        <span>{etiquetaTitulo}</span>
      </div>

      {/* Caso A: Si NO hay plato asignado, mostramos el botón de añadir con esquinas rounded-md más marcadas */}
      {!plato ? (
        <button
          type="button"
          onClick={alPulsarCasilla}
          className="h-[64px] w-full border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-md flex items-center justify-center gap-1.5 text-slate-400 hover:text-emerald-700 transition-all cursor-pointer group px-2"
        >
          {/* Símbolo más que crece ligeramente al pasar el ratón */}
          <span className="text-lg font-light group-hover:scale-125 transition-transform">
            +
          </span>
          <span className="text-xs font-medium">Añadir plato</span>
        </button>
      ) : (
        // Caso B: Si SÍ hay un plato asignado, mostramos la tarjeta con esquinas rounded-md
        <div
          onClick={alPulsarCasilla}
          className="min-h-[64px] h-auto w-full bg-white border border-slate-200 hover:border-slate-300 rounded-md px-2.5 py-2 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-1.5 text-left cursor-pointer relative group"
        >
          {/* Zona superior: Nombre del plato (con soporte para 1º y 2º plato en varias líneas) y botón de eliminar */}
          <div className="flex items-start justify-between gap-1.5 w-full">
            <p className="text-xs font-bold text-slate-800 whitespace-pre-line leading-snug break-words flex-1">
              {plato.nombre}
            </p>

            {/* Botón de papelera para vaciar la casilla */}
            {alEliminarPlato && (
              <button
                type="button"
                onClick={(evento) => {
                  // Evita que el clic en la papelera active también el clic de la tarjeta completa (burbujeo)
                  evento.stopPropagation();
                  alEliminarPlato();
                }}
                className="opacity-0 group-hover:opacity-100 max-sm:opacity-70 hover:!opacity-100 text-slate-400 hover:text-rose-500 p-0.5 rounded transition-all cursor-pointer shrink-0 mt-0.5"
                title="Quitar plato"
              >
                ✕
              </button>
            )}
          </div>

          {/* Zona inferior: Etiqueta si es comida preparada (Batch Cooking / Congelador) limpia de emojis */}
          {plato.esBatchCooking && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded self-start">
              Tupper preparado
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/* Detalles clave para tus notas:
!plato ? (...) : (...): Es un ternario en JSX. Si plato es nulo o indefinido pinta una cosa; si existe, pinta la otra.

evento.stopPropagation(): Es vital en JavaScript/React cuando tienes un botón dentro de una caja que también tiene clic. Evita que el evento "haga burbuja" hacia arriba y dispare los dos a la vez.

opacity-0 group-hover:opacity-100: Hace que la crucecita ✕ de borrar esté invisible y solo aparezca cuando el usuario pasa el ratón por encima de la tarjeta. */
