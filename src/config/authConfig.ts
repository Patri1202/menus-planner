// src/config/authConfig.ts

/**
 * Configuración de acceso y autenticación sencilla para la aplicación.
 * 
 * - Puedes cambiar tu PIN directamente aquí o mediante la variable de entorno VITE_APP_PIN en un archivo .env
 * - La sesión se mantiene recordada en tu navegador para que no tengas que escribirlo continuamente.
 */
export const AUTH_CONFIG = {
  // PIN por defecto para acceder a tu menú personal (cámbialo aquí si lo deseas)
  DEFAULT_PIN: (import.meta as any).env?.VITE_APP_PIN || '1234',
  
  // Claves de almacenamiento local
  STORAGE_KEYS: {
    AUTH_MODE: 'menus_planner_auth_mode', // 'personal' | 'demo'
    DEMO_STATE: 'menus_planner_demo_state',
    REMEMBER_ME: 'menus_planner_remember_session',
  }
};

/**
 * Función para comprobar si el PIN introducido es válido.
 */
export const validarPinAcceso = (pinIntroducido: string): boolean => {
  const pinLimpio = pinIntroducido.trim();
  const pinConfigurado = AUTH_CONFIG.DEFAULT_PIN.trim();
  return pinLimpio === pinConfigurado;
};
