// src/components/CabeceraSemanal.tsx

// ---------------------------------------------------------------------------
// 1. Contrato de propiedades (Props)
// Define los datos y las funciones que CabeceraSemanal necesita de su padre (App)
// ---------------------------------------------------------------------------
export interface CabeceraSemanalProps {
  // Texto con las fechas formateadas (ej: "29 de sep. – 5 de oct. de 2026")
  tituloRango: string;

  // Cantidad de productos sin comprar (para mostrar el circulito verde numérico)
  totalPendientesCompra?: number;

  // Cantidad de tuppers o raciones disponibles en el congelador
  totalTuppersCongelador?: number;

  // Función para retroceder 7 días en el calendario
  alSemanaAnterior: () => void;

  // Función para avanzar 7 días en el calendario
  alSemanaSiguiente: () => void;

  // Función para regresar directamente a la semana en curso (hoy)
  alVolverHoy: () => void;

  // Función para abrir la ventana modal de la lista de la compra
  alAbrirListaCompra: () => void;

  // Función para abrir la ventana modal de recetas
  alAbrirRecetas: () => void;

  // Función para abrir la ventana modal del congelador
  alAbrirCongelador: () => void;
}

// ---------------------------------------------------------------------------
// 2. Componente visual CabeceraSemanal
// ---------------------------------------------------------------------------

export const CabeceraSemanal = ({
  tituloRango,
  totalPendientesCompra = 0,
  totalTuppersCongelador = 0,
  alSemanaAnterior,
  alSemanaSiguiente,
  alVolverHoy,
  alAbrirListaCompra,
  alAbrirRecetas,
  alAbrirCongelador,
}: CabeceraSemanalProps) => {
  return (
    // CONTENEDOR PRINCIPAL:
    // - rounded-lg: esquinas firmes y marcadas (8px) en lugar de rounded-2xl (16px)
    // - border border-slate-200: borde gris neutro sutil para dar estructura limpia
    // - shadow-xs: sombra mínima que no sobrecarga la vista
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs mb-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <span>🥗</span> Menú Semanal
        </h1>

        {/* Línea de navegación temporal: botones para avanzar o retroceder de semana */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={alSemanaAnterior}
              className="px-2 py-1 text-slate-600 hover:bg-white hover:text-slate-900 rounded transition-colors cursor-pointer text-xs"
              title="Semana anterior"
            >
              ◀
            </button>
            <button
              type="button"
              onClick={alSemanaSiguiente}
              className="px-2 py-1 text-slate-600 hover:bg-white hover:text-slate-900 rounded transition-colors cursor-pointer text-xs"
              title="Semana siguiente"
            >
              ▶
            </button>
          </div>

          <p className="text-xs text-slate-500 font-semibold">
            {tituloRango}
          </p>

          <button
            type="button"
            onClick={alVolverHoy}
            className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer border border-slate-200/80"
            title="Volver a la semana actual"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* Botones de acción principales (Recetas, Compra, Congelador) con esquinas rounded-md */}
      <div className="flex flex-wrap items-center gap-2">
        {/* BOTÓN: Abrir Recetario */}
        <button
          type="button"
          onClick={alAbrirRecetas}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
          title="Ver recetario"
        >
          <span>📖 Recetas</span>
        </button>

        {/* BOTÓN: Abrir modal de la lista de la compra */}
        <button
          type="button"
          onClick={alAbrirListaCompra}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
          title="Ver lista de la compra"
        >
          <span>🛒 Compra</span>
          {totalPendientesCompra > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded font-black">
              {totalPendientesCompra}
            </span>
          )}
        </button>

        {/* BOTÓN: Abrir modal del congelador */}
        <button
          type="button"
          onClick={alAbrirCongelador}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
          title="Ver congelador y tuppers"
        >
          <span>🧊 Congelador</span>
          {totalTuppersCongelador > 0 && (
            <span className="bg-sky-600 text-white text-[10px] px-1.5 py-0.2 rounded font-black">
              {totalTuppersCongelador}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

