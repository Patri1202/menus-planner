// src/data/demoData.ts
import type { Plato, TupperPreparado, ItemCompra, Receta } from '../types/menuPlan';
import { obtenerLunesDeLaSemana, formatearFechaAClave } from '../utils/dateUtils';

// Generar claves de fechas para la semana actual de forma dinámica
const lunesActual = obtenerLunesDeLaSemana(new Date());

const getFechaOffset = (diasOffset: number): string => {
  const d = new Date(lunesActual);
  d.setDate(d.getDate() + diasOffset);
  return formatearFechaAClave(d);
};

export const DEMO_TUPPERS: TupperPreparado[] = [
  {
    id: 'demo_tup_1',
    nombre: 'Crema de calabacín y puerros',
    racionesDisponibles: 3,
    fechaCocinado: getFechaOffset(-2),
    lugarAlmacenaje: 'congelador',
  },
  {
    id: 'demo_tup_2',
    nombre: 'Lentejas pardinas con verduras',
    racionesDisponibles: 2,
    fechaCocinado: getFechaOffset(-3),
    lugarAlmacenaje: 'congelador',
  },
  {
    id: 'demo_tup_3',
    nombre: 'Salsa boloñesa casera',
    racionesDisponibles: 4,
    fechaCocinado: getFechaOffset(-5),
    lugarAlmacenaje: 'congelador',
  },
  {
    id: 'demo_tup_4',
    nombre: 'Pollo al curry con leche de coco',
    racionesDisponibles: 2,
    fechaCocinado: getFechaOffset(-1),
    lugarAlmacenaje: 'congelador',
  },
];

export const DEMO_ITEMS_COMPRA: ItemCompra[] = [
  { id: 'demo_item_1', texto: '2 lomos de salmón fresco', comprado: false },
  { id: 'demo_item_2', texto: 'Aguacates maduros (x3)', comprado: false },
  { id: 'demo_item_3', texto: 'Huevos camperos (docena)', comprado: true },
  { id: 'demo_item_4', texto: 'Arroz jazmín o basmati', comprado: true },
  { id: 'demo_item_5', texto: 'Espinacas frescas para ensalada', comprado: false },
  { id: 'demo_item_6', texto: 'Yogures griegos naturales', comprado: false },
  { id: 'demo_item_7', texto: 'Aceite de oliva virgen extra', comprado: true },
];

