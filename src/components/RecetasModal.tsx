// src/components/RecetasModal.tsx

import { useState, useEffect } from 'react';
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
  // Receta abierta en el sub-modal de detalle
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

  // Atajo de teclado Escape para cerrar el sub-modal o el modal principal
  useEffect(() => {
    const manejarTeclaEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        if (recetaSeleccionadaId) {
          setRecetaSeleccionadaId(null);
        } else if (modoCreacion) {
          resetearFormulario();
        } else {
          alCerrar();
        }
      }
    };

    if (estaAbierto) {
      window.addEventListener('keydown', manejarTeclaEscape);
    }
    return () => window.removeEventListener('keydown', manejarTeclaEscape);
  }, [estaAbierto, recetaSeleccionadaId, modoCreacion, alCerrar]);

  if (!estaAbierto) return null;

  // Filtrado de recetas por texto y categoría
  const recetasFiltradas = recetas.filter((r) => {
    const coincideTexto =
      r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.ingredientes.some((ing) => ing.toLowerCase().includes(busqueda.toLowerCase()));
    const coincideCat = categoriaFiltro === 'todas' || r.categoria === categoriaFiltro;
    return coincideTexto && coincideCat;
  });

  const recetaDetalle = recetas.find((r) => r.id === recetaSeleccionadaId) || null;

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
    <>
      {/* ========================================================================= */}
      {/* 1. MODAL PRINCIPAL: LISTADO DE RECETAS O FORMULARIO DE ALTA              */}
      {/* ========================================================================= */}
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
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📖</span>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Mi Recetario</h2>
                <p className="text-xs text-slate-400 font-medium">
                  {recetas.length} {recetas.length === 1 ? 'receta guardada' : 'recetas guardadas'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!modoCreacion ? (
                <button
                  type="button"
                  onClick={() => setModoCreacion(true)}
                  className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>+</span>
                  <span>Nueva Receta</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetearFormulario}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  ← Volver al listado
                </button>
              )}

              <button
                type="button"
                onClick={alCerrar}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 text-sm transition-colors cursor-pointer"
                title="Cerrar ventana de recetas"
              >
                ✕
              </button>
            </div>
          </div>

          {/* CUERPO DEL MODAL */}
          {modoCreacion ? (
            /* ========================================================================= */
            /* A. Formulario de nueva receta                                             */
            /* ========================================================================= */
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
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!nombre.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs cursor-pointer"
                >
                  Guardar Receta
                </button>
              </div>
            </form>
          ) : (
            /* ========================================================================= */
            /* B. LISTADO COMPLETO DE RECETAS EN CATÁLOGO / CARDS                        */
            /* ========================================================================= */
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/40">
              {/* Barra de búsqueda y selector de categoría */}
              <div className="p-4 sm:px-6 sm:py-3.5 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar receta por nombre o ingrediente..."
                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-slate-50/70"
                  />
                  {busqueda && (
                    <button
                      type="button"
                      onClick={() => setBusqueda('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="w-full sm:w-56 shrink-0">
                  <select
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 text-slate-700 bg-white outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="todas">Todas las categorías</option>
                    {Object.entries(CATEGORIAS_ETIQUETAS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid de recetas */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {recetas.length === 0 ? (
                  /* Estado vacío: no hay recetas todavía */
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6">
                    <span className="text-5xl mb-3">🍳</span>
                    <h3 className="text-base font-bold text-slate-700">No tienes recetas guardadas todavía</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Guarda tus platos familiares o las recetas que encuentres en redes para no olvidarlas nunca.
                    </p>
                    <button
                      type="button"
                      onClick={() => setModoCreacion(true)}
                      className="mt-4 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      + Añadir mi primera receta
                    </button>
                  </div>
                ) : recetasFiltradas.length === 0 ? (
                  /* Estado vacío: no coincide con los filtros */
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6">
                    <span className="text-4xl mb-2">🔎</span>
                    <h3 className="text-sm font-bold text-slate-700">No hay recetas que coincidan</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Prueba con otro término de búsqueda o cambia la categoría seleccionada.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setBusqueda('');
                        setCategoriaFiltro('todas');
                      }}
                      className="mt-3 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Restablecer filtros
                    </button>
                  </div>
                ) : (
                  /* Grid con tarjetas de recetas */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recetasFiltradas.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => setRecetaSeleccionadaId(r.id)}
                        className="bg-white border border-slate-200/90 hover:border-emerald-400 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative"
                      >
                        {/* Parte superior de la tarjeta */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100/80 px-2 py-0.5 rounded-md">
                              {CATEGORIAS_ETIQUETAS[r.categoria]}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {r.tiempoMinutos && (
                                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-0.5">
                                  ⏱ {r.tiempoMinutos}m
                                </span>
                              )}
                              {/* Botón rápido de eliminar */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`¿Seguro que deseas eliminar la receta "${r.nombre}"?`)) {
                                    alEliminarReceta(r.id);
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 rounded-md hover:bg-rose-50 transition-all cursor-pointer text-xs"
                                title="Eliminar receta"
                              >
                                🗑
                              </button>
                            </div>
                          </div>

                          <h3 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                            {r.nombre}
                          </h3>
                        </div>

                        {/* Parte inferior de la tarjeta */}
                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <div className="flex items-center gap-2">
                            <span>🥕 {r.ingredientes.length} ingr.</span>
                            <span>•</span>
                            <span>📝 {r.pasos.length} pasos</span>
                          </div>

                          <span className="font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                            Ver receta →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-MODAL DE DETALLE DE RECETA (Con su 'X' para volver al listado)      */}
      {/* ========================================================================= */}
      {recetaDetalle && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
          onClick={() => setRecetaSeleccionadaId(null)}
        >
          <div
            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del sub-modal con botón para volver y la 'X' */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <button
                type="button"
                onClick={() => setRecetaSeleccionadaId(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span>←</span>
                <span>Volver al listado de recetas</span>
              </button>

              <button
                type="button"
                onClick={() => setRecetaSeleccionadaId(null)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 text-sm font-bold transition-colors cursor-pointer"
                title="Cerrar receta y volver al listado"
              >
                ✕
              </button>
            </div>

            {/* Encabezado con título de la receta y acciones rápidas */}
            <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/40">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                  {CATEGORIAS_ETIQUETAS[recetaDetalle.categoria]}
                </span>
                {recetaDetalle.tiempoMinutos && (
                  <span className="text-xs font-medium text-slate-500">
                    ⏱ {recetaDetalle.tiempoMinutos} minutos
                  </span>
                )}
                {recetaDetalle.urlOrigen && (
                  <a
                    href={recetaDetalle.urlOrigen}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 font-medium ml-auto"
                  >
                    🔗 Ver vídeo o enlace original
                  </a>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {recetaDetalle.nombre}
              </h2>

              {/* Botones de acción */}
              <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-3 border-t border-slate-200/60">
                {recetaDetalle.ingredientes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => alExportarACompra(recetaDetalle.ingredientes)}
                    className="text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200/80 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🛒</span>
                    <span>Añadir ingredientes a la lista de compra</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`¿Seguro que deseas eliminar la receta "${recetaDetalle.nombre}"?`)) {
                      alEliminarReceta(recetaDetalle.id);
                      setRecetaSeleccionadaId(null);
                    }
                  }}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ml-auto"
                >
                  Eliminar receta
                </button>
              </div>
            </div>

            {/* Cuerpo de la receta con scroll independiente para ver todo el texto claramente */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Sección Ingredientes */}
              <div className="bg-emerald-50/40 border border-emerald-100/80 p-4 sm:p-5 rounded-2xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-3 flex items-center gap-2">
                  <span>🥕</span>
                  <span>Ingredientes ({recetaDetalle.ingredientes.length})</span>
                </h3>

                {recetaDetalle.ingredientes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No se indicaron ingredientes.</p>
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                    {recetaDetalle.ingredientes.map((ingrediente, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-white/70 px-2.5 py-1.5 rounded-lg border border-emerald-50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                        <span className="font-medium">{ingrediente}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Sección Proceso de Elaboración */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <span>🍳</span>
                  <span>Preparación paso a paso ({recetaDetalle.pasos.length})</span>
                </h3>

                {recetaDetalle.pasos.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No se indicaron pasos de preparación.</p>
                ) : (
                  <div className="space-y-3">
                    {recetaDetalle.pasos.map((paso, idx) => (
                      <div
                        key={idx}
                        className="flex gap-3 text-sm text-slate-700 leading-relaxed bg-slate-50/60 border border-slate-100 rounded-xl p-3.5"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          {idx + 1}
                        </span>
                        <p className="flex-1 whitespace-pre-line">{paso}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pie del sub-modal */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setRecetaSeleccionadaId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Volver al listado de recetas
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};