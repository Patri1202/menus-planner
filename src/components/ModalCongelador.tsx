// src/components/ModalCongelador.tsx

import { useState } from 'react';
import type { TupperPreparado } from '../types/menuPlan';
import { confirmarAccion } from '../utils/alertas';

export interface ModalCongeladorProps {
  estaAbierto: boolean;
  tuppers: TupperPreparado[];
  alCerrar: () => void;
  alCrearTupper: (datos: { nombre: string; raciones: number }) => void;
  alEliminarTupper: (id: string) => void;
}

export const ModalCongelador = ({
  estaAbierto,
  tuppers,
  alCerrar,
  alCrearTupper,
  alEliminarTupper,
}: ModalCongeladorProps) => {
  const [nombre, setNombre] = useState('');
  const [raciones, setRaciones] = useState(2);

  if (!estaAbierto) return null;

  const manejarCrear = (evento: React.FormEvent) => {
    evento.preventDefault();

    if (nombre.trim() === '' || raciones < 1) {
      return;
    }

    alCrearTupper({
      nombre: nombre.trim(),
      raciones: Number(raciones),
    });

    setNombre('');
    setRaciones(2);
  };

  const totalRaciones = tuppers.reduce((acc, t) => acc + (t.racionesDisponibles || 0), 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={alCerrar}
    >
      {/* Contenedor del Modal:
          - sm:rounded-lg: esquinas limpias de 8px en escritorio (en vez de rounded-2xl de 16px)
          - rounded-t-xl: esquinas sutiles superiores en móvil tipo drawer
          - border border-slate-200: acabado sólido y estructurado */}
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-xl sm:rounded-lg shadow-xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Congelador</h2>
              <p className="text-xs text-slate-500">
                {tuppers.length === 0
                  ? 'Sin tuppers guardados'
                  : `${tuppers.length} tipo${tuppers.length > 1 ? 's' : ''} de tupper (${totalRaciones} raciones en total)`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="text-slate-400 hover:text-slate-700 p-1.5 text-base rounded hover:bg-slate-100 transition-colors cursor-pointer"
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Formulario para añadir tupper (inputs con esquinas rounded-md) */}
        <form
          onSubmit={manejarCrear}
          className="px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row gap-2 bg-slate-50/60"
        >
          <input
            type="text"
            autoFocus
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Lasaña de verduras, Lentejas..."
            className="flex-1 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
          />

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="20"
              value={raciones}
              onChange={(e) => setRaciones(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-2 text-sm text-center rounded-md border border-slate-200 bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
              title="Número de raciones"
            />
            <span className="text-xs font-semibold text-slate-500 shrink-0">
              rac.
            </span>

            <button
              type="submit"
              disabled={nombre.trim() === ''}
              className="px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors cursor-pointer shrink-0"
            >
              + Guardar
            </button>
          </div>
        </form>

        {/* Lista de tuppers con esquinas rounded-md */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {tuppers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xs text-slate-400 font-medium">
                No tienes tuppers registrados en el congelador.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Añade tus platos cocinados arriba para usarlos luego en el menú semanal.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {tuppers.map((tupper) => (
                <div
                  key={tupper.id}
                  className="flex items-center justify-between p-3 rounded-md border border-slate-200 bg-white hover:border-slate-300 shadow-2xs transition-all"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {tupper.nombre}
                    </p>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                      {tupper.racionesDisponibles} {tupper.racionesDisponibles === 1 ? 'ración' : 'raciones'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const confirmado = await confirmarAccion(
                        '¿Eliminar tupper?',
                        `¿Seguro que deseas eliminar "${tupper.nombre}" del congelador?`
                      );
                      if (confirmado) {
                        alEliminarTupper(tupper.id);
                      }
                    }}
                    className="text-slate-300 hover:text-rose-500 p-1.5 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Eliminar tupper"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={alCerrar}
            className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
