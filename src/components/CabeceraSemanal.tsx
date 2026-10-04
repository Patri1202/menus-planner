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
}

// ---------------------------------------------------------------------------
// 2. Componente visual CabeceraSemanal
// ---------------------------------------------------------------------------

export const CabeceraSemanal = ({
  tituloRango,
  totalPendientesCompra = 0,
  alSemanaAnterior,
  alSemanaSiguiente,
  alVolverHoy,
  alAbrirListaCompra,
  alAbrirRecetas, // <- Desestructurada
}: CabeceraSemanalProps) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs mb-6">
      <div>
        <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <span>🥗</span> Menú Semanal
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          {tituloRango}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* BOTÓN: Abrir Recetario */}
        <button
          type="button"
          onClick={alAbrirRecetas}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          title="Ver recetario"
        >
          <span>📖 Recetas</span>
        </button>

        {/* BOTÓN: Abrir modal de la lista de la compra */}
        <button
          type="button"
          onClick={alAbrirListaCompra}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer mr-1"
          title="Ver lista de la compra"
        >
          <span>🛒 Compra</span>
          {totalPendientesCompra > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {totalPendientesCompra}
            </span>
          )}
        </button>

        {/* Volver a hoy y flechas de navegación */}
        <button
          type="button"
          onClick={alVolverHoy}
          className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          Hoy
        </button>

        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5">
          <button
            type="button"
            onClick={alSemanaAnterior}
            className="p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            title="Semana anterior"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={alSemanaSiguiente}
            className="p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            title="Semana siguiente"
          >
            ▶
          </button>
        </div>
      </div>
    </header>
  );
};

