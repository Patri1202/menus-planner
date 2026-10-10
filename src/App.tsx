// src/App.tsx

import { useState, useEffect, useCallback } from 'react';

// Conexión y utilidades de Firebase Firestore
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Tipos definidos en la aplicación
import type { Plato, TipoComida, TupperPreparado, ItemCompra, Receta } from './types/menuPlan';
import { RecetarioModal as RecetasModal } from './components/RecetasModal';

// Utilidades de fechas
import {
  obtenerLunesDeLaSemana,
  obtenerDiasDeLaSemana,
  formatearRangoSemana,
} from './utils/dateUtils';

// Componentes modulares
import { CabeceraSemanal } from './components/CabeceraSemanal';
import { ColumnaDia } from './components/ColumnaDia';
import { ModalAsignarPlato } from './components/ModalAsignarPlato';
import { ModalCongelador } from './components/ModalCongelador';
import { ListaCompraModal } from './components/ListaCompraModal';
import { LoginScreen } from './components/LoginScreen';

import { mostrarToastExito, confirmarAccion } from './utils/alertas';
import { AUTH_CONFIG } from './config/authConfig';
import {
  obtenerRegistroComidasDemo,
  DEMO_TUPPERS,
  DEMO_ITEMS_COMPRA,
  DEMO_RECETAS,
} from './data/demoData';

// Referencia fija al documento del hogar en Firestore
const docHogarRef = doc(db, 'hogares', 'mi_casa');