export const DEMO_RECETAS: Receta[] = [
  {
    id: 'demo_rec_1',
    nombre: 'Salmón al horno con patatas y eneldo',
    categoria: 'pescado',
    tiempoMinutos: 25,
    favorita: true,
    ingredientes: [
      '2 lomos de salmón fresco',
      '2 patatas medianas',
      'Eneldo fresco picado',
      'Aceite de oliva virgen extra',
      'Sal y pimienta negra',
    ],
    pasos: [
      'Precalentar el horno a 200°C con calor arriba y abajo.',
      'Cortar las patatas en rodajas finas (panaderas), colocarlas en una bandeja con sal y aceite de oliva.',
      'Hornear las patatas durante 15 minutos hasta que empiecen a ablandar.',
      'Colocar los lomos de salmón sobre las patatas, sazonar con sal, pimienta y eneldo fresco.',
      'Hornear durante 10-12 minutos más hasta que el salmón esté jugoso.',
    ],
  },
  {
    id: 'demo_rec_2',
    nombre: 'Poke Bowl de salmón, aguacate y edamame',
    categoria: 'pescado',
    tiempoMinutos: 20,
    favorita: true,
    ingredientes: [
      '200g de arroz para sushi o basmati',
      '150g de salmón fresco (previamente congelado)',
      '1 aguacate en láminas',
      '100g de edamames cocidos',
      'Semillas de sésamo tostado',
      'Salsa de soja y aceite de sésamo',
    ],
    pasos: [
      'Cocer el arroz y dejar templar.',
      'Cortar el salmón en dados y marinar 10 min en salsa de soja con unas gotas de aceite de sésamo.',
      'Servir una base de arroz en un bol.',
      'Distribuir en secciones el salmón marinado, el aguacate laminado y los edamames.',
      'Espolvorear con sésamo tostado y servir.',
    ],
  },
  {
    id: 'demo_rec_3',
    nombre: 'Lentejas estofadas con calabaza y verduras',
    categoria: 'legumbres',
    tiempoMinutos: 40,
    favorita: false,
    ingredientes: [
      '300g de lentejas pardinas',
      '200g de calabaza en dados',
      '1 zanahoria en rodajas',
      '1 puerro picado',
      '1 cucharadita de pimentón dulce de la Vera',
      '1 hoja de laurel',
      'Aceite de oliva virgen extra y sal',
    ],
    pasos: [
      'En una olla con un chorro de aceite, sofreír el puerro y la zanahoria durante 5 minutos.',
      'Añadir la calabaza, el pimentón y remover rápido para que no se queme.',
      'Incorporar las lentejas lavadas, la hoja de laurel y cubrir con agua o caldo de verduras.',
      'Cocer a fuego suave unos 30-35 minutos hasta que las lentejas estén tiernas.',
      'Rectificar de sal y dejar reposar 5 minutos antes de servir.',
    ],
  },
  {
    id: 'demo_rec_4',
    nombre: 'Pollo salteado con verduras al wok',
    categoria: 'carne',
    tiempoMinutos: 15,
    favorita: false,
    ingredientes: [
      '350g de pechuga de pollo en tiras',
      '1 pimiento rojo en juliana',
      '1 calabacín en bastones',
      '1 cebolla morada en tiras',
      '2 cucharadas de salsa de soja',
      '1 cucharadita de jengibre fresco rallado',
    ],
    pasos: [
      'Calentar un wok o sartén amplia a fuego alto con un poco de aceite.',
      'Dorar las tiras de pollo durante 3-4 minutos hasta que cambien de color y retirar.',
      'En la misma sartén bien caliente, saltear las verduras al dente (3-4 minutos).',
      'Reincorporar el pollo, añadir el jengibre y la salsa de soja.',
      'Saltear todo junto 1 minuto más y servir caliente.',
    ],
  },
];

export const obtenerRegistroComidasDemo = (): Record<string, Plato> => {
  return {
    [`${getFechaOffset(0)}_almuerzo`]: {
      id: 'demo_plato_1',
      nombre: 'Lentejas estofadas con calabaza',
      esBatchCooking: true,
      tupperId: 'demo_tup_2',
    },
    [`${getFechaOffset(0)}_cena`]: {
      id: 'demo_plato_2',
      nombre: 'Tortilla francesa con ensalada verde',
      esBatchCooking: false,
    },
    [`${getFechaOffset(1)}_almuerzo`]: {
      id: 'demo_plato_3',
      nombre: 'Salmón al horno con patatas y eneldo',
      esBatchCooking: false,
    },
    [`${getFechaOffset(1)}_cena`]: {
      id: 'demo_plato_4',
      nombre: 'Crema de calabacín y puerros',
      esBatchCooking: true,
      tupperId: 'demo_tup_1',
    },
    [`${getFechaOffset(2)}_almuerzo`]: {
      id: 'demo_plato_5',
      nombre: 'Pollo al curry con arroz basmati',
      esBatchCooking: true,
      tupperId: 'demo_tup_4',
    },
    [`${getFechaOffset(2)}_cena`]: {
      id: 'demo_plato_6',
      nombre: 'Revuelto de champiñones y gambas',
      esBatchCooking: false,
    },
    [`${getFechaOffset(3)}_almuerzo`]: {
      id: 'demo_plato_7',
      nombre: 'Pasta fresca con salsa boloñesa',
      esBatchCooking: true,
      tupperId: 'demo_tup_3',
    },
    [`${getFechaOffset(3)}_cena`]: {
      id: 'demo_plato_8',
      nombre: 'Poke Bowl de salmón y aguacate',
      esBatchCooking: false,
    },
    [`${getFechaOffset(4)}_almuerzo`]: {
      id: 'demo_plato_9',
      nombre: 'Pollo salteado con verduras al wok',
      esBatchCooking: false,
    },
    [`${getFechaOffset(4)}_cena`]: {
      id: 'demo_plato_10',
      nombre: 'Pizza casera margarita y rúcula',
      esBatchCooking: false,
    },
  };
};
