// src/types/menuPlan.ts

// ---------------------------------------------------------------------------
// 1. TIPOS LITERALES (Opciones fijas)
// ---------------------------------------------------------------------------

// Franja horaria de la comida: solo permitimos 'almuerzo' o 'cena'
// Usamos '|' para que TypeScript no deje meter ningún otro texto
export type TipoComida = 'almuerzo' | 'cena';

// Dónde podemos guardar un tupper en casa: 'nevera' o 'congelador'
export type LugarAlmacenaje = 'nevera' | 'congelador';

// ---------------------------------------------------------------------------
// 2. MODELOS PRINCIPALES (Interfaces)
// ---------------------------------------------------------------------------

// Representa un plato individual de comida o cena
export interface Plato {
  // Identificador único (ej: "plato_17112026")
  id: string;

  // Nombre de la comida (ej: "Lentejas con verduras")
  nombre: string;

  // Notas o recordatorios opcionales (el '?' indica que puede estar vacío)
  notas?: string;

  // Indica si este plato viene de comida preparada con antelación (tupper)
  esBatchCooking?: boolean;

  tupperId?: string;
}

// Representa una casilla o hueco en el calendario (cada día tendrá almuerzo y cena)
export interface CasillaMenu {
  // Identificador de la casilla (ej: "2026-10-02_almuerzo")
  id: string;

  // Fecha del día en formato "YYYY-MM-DD"
  fecha: string;

  // Momento del día: 'almuerzo' o 'cena'
  tipoComida: TipoComida;

  // El plato asignado, o null si la casilla todavía está vacía
  plato: Plato | null;
}

// Representa un tupper guardado en la lista de Batch Cooking
export interface TupperPreparado {
  // Identificador único del tupper
  id: string;

  // Nombre de la comida (ej: "Crema de calabacín")
  nombre: string;

  // Raciones disponibles que quedan por consumir
  racionesDisponibles: number;

  // Fecha en la que se cocinó ("YYYY-MM-DD")
  fechaCocinado?: string;

  // Dónde está guardado: 'nevera' o 'congelador'
  lugarAlmacenaje?: 'nevera' | 'congelador';
}

export interface ItemCompra {
  id: string;
  texto: string;
  comprado: boolean;
}


// Categorías comunes para filtrar y organizar recetas
export type CategoriaReceta = 
  | 'legumbres' 
  | 'verduras' 
  | 'pescado' 
  | 'carne' 
  | 'pasta_arroz' 
  | 'postre_desayuno'
  | 'otro';

export interface Receta {
  id: string;
  nombre: string;
  categoria: CategoriaReceta;
  tiempoMinutos?: number;
  urlOrigen?: string;          // Enlace al reel, TikTok o web si procede
  ingredientes: string[];      // Lista de ingredientes necesarios
  pasos: string[];             // Instrucciones ordenadas de preparación
  favorita?: boolean;
}