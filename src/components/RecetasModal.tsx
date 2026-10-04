// src/components/RecetasModal.tsx

import { useState } from 'react';
import type { Receta, CategoriaReceta } from '../types/menuPlan';

export interface RecetarioModalProps {
  estaAbierto: boolean;
  recetas: Receta[];
  alCerrar: () => void;
  alGuardarReceta: (receta: Omit<Receta, 'id'>) => void;
  alEliminarReceta: (id: string) => void;
  alExportarACompra: (ingredientes: string[]) => void;
}

const CATEGORIAS_ETIQUETAS: Record<CategoriaReceta, string> = {
  legumbres: '🥗 Legumbres',
  verduras: '🥦 Verduras',
  pescado: '🐟 Pescado',
  carne: '🥩 Carne',
  pasta_arroz: '🍝 Pasta y Arroz',
  postre_desayuno: '🥞 Desayunos y Dulces',
  otro: '🍳 Otros',
};

export const RecetarioModal = ({
  estaAbierto,
  recetas,
  alCerrar,
  alGuardarReceta,
  alEliminarReceta,
  alExportarACompra,
}: RecetarioModalProps) => {
  // Vista activa: lista de recetas o formulario de alta
  const [modoCreacion, setModoCreacion] = useState(false);
  const [recetaSeleccionadaId, setRecetaSeleccionadaId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState<CategoriaReceta>('otro');
  const [tiempoMinutos, setTiempoMinutos] = useState<number | ''>(25);
  const [urlOrigen, setUrlOrigen] = useState('');
  const [ingredientesTexto, setIngredientesTexto] = useState('');
  const [pasosTexto, setPasosTexto] = useState('');

  if (!estaAbierto) return null;

  // Filtrado de recetas por texto y categoría
  const recetasFiltradas = recetas.filter((r) => {
    const coincideTexto = r.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCat = categoriaFiltro === 'todas' || r.categoria === categoriaFiltro;
    return coincideTexto && coincideCat;
  });

  const recetaActiva = recetas.find((r) => r.id === recetaSeleccionadaId) || recetasFiltradas[0] || null;

  const resetearFormulario = () => {
    setNombre('');
    setCategoria('otro');
    setTiempoMinutos(25);
    setUrlOrigen('');
    setIngredientesTexto('');
    setPasosTexto('');
    setModoCreacion(false);
  };

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    // Convertimos cada salto de línea en un elemento del array
    const ingredientes = ingredientesTexto
      .split('\n')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const pasos = pasosTexto
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    alGuardarReceta({
      nombre: nombre.trim(),
      categoria,
      tiempoMinutos: typeof tiempoMinutos === 'number' ? tiempoMinutos : undefined,
      urlOrigen: urlOrigen.trim() || undefined,
      ingredientes,
      pasos,
    });

    resetearFormulario();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={alCerrar}
    >
      <div
        className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera general */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Mi Recetario</h2>
              <p className="text-xs text-slate-400 font-medium">
                {recetas.length} recetas guardadas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!modoCreacion ? (
              <button
                type="button"
                onClick={() => setModoCreacion(true)}
                className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer"
              >
                + Nueva Receta
              </button>
            ) : (
              <button
                type="button"
                onClick={resetearFormulario}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Volver a la lista
              </button>
            )}

            <button
              type="button"
              onClick={alCerrar}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* CUERPO DEL MODAL */}
        {modoCreacion ? (
          /* Formulario de nueva receta */
          <form onSubmit={manejarEnvio} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Nombre del plato *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Salmón al horno con patatas y eneldo"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Categoría
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as CategoriaReceta)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-white"
                >
                  {Object.entries(CATEGORIAS_ETIQUETAS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Tiempo estimado (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  value={tiempoMinutos}
                  onChange={(e) => setTiempoMinutos(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="Ej: 30"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Enlace al vídeo / red social (opcional)
                </label>
                <input
                  type="url"
                  value={urlOrigen}
                  onChange={(e) => setUrlOrigen(e.target.value)}
                  placeholder="https://instagram.com/reel/..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Bloque Ingredientes */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Ingredientes (uno por línea)
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Escribe o pega la lista; cada salto de línea se guardará como un ingrediente.
                </p>
                <textarea
                  rows={8}
                  value={ingredientesTexto}
                  onChange={(e) => setIngredientesTexto(e.target.value)}
                  placeholder={'2 lomos de salmón\n3 patatas medianas\nEneldo fresco\nAceite de oliva y sal'}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none font-mono"
                />
              </div>

              {/* Bloque Pasos */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Proceso / Preparación (un paso por línea)
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Escribe cada paso por separado para poder seguir la receta fácilmente.
                </p>
                <textarea
                  rows={8}
                  value={pasosTexto}
                  onChange={(e) => setPasosTexto(e.target.value)}
                  placeholder={'Precalentar el horno a 200°C.\nCortar las patatas en rodajas finas y hornear 15 min.\nAñadir el salmón encima y hornear 12 min más.'}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none font-sans"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={resetearFormulario}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!nombre.trim()}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs"
              >
                Guardar Receta
              </button>
            </div>
          </form>
        ) : (
          /* Vista de recetas: Navegador a la izquierda + Detalle a la derecha */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* PANEL IZQUIERDO: Buscador y lista */}
            <div className="w-full md:w-80 border-r border-slate-100 flex flex-col h-full bg-slate-50/50">
              <div className="p-3 border-b border-slate-100 space-y-2 bg-white">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar receta..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 outline-none bg-slate-50"
                />
                <select
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 bg-white outline-none"
                >
                  <option value="todas">Todas las categorías</option>
                  {Object.entries(CATEGORIAS_ETIQUETAS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {recetasFiltradas.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">
                    No hay recetas que coincidan.
                  </p>
                ) : (
                  recetasFiltradas.map((r) => {
                    const activa = recetaActiva?.id === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRecetaSeleccionadaId(r.id)}
                        className={`w-full text-left p-3.5 transition-colors cursor-pointer flex flex-col gap-1 ${
                          activa ? 'bg-white shadow-2xs border-l-4 border-l-emerald-600' : 'hover:bg-slate-100/60'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-800 line-clamp-1">
                          {r.nombre}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{CATEGORIAS_ETIQUETAS[r.categoria]}</span>
                          {r.tiempoMinutos && <span>• ⏱ {r.tiempoMinutos}m</span>}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* PANEL DERECHO: Detalle de la receta seleccionada */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 bg-white">
              {recetaActiva ? (
                <div className="space-y-6">
                  {/* Encabezado de la receta */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mb-1.5">
                        {CATEGORIAS_ETIQUETAS[recetaActiva.categoria]}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">
                        {recetaActiva.nombre}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
                        {recetaActiva.tiempoMinutos && (
                          <span>⏱ {recetaActiva.tiempoMinutos} minutos</span>
                        )}
                        {recetaActiva.urlOrigen && (
                          <a
                            href={recetaActiva.urlOrigen}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:underline flex items-center gap-1"
                          >
                            🔗 Ver enlace del vídeo
                          </a>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => alEliminarReceta(recetaActiva.id)}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Eliminar receta"
                    >
                      Eliminar
                    </button>
                  </div>

                  {/* Dos columnas: Ingredientes y Proceso */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Columna Ingredientes */}
                    <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Ingredientes ({recetaActiva.ingredientes.length})
                        </h4>
                        {recetaActiva.ingredientes.length > 0 && (
                          <button
                            type="button"
                            onClick={() => alExportarACompra(recetaActiva.ingredientes)}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/60 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            + Enviar a la compra
                          </button>
                        )}
                      </div>

                      <ul className="space-y-2 text-sm text-slate-700">
                        {recetaActiva.ingredientes.map((ingrediente, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>{ingrediente}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Columna Pasos de elaboración */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                        Preparación paso a paso
                      </h4>
                      <div className="space-y-4">
                        {recetaActiva.pasos.map((paso, idx) => (
                          <div key={idx} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="flex-1">{paso}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <span className="text-4xl mb-2">🍳</span>
                  <p className="text-sm font-semibold text-slate-600">No hay recetas todavía</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Pulsa en "+ Nueva Receta" arriba para guardar platos que veas en redes o tus comidas familiares habituales.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};