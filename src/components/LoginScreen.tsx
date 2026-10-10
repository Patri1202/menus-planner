// src/components/LoginScreen.tsx

import React, { useState } from 'react';
import { validarPinAcceso, AUTH_CONFIG } from '../config/authConfig';

interface LoginScreenProps {
  alAccederPersonal: () => void;
  alAccederDemo: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  alAccederPersonal,
  alAccederDemo,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mostrarPin, setMostrarPin] = useState(false);
  const [recordarSesion, setRecordarSesion] = useState(true);
  const [estaCargando, setEstaCargando] = useState(false);

  const manejarEnvioPersonal = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pin.trim()) {
      setError('Por favor, introduce tu PIN de acceso.');
      return;
    }

    setEstaCargando(true);

    setTimeout(() => {
      if (validarPinAcceso(pin)) {
        if (recordarSesion) {
          localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_MODE, 'personal');
          localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.REMEMBER_ME, 'true');
        } else {
          sessionStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_MODE, 'personal');
        }
        alAccederPersonal();
      } else {
        setError('PIN incorrecto. Vuelve a intentarlo.');
        setEstaCargando(false);
      }
    }, 250);
  };

  const manejarEntrarDemo = () => {
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_MODE, 'demo');
    alAccederDemo();
  };

  return (
    <div className="min-h-screen bg-slate-900/95 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800 relative overflow-hidden">
      {/* Elementos decorativos de fondo con gradientes suaves */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera del modal / tarjeta */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl mb-3 overflow-hidden shadow-md border-2 border-white/30 bg-white/10 flex items-center justify-center">
            <img
              src="/icono-menuplanner.jpg"
              alt="Menu Planner Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Menu Planner</h1>
          <p className="text-xs text-emerald-100/90 mt-1 font-medium">
            Planificador de Comidas, Batch Cooking y Congelador
          </p>
        </div>

        {/* Cuerpo del formulario de acceso */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* SECCIÓN 1: ACCESO PERSONAL */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600"></span>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Acceso Personal (Mi Hogar)
              </h2>
            </div>

            <form onSubmit={manejarEnvioPersonal} className="space-y-4">
              <div>
                <label
                  htmlFor="input-pin"
                  className="block text-xs font-bold text-slate-600 mb-1.5"
                >
                  Introduce tu PIN de acceso
                </label>
                <div className="relative">
                  <input
                    id="input-pin"
                    type={mostrarPin ? 'text' : 'password'}
                    inputMode="numeric"
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      if (error) setError(null);
                    }}
                    autoFocus
                    className={`w-full px-4 py-3 text-center text-xl font-bold tracking-widest bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      error
                        ? 'border-red-400 focus:ring-red-300 text-red-700 bg-red-50/50'
                        : 'border-slate-200 focus:ring-emerald-500/30 focus:border-emerald-600 text-slate-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPin(!mostrarPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm px-1.5 py-1 rounded transition-colors"
                    title={mostrarPin ? 'Ocultar PIN' : 'Ver PIN'}
                  >
                    {mostrarPin ? '🙈' : '👁️'}
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-red-600 font-semibold mt-2 flex items-center gap-1.5 animate-in fade-in">
                    <span>⚠️</span> {error}
                  </p>
                )}
              </div>

              {/* Recordar sesión */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={recordarSesion}
                    onChange={(e) => setRecordarSesion(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    Recordar en este navegador
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={estaCargando}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 text-sm"
              >
                {estaCargando ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    <span>Accediendo...</span>
                  </>
                ) : (
                  <span>Acceder a mi Menú</span>
                )}
              </button>
            </form>
          </div>

          {/* DIVISOR */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              o si estás de visita
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* SECCIÓN 2: MODO DEMO */}
          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 p-4 rounded-xl border border-emerald-100 text-center space-y-3">
            <div className="flex items-center justify-center text-xs font-bold text-emerald-800">
              <span>Modo demo</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Prueba todas las funcionalidades en un entorno demo interactivo y seguro.
            </p>
            <button
              type="button"
              onClick={manejarEntrarDemo}
              className="w-full py-2.5 px-4 bg-white hover:bg-emerald-50/80 active:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200 shadow-xs hover:border-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Entrar como Invitado</span>
            </button>
          </div>
        </div>

        {/* Pie informativo */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-600 font-medium">
            Tus datos privados se sincronizan de forma segura con Firebase Cloud.
          </p>
        </div>
      </div>
    </div>
  );
};
