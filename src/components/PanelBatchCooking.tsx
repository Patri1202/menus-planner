// src/components/PanelBatchCooking.tsx

import { useState } from 'react';
import type { TupperPreparado } from '../types/menuPlan';

// ---------------------------------------------------------------------------
// 1. Propiedades (Props) del Panel de Batch Cooking
// ---------------------------------------------------------------------------
export interface PanelBatchCookingProps {
  // Lista de tuppers que hay actualmente en stock
  tuppers: TupperPreparado[];

  // Función para registrar un nuevo tupper cocinado
  alCrearTupper: (datos: { nombre: string; raciones: number }) => void;

  // Función para eliminar un tupper de la lista si ya no se tiene
  alEliminarTupper: (id: string) => void;
}

// ---------------------------------------------------------------------------
// 2. Componente visual PanelBatchCooking
// ---------------------------------------------------------------------------

export const PanelBatchCooking = ({
  tuppers,
  alCrearTupper,
  alEliminarTupper,
}: PanelBatchCookingProps) => {
  // Estado local para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [raciones, setRaciones] = useState(2);

  // Manejador del envío del formulario
  const manejarCrear = (evento: React.FormEvent) => {
    evento.preventDefault();

    if (nombre.trim() === '' || raciones < 1) {
      return;
    }

    // Pasamos los datos al componente padre
    alCrearTupper({
      nombre: nombre.trim(),
      raciones: Number(raciones),
    });

    // Limpiamos los campos para el próximo tupper
    setNombre('');
    setRaciones(2);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mt-8">
      {/* Cabecera del panel */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <span className="text-xl" role="img" aria-label="tupper">
          🍱
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Nevera & Batch Cooking
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Raciones preparadas listas para consumir en la semana
          </p>
        </div>
      </div>

      {/* Formulario rápido para añadir nuevo tupper */}
      <form
        onSubmit={manejarCrear}
        className="flex flex-col sm:flex-row gap-2 mb-6"
      >
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Boloñesa de lentejas"
          className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
        />

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="20"
            value={raciones}
            onChange={(e) => setRaciones(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 px-3 py-2 text-sm text-center rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            title="Número de raciones preparadas"
          />
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            raciones
          </span>

          <button
            type="submit"
            disabled={nombre.trim() === ''}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer shrink-0"
          >
            + Guardar
          </button>
        </div>
      </form>

      {/* Lista de tuppers en stock */}
      {tuppers.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          No tienes ningún tupper registrado en stock. ¡Añade uno arriba!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {tuppers.map((tupper) => (
            <div
              key={tupper.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {tupper.nombre}
                </p>
                <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  {tupper.racionesDisponibles} {tupper.racionesDisponibles === 1 ? 'ración' : 'raciones'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => alEliminarTupper(tupper.id)}
                className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                title="Eliminar tupper"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};