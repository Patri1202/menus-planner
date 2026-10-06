// src/App.tsx

import { useState, useEffect } from 'react';

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

// Referencia fija al documento del hogar en Firestore
const docHogarRef = doc(db, 'hogares', 'mi_casa');

export default function App() {
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
  const [recetas, setRecetas] = useState<Receta[]>([
    {
      id: 'rec_1',
      nombre: 'Salmón al horno con patatas y eneldo',
      categoria: 'pescado',
      tiempoMinutos: 25,
      ingredientes: [
        '2 lomos de salmón fresco',
        '2 patatas medianas',
        'Eneldo fresco picado',
        'Aceite de oliva virgen extra',
        'Sal y pimienta',
      ],
      pasos: [
        'Precalentar el horno a 200°C con calor arriba y abajo.',
        'Cortar las patatas en rodajas finas, colocarlas en una bandeja con sal y un chorrito de aceite.',
        'Hornear las patatas durante 15 minutos.',
        'Colocar los lomos de salmón sobre las patatas, sazonar con sal, pimienta y eneldo fresco.',
        'Hornear durante 10-12 minutos más hasta que el salmón esté en su punto.',
      ],
    },
  ]);

  // ---------------------------------------------------------------------------
  // 3. Sincronización en Tiempo Real con Firebase Firestore
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Escucha en tiempo real: cualquier cambio en la nube se refleja de inmediato
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
  }, []);

  // Función para eliminar campos undefined recursivamente (Firestore los rechaza y causa errores)
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

  // Función auxiliar para guardar cambios parciales en Firestore
  const guardarEnFirestore = async (datosNuevos: {
    registroComidas?: Record<string, Plato>;
    tuppers?: TupperPreparado[];
    itemsCompra?: ItemCompra[];
    recetas?: Receta[];
  }) => {
    try {
      const datosLimpios = eliminarCamposUndefined(datosNuevos);
      await setDoc(docHogarRef, datosLimpios, { merge: true });
    } catch (error) {
      console.error('Error al guardar en Firestore:', error);
    }
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
    guardarEnFirestore({ tuppers: listaActualizada });
  };

  const manejarEliminarTupper = (id: string) => {
    const listaActualizada = tuppers.filter((t) => t.id !== id);
    setTuppers(listaActualizada);
    guardarEnFirestore({ tuppers: listaActualizada });
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
    guardarEnFirestore({ itemsCompra: listaActualizada });
  };

  const manejarAlternarComprado = (id: string) => {
    const listaActualizada = itemsCompra.map((item) =>
      item.id === id ? { ...item, comprado: !item.comprado } : item
    );
    setItemsCompra(listaActualizada);
    guardarEnFirestore({ itemsCompra: listaActualizada });
  };

  const manejarEliminarItemCompra = (id: string) => {
    const listaActualizada = itemsCompra.filter((item) => item.id !== id);
    setItemsCompra(listaActualizada);
    guardarEnFirestore({ itemsCompra: listaActualizada });
  };

  const manejarLimpiarComprados = () => {
    const listaActualizada = itemsCompra.filter((item) => !item.comprado);
    setItemsCompra(listaActualizada);
    guardarEnFirestore({ itemsCompra: listaActualizada });
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
    guardarEnFirestore({ recetas: listaActualizada });
  };

  const manejarEliminarReceta = (id: string) => {
    const listaActualizada = recetas.filter((r) => r.id !== id);
    setRecetas(listaActualizada);
    guardarEnFirestore({ recetas: listaActualizada });
  };

  const manejarExportarACompra = (ingredientes: string[]) => {
    const nuevosItems: ItemCompra[] = ingredientes.map((ing, idx) => ({
      id: `item_rec_${Date.now()}_${idx}`,
      texto: ing,
      comprado: false,
    }));
    const listaActualizada = [...nuevosItems, ...itemsCompra];
    setItemsCompra(listaActualizada);
    guardarEnFirestore({ itemsCompra: listaActualizada });
    alert(`¡Se han añadido ${ingredientes.length} ingredientes a tu lista de compra!`);
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
    guardarEnFirestore({ registroComidas: nuevoRegistro, tuppers: nuevosTuppers });
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
    guardarEnFirestore({ registroComidas: nuevoRegistro, tuppers: nuevosTuppers });
  };

  // ---------------------------------------------------------------------------
  // 8. Cálculos y Render
  // ---------------------------------------------------------------------------
  const diasSemana = obtenerDiasDeLaSemana(fechaLunesActual);
  const textoRangoSemana = formatearRangoSemana(fechaLunesActual);

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabecera semanal */}
        <CabeceraSemanal
          tituloRango={textoRangoSemana}
          totalPendientesCompra={totalPendientesCompra}
          totalTuppersCongelador={tuppers.reduce((acc, t) => acc + (t.racionesDisponibles || 0), 0)}
          alSemanaAnterior={manejarRetrocederSemana}
          alSemanaSiguiente={manejarAvanzarSemana}
          alVolverHoy={manejarVolverAHoy}
          alAbrirListaCompra={() => setModalCompraAbierto(true)}
          alAbrirRecetas={() => setModalRecetasAbierto(true)}
          alAbrirCongelador={() => setModalCongeladorAbierto(true)}
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