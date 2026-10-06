// src/components/ModalAsignarPlato.tsx

import { useState } from 'react';
import type { Plato, TipoComida, TupperPreparado, Receta } from '../types/menuPlan';

export interface ModalAsignarPlatoProps {
  estaAbierto: boolean;
  fechaSeleccionada: string;
  momentoSeleccionado: TipoComida;
  platoActual: Plato | null;
  tuppersDisponibles: TupperPreparado[];
  recetasDisponibles: Receta[];
  alCerrar: () => void;
  alGuardar: (datosPlato: {
    nombre: string;
    esBatchCooking: boolean;
    tupperId?: string;
  }) => void;
}

export const ModalAsignarPlato = ({
  estaAbierto,
  fechaSeleccionada,
  momentoSeleccionado,
  platoActual,
  tuppersDisponibles,
  recetasDisponibles = [],
  alCerrar,
  alGuardar,
}: ModalAsignarPlatoProps) => {
  const [prevPlato, setPrevPlato] = useState(platoActual);
  const [nombre, setNombre] = useState(platoActual ? platoActual.nombre : '');
  const [esBatchCooking, setEsBatchCooking] = useState(Boolean(platoActual?.esBatchCooking));
  const [tupperSeleccionadoId, setTupperSeleccionadoId] = useState<string | undefined>(undefined);

  if (platoActual !== prevPlato) {
    setPrevPlato(platoActual);
    setNombre(platoActual ? platoActual.nombre : '');
    setEsBatchCooking(Boolean(platoActual?.esBatchCooking));
    setTupperSeleccionadoId(undefined);
  }

  if (!estaAbierto) {
    return null;
  }

  const manejarSeleccionarTupper = (tupper: TupperPreparado) => {
    setNombre(tupper.nombre);
    setEsBatchCooking(true);
    setTupperSeleccionadoId(tupper.id);
  };

  const manejarSeleccionarReceta = (receta: Receta) => {
    setNombre(receta.nombre);
    setEsBatchCooking(false);
    setTupperSeleccionadoId(undefined);
  };

  const manejarEnvio = (evento: React.FormEvent) => {
    evento.preventDefault();

    if (nombre.trim() === '') {
      return;
    }

    alGuardar({
      nombre: nombre.trim(),
      esBatchCooking,
      tupperId: tupperSeleccionadoId,
    });
  };

  const tuppersConStock = tuppersDisponibles.filter((t) => t.racionesDisponibles > 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={alCerrar}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {momentoSeleccionado === 'almuerzo' ? 'Comida' : 'Cena'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Fecha: {fechaSeleccionada}
            </p>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarEnvio} className="p-5 flex flex-col gap-4">
          
          {/* Opciones rápidas de tuppers en stock */}
          {tuppersConStock.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Usar tupper del congelador:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tuppersConStock.map((tupper) => (
                  <button
                    key={tupper.id}
                    type="button"
                    onClick={() => manejarSeleccionarTupper(tupper)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                      tupperSeleccionadoId === tupper.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-emerald-50/60 border-emerald-200 text-emerald-800 hover:bg-emerald-100/70'
                    }`}
                  >
                    <span>🧊 {tupper.nombre}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      tupperSeleccionadoId === tupper.id
                        ? 'bg-emerald-700 text-emerald-100'
                        : 'bg-emerald-200/80 text-emerald-900'
                    }`}>
                      {tupper.racionesDisponibles}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desplegable limpio de recetas guardadas */}
          {recetasDisponibles.length > 0 && (
            <div>
              <label
                htmlFor="selector-recetas"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
              >
                O elegir de tus recetas:
              </label>
              <select
                id="selector-recetas"
                value={recetasDisponibles.some((r) => r.nombre === nombre) ? nombre : ''}
                onChange={(e) => {
                  const recetaEncontrada = recetasDisponibles.find((r) => r.nombre === e.target.value);
                  if (recetaEncontrada) {
                    manejarSeleccionarReceta(recetaEncontrada);
                  }
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer"
              >
                <option value="">-- Selecciona una receta guardada --</option>
                {recetasDisponibles.map((receta) => (
                  <option key={receta.id} value={receta.nombre}>
                    📖 {receta.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Campo de texto de la comida */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="nombre-plato"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600"
              >
                Comida o platos del día
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Pulsa Intro para 2º plato
              </span>
            </div>
            <textarea
              id="nombre-plato"
              rows={3}
              autoFocus
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setTupperSeleccionadoId(undefined);
              }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  manejarEnvio(e);
                }
              }}
              placeholder={"1º Ensalada mixta\n2º Salmón con patatas"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm transition-all resize-y min-h-[76px] leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              💡 Puedes pulsar <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-600">Intro</kbd> para añadir un segundo plato o acompañamiento en otra línea.
            </p>
          </div>

          {/* Opción Batch Cooking */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={esBatchCooking}
              onChange={(e) => setEsBatchCooking(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span className="text-sm font-medium text-slate-700">
              Es un tupper preparado (Congelador) 🧊
            </span>
          </label>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2.5 mt-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={alCerrar}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={nombre.trim() === ''}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Guardar plato
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};