export default function App() {
  // ---------------------------------------------------------------------------
  // 0. Modo de Acceso y Autenticación
  // ---------------------------------------------------------------------------
  const [modoAcceso, setModoAcceso] = useState<'personal' | 'demo' | null>(() => {
    const modoGuardado =
      localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_MODE) ||
      sessionStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_MODE);
    if (modoGuardado === 'personal' || modoGuardado === 'demo') {
      return modoGuardado;
    }
    return null;
  });

  // ---------------------------------------------------------------------------
  // 1. Navegación y estado de fechas
  // ---------------------------------------------------------------------------
  const [fechaLunesActual, setFechaLunesActual] = useState<Date>(() =>
    obtenerLunesDeLaSemana(new Date())
  );

  const manejarRetrocederSemana = () => {
    setFechaLunesActual((fechaPrevia) => {
      const nuevaFecha = new Date(fechaPrevia);
      nuevaFecha.setDate(nuevaFecha.getDate() - 7);
      return nuevaFecha;
    });
  };

  const manejarAvanzarSemana = () => {
    setFechaLunesActual((fechaPrevia) => {
      const nuevaFecha = new Date(fechaPrevia);
      nuevaFecha.setDate(nuevaFecha.getDate() + 7);
      return nuevaFecha;
    });
  };

  const manejarVolverAHoy = () => {
    setFechaLunesActual(obtenerLunesDeLaSemana(new Date()));
  };

  // ---------------------------------------------------------------------------
  // 2. Estados Principales de Datos
  // ---------------------------------------------------------------------------
  const [registroComidas, setRegistroComidas] = useState<Record<string, Plato>>({});
  const [tuppers, setTuppers] = useState<TupperPreparado[]>([]);
  const [itemsCompra, setItemsCompra] = useState<ItemCompra[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);

  // ---------------------------------------------------------------------------
  // 3. Carga y Sincronización de Datos (Personal vs Demo)
  // ---------------------------------------------------------------------------

  // Carga o reinicio del Modo Demo
  const cargarDatosDemo = useCallback(() => {
    const demoGuardado = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.DEMO_STATE);
    if (demoGuardado) {
      try {
        const parsed = JSON.parse(demoGuardado);
        setRegistroComidas(parsed.registroComidas || obtenerRegistroComidasDemo());
        setTuppers(parsed.tuppers || DEMO_TUPPERS);
        setItemsCompra(parsed.itemsCompra || DEMO_ITEMS_COMPRA);
        setRecetas(parsed.recetas || DEMO_RECETAS);
        return;
      } catch (err) {
        console.warn('Error al leer datos demo guardados, restableciendo iniciales.', err);
      }
    }
    setRegistroComidas(obtenerRegistroComidasDemo());
    setTuppers(DEMO_TUPPERS);
    setItemsCompra(DEMO_ITEMS_COMPRA);
    setRecetas(DEMO_RECETAS);
  }, []);

  useEffect(() => {
    if (modoAcceso === 'demo') {
      cargarDatosDemo();
      return;
    }

    if (modoAcceso === 'personal') {
      // Escucha en tiempo real de Firebase Firestore para el hogar personal
      const desuscribir = onSnapshot(docHogarRef, (docSnap) => {
        if (docSnap.exists()) {
          const datos = docSnap.data();
          if (datos.registroComidas) setRegistroComidas(datos.registroComidas);
          if (datos.tuppers) setTuppers(datos.tuppers);
          if (datos.itemsCompra) setItemsCompra(datos.itemsCompra);
          if (datos.recetas) setRecetas(datos.recetas);
        }
      });

      return () => desuscribir();
    }
  }, [modoAcceso, cargarDatosDemo]);

  // Función para eliminar campos undefined recursivamente (Firestore los rechaza)
  const eliminarCamposUndefined = <T,>(obj: T): T => {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(eliminarCamposUndefined) as unknown as T;
    }
    const limpio: Record<string, unknown> = {};
    for (const [clave, valor] of Object.entries(obj)) {
      if (valor !== undefined) {
        limpio[clave] = eliminarCamposUndefined(valor);
      }
    }
    return limpio as T;
  };

  // Función de persistencia centralizada
  const persistirCambios = async (datosNuevos: {
    registroComidas?: Record<string, Plato>;
    tuppers?: TupperPreparado[];
    itemsCompra?: ItemCompra[];
    recetas?: Receta[];
  }) => {
    if (modoAcceso === 'personal') {
      try {
        const datosLimpios = eliminarCamposUndefined(datosNuevos);
        await setDoc(docHogarRef, datosLimpios, { merge: true });
      } catch (error) {
        console.error('Error al guardar en Firestore:', error);
      }
    } else if (modoAcceso === 'demo') {
      // En modo demo, guardamos en localStorage de forma totalmente aislada
      try {
        const estadoDemoActual = {
          registroComidas: datosNuevos.registroComidas ?? registroComidas,
          tuppers: datosNuevos.tuppers ?? tuppers,
          itemsCompra: datosNuevos.itemsCompra ?? itemsCompra,
          recetas: datosNuevos.recetas ?? recetas,
        };
        localStorage.setItem(
          AUTH_CONFIG.STORAGE_KEYS.DEMO_STATE,
          JSON.stringify(estadoDemoActual)
        );
      } catch (err) {
        console.error('Error al guardar estado demo local:', err);
      }
    }
  };

  // Manejar reinicio de datos de demostración
  const manejarReiniciarDemo = async () => {
    const confirmado = await confirmarAccion(
      '¿Restablecer datos de prueba?',
      'Se volverán a cargar los platos, recetas y tuppers de ejemplo iniciales.',
      'Sí, restablecer',
      'Cancelar'
    );
    if (confirmado) {
      localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.DEMO_STATE);
      setRegistroComidas(obtenerRegistroComidasDemo());
      setTuppers(DEMO_TUPPERS);
      setItemsCompra(DEMO_ITEMS_COMPRA);
      setRecetas(DEMO_RECETAS);
      mostrarToastExito('Datos de demostración restablecidos.');
    }
  };

  // Manejar cierre de sesión
  const manejarCerrarSesion = async () => {
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_MODE);
    sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_MODE);
    setModoAcceso(null);
    setRegistroComidas({});
    setTuppers([]);
    setItemsCompra([]);
    setRecetas([]);
  };

  // ---------------------------------------------------------------------------
  // 4. Lógica de Tuppers / Congelador
  // ---------------------------------------------------------------------------
  const [modalCongeladorAbierto, setModalCongeladorAbierto] = useState(false);

  const manejarCrearTupper = (datos: { nombre: string; raciones: number }) => {
    const nuevoTupper: TupperPreparado = {
      id: `tupper_${Date.now()}`,
      nombre: datos.nombre,
      racionesDisponibles: datos.raciones,
      fechaCocinado: new Date().toISOString().split('T')[0],
      lugarAlmacenaje: 'congelador',
    };
    const listaActualizada = [nuevoTupper, ...tuppers];
    setTuppers(listaActualizada);
    persistirCambios({ tuppers: listaActualizada });
  };

  const manejarEliminarTupper = (id: string) => {
    const listaActualizada = tuppers.filter((t) => t.id !== id);
    setTuppers(listaActualizada);
    persistirCambios({ tuppers: listaActualizada });
  };

  // ---------------------------------------------------------------------------
  // 5. Lógica de Lista de la Compra
  // ---------------------------------------------------------------------------
  const [modalCompraAbierto, setModalCompraAbierto] = useState(false);

  const manejarAnadirItemCompra = (texto: string) => {
    const nuevoItem: ItemCompra = {
      id: `item_${Date.now()}`,
      texto,
      comprado: false,
    };
    const listaActualizada = [nuevoItem, ...itemsCompra];
    setItemsCompra(listaActualizada);
    persistirCambios({ itemsCompra: listaActualizada });
  };

  const manejarAlternarComprado = (id: string) => {
    const listaActualizada = itemsCompra.map((item) =>
      item.id === id ? { ...item, comprado: !item.comprado } : item
    );
    setItemsCompra(listaActualizada);
    persistirCambios({ itemsCompra: listaActualizada });
  };

  const manejarEliminarItemCompra = (id: string) => {
    const listaActualizada = itemsCompra.filter((item) => item.id !== id);
    setItemsCompra(listaActualizada);
    persistirCambios({ itemsCompra: listaActualizada });
  };

  const manejarLimpiarComprados = () => {
    const listaActualizada = itemsCompra.filter((item) => !item.comprado);
    setItemsCompra(listaActualizada);
    persistirCambios({ itemsCompra: listaActualizada });
  };

  const totalPendientesCompra = itemsCompra.filter((item) => !item.comprado).length;

  // ---------------------------------------------------------------------------
  // 6. Lógica de Recetario
  // ---------------------------------------------------------------------------
  const [modalRecetasAbierto, setModalRecetasAbierto] = useState(false);

  const manejarGuardarReceta = (nueva: Omit<Receta, 'id'>) => {
    const recetaCompleta: Receta = {
      ...nueva,
      id: `rec_${Date.now()}`,
    };
    const listaActualizada = [recetaCompleta, ...recetas];
    setRecetas(listaActualizada);
    persistirCambios({ recetas: listaActualizada });
  };

  const manejarEliminarReceta = (id: string) => {
    const listaActualizada = recetas.filter((r) => r.id !== id);
    setRecetas(listaActualizada);
    persistirCambios({ recetas: listaActualizada });
  };

  const manejarExportarACompra = (ingredientes: string[]) => {
    const nuevosItems: ItemCompra[] = ingredientes.map((ing, idx) => ({
      id: `item_rec_${Date.now()}_${idx}`,
      texto: ing,
      comprado: false,
    }));
    const listaActualizada = [...nuevosItems, ...itemsCompra];
    setItemsCompra(listaActualizada);
    persistirCambios({ itemsCompra: listaActualizada });
    mostrarToastExito(`¡Se han añadido ${ingredientes.length} ingredientes a tu lista de compra!`);
  };

  // ---------------------------------------------------------------------------
  // 7. Lógica de Asignación y Eliminación de Platos
  // ---------------------------------------------------------------------------
  const [modalAbierto, setModalAbierto] = useState(false);
  const [seleccionActual, setSeleccionActual] = useState<{
    fecha: string;
    momento: TipoComida;
  } | null>(null);

  const manejarPulsarMomento = (fecha: string, momento: TipoComida) => {
    setSeleccionActual({ fecha, momento });
    setModalAbierto(true);
  };

  const manejarCerrarModal = () => {
    setModalAbierto(false);
    setSeleccionActual(null);
  };

  const manejarGuardarPlato = (datosPlato: {
    nombre: string;
    esBatchCooking: boolean;
    tupperId?: string;
  }) => {
    if (!seleccionActual) return;

    const claveCasilla = `${seleccionActual.fecha}_${seleccionActual.momento}`;

    const nuevoRegistro = {
      ...registroComidas,
      [claveCasilla]: {
        id: registroComidas[claveCasilla]?.id || `plato_${Date.now()}`,
        nombre: datosPlato.nombre,
        esBatchCooking: datosPlato.esBatchCooking,
        tupperId: datosPlato.tupperId,
      },
    };

    let nuevosTuppers = tuppers;
    if (datosPlato.tupperId) {
      nuevosTuppers = tuppers.map((t) => {
        if (t.id === datosPlato.tupperId) {
          return {
            ...t,
            racionesDisponibles: Math.max(0, t.racionesDisponibles - 1),
          };
        }
        return t;
      });
    }

    setRegistroComidas(nuevoRegistro);
    setTuppers(nuevosTuppers);
    persistirCambios({ registroComidas: nuevoRegistro, tuppers: nuevosTuppers });
    manejarCerrarModal();
  };

  const manejarEliminarMomento = (fecha: string, momento: TipoComida) => {
    const claveCasilla = `${fecha}_${momento}`;
    const plato = registroComidas[claveCasilla];

    let nuevosTuppers = tuppers;
    if (plato?.tupperId) {
      nuevosTuppers = tuppers.map((t) =>
        t.id === plato.tupperId ? { ...t, racionesDisponibles: t.racionesDisponibles + 1 } : t
      );
    }

    const nuevoRegistro = { ...registroComidas };
    delete nuevoRegistro[claveCasilla];

    setRegistroComidas(nuevoRegistro);
    setTuppers(nuevosTuppers);
    persistirCambios({ registroComidas: nuevoRegistro, tuppers: nuevosTuppers });
  };

  // ---------------------------------------------------------------------------
  // 8. Renderizado Condicional: Pantalla de Login / Entrada
  // ---------------------------------------------------------------------------
  if (!modoAcceso) {
    return (
      <LoginScreen
        alAccederPersonal={() => setModoAcceso('personal')}
        alAccederDemo={() => setModoAcceso('demo')}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // 9. Cálculos y Render de la App Principal
  // ---------------------------------------------------------------------------
  const diasSemana = obtenerDiasDeLaSemana(fechaLunesActual);
  const textoRangoSemana = formatearRangoSemana(fechaLunesActual);

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Banner informativo en Modo Demo */}
        {modoAcceso === 'demo' && (
          <aside aria-label="Aviso de Modo Demo" className="mb-4 p-3.5 bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 border border-amber-200/90 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-950 shadow-xs animate-in fade-in">
            <div>
              <p>
                <strong>Modo Demo:</strong> Estás probando la aplicación en un entorno seguro. Puedes planificar platos, añadir recetas o tuppers sin afectar a la base de datos real.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={manejarReiniciarDemo}
                className="px-3 py-1.5 bg-white hover:bg-amber-100/80 text-amber-900 font-bold rounded-lg border border-amber-300 transition-colors text-xs cursor-pointer shadow-2xs"
                title="Restablecer platos y recetas de prueba"
              >
                🔄 Reiniciar Demo
              </button>
              <button
                type="button"
                onClick={manejarCerrarSesion}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg shadow-2xs transition-colors text-xs cursor-pointer"
                title="Salir del Modo Demo"
              >
                Salir
              </button>
            </div>
          </aside>
        )}

        {/* Cabecera semanal */}
        <CabeceraSemanal
          tituloRango={textoRangoSemana}
          totalPendientesCompra={totalPendientesCompra}
          totalTuppersCongelador={tuppers.reduce((acc, t) => acc + (t.racionesDisponibles || 0), 0)}
          modoAcceso={modoAcceso}
          alSemanaAnterior={manejarRetrocederSemana}
          alSemanaSiguiente={manejarAvanzarSemana}
          alVolverHoy={manejarVolverAHoy}
          alAbrirListaCompra={() => setModalCompraAbierto(true)}
          alAbrirRecetas={() => setModalRecetasAbierto(true)}
          alAbrirCongelador={() => setModalCongeladorAbierto(true)}
          alCerrarSesion={manejarCerrarSesion}
        />

        {/* Cuadrícula semanal (7 columnas) */}
        <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {diasSemana.map((dia) => {
            const platoAlmuerzo = registroComidas[`${dia.claveFecha}_almuerzo`] || null;
            const platoCena = registroComidas[`${dia.claveFecha}_cena`] || null;

            return (
              <ColumnaDia
                key={dia.claveFecha}
                dia={dia}
                platoAlmuerzo={platoAlmuerzo}
                platoCena={platoCena}
                alPulsarMomento={manejarPulsarMomento}
                alEliminarMomento={manejarEliminarMomento}
              />
            );
          })}
        </main>

        {/* Modal de asignación de plato */}
        {seleccionActual && (
          <ModalAsignarPlato
            estaAbierto={modalAbierto}
            fechaSeleccionada={seleccionActual.fecha}
            momentoSeleccionado={seleccionActual.momento}
            platoActual={
              registroComidas[`${seleccionActual.fecha}_${seleccionActual.momento}`] || null
            }
            tuppersDisponibles={tuppers}
            recetasDisponibles={recetas}
            alCerrar={manejarCerrarModal}
            alGuardar={manejarGuardarPlato}
          />
        )}

        {/* Modal de la Lista de la Compra */}
        <ListaCompraModal
          estaAbierto={modalCompraAbierto}
          items={itemsCompra}
          alCerrar={() => setModalCompraAbierto(false)}
          alAlternarComprado={manejarAlternarComprado}
          alAnadirItem={manejarAnadirItemCompra}
          alEliminarItem={manejarEliminarItemCompra}
          alLimpiarComprados={manejarLimpiarComprados}
        />

        {/* Modal de Recetas */}
        <RecetasModal
          estaAbierto={modalRecetasAbierto}
          recetas={recetas}
          alCerrar={() => setModalRecetasAbierto(false)}
          alGuardarReceta={manejarGuardarReceta}
          alEliminarReceta={manejarEliminarReceta}
          alExportarACompra={manejarExportarACompra}
        />

        {/* Modal del Congelador */}
        <ModalCongelador
          estaAbierto={modalCongeladorAbierto}
          tuppers={tuppers}
          alCerrar={() => setModalCongeladorAbierto(false)}
          alCrearTupper={manejarCrearTupper}
          alEliminarTupper={manejarEliminarTupper}
        />

      </div>
    </div>
  );
}