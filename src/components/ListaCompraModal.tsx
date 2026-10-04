// src/components/ListaCompraModal.tsx

import { useState } from 'react';
import type { ItemCompra } from '../types/menuPlan';

export interface ListaCompraModalProps {
  estaAbierto: boolean;
  items: ItemCompra[];
  alCerrar: () => void;
  alAlternarComprado: (id: string) => void;
  alAnadirItem: (texto: string) => void;
  alEliminarItem: (id: string) => void;
  alLimpiarComprados: () => void;
}

export const ListaCompraModal = ({
  estaAbierto,
  items,
  alCerrar,
  alAlternarComprado,
  alAnadirItem,
  alEliminarItem,
  alLimpiarComprados,
}: ListaCompraModalProps) => {
  const [nuevoTexto, setNuevoTexto] = useState('');
  const [copiado, setCopiado] = useState(false);

  if (!estaAbierto) return null;
  

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoTexto.trim() === '') return;
    alAnadirItem(nuevoTexto.trim());
    setNuevoTexto('');
  };

  // Copia la lista en texto plano limpia para WhatsApp
  const manejarCopiar = () => {
    const pendientes = items.filter((i) => !i.comprado);
    if (pendientes.length === 0) return;

    const textoFormateado = pendientes.map((i) => `• ${i.texto}`).join('\n');
    navigator.clipboard.writeText(`🛒 Lista de la compra:\n\n${textoFormateado}`);

    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const pendientes = items.filter((i) => !i.comprado);
  const comprados = items.filter((i) => i.comprado);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs"
      onClick={alCerrar}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera limpia */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Lista de la compra</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {pendientes.length === 0
                ? '¡No te falta nada!'
                : `${pendientes.length} pendiente${pendientes.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="text-slate-400 hover:text-slate-700 p-2 text-base rounded-full hover:bg-slate-50 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Input rápido y plano estilo libreta */}
        <form onSubmit={manejarEnvio} className="px-6 py-3 border-b border-slate-100 flex items-center gap-2">
          <input
            type="text"
            autoFocus
            value={nuevoTexto}
            onChange={(e) => setNuevoTexto(e.target.value)}
            placeholder="Añadir algo rápido (ej: Leche)..."
            className="flex-1 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
          />
          <button
            type="submit"
            disabled={!nuevoTexto.trim()}
            className="text-xs font-bold text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-all cursor-pointer"
          >
            Añadir
          </button>
        </form>

        {/* Lista continua de notas sin cajas */}
        <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-slate-100">
          {items.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-10 font-normal">
              La lista está vacía. Añade lo que necesites arriba.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 group"
              >
                <button
                  type="button"
                  onClick={() => alAlternarComprado(item.id)}
                  className="flex items-center gap-3 text-left flex-1 cursor-pointer select-none"
                >
                  {/* Círculo interactivo tipo checklist */}
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                      item.comprado
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 hover:border-emerald-500'
                    }`}
                  >
                    {item.comprado && <span className="text-[11px] leading-none">✓</span>}
                  </div>

                  {/* Texto del producto */}
                  <span
                    className={`text-sm transition-all ${
                      item.comprado
                        ? 'line-through text-slate-300'
                        : 'text-slate-800 font-medium'
                    }`}
                  >
                    {item.texto}
                  </span>
                </button>

                {/* Botón de borrar sutil */}
                <button
                  type="button"
                  onClick={() => alEliminarItem(item.id)}
                  className="text-slate-300 hover:text-rose-500 text-xs px-2 py-1 transition-colors cursor-pointer"
                  title="Eliminar de la lista"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Barra de utilidades inferior discreta */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {comprados.length > 0 ? (
            <button
              type="button"
              onClick={alLimpiarComprados}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Limpiar tachados ({comprados.length})
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={manejarCopiar}
              disabled={pendientes.length === 0}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-colors cursor-pointer"
            >
              {copiado ? '✓ Copiado' : 'Copiar WhatsApp'}
            </button>
            <button
              type="button"
              onClick={alCerrar}
              className="text-xs font-bold bg-slate-900 text-white px-3.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Listo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};