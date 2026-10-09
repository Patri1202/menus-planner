// src/utils/alertas.ts
import Swal from 'sweetalert2';

/**
 * Toast flotante rápido en la esquina superior derecha
 * Ideal para notificaciones breves sin bloquear al usuario
 */
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

/**
 * Notificación toast de éxito (ej: ingredientes añadidos a la compra)
 */
export const mostrarToastExito = (mensaje: string) => {
  return Toast.fire({
    icon: 'success',
    title: mensaje,
  });
};

/**
 * Diálogo de confirmación interactivo
 * Devuelve true si el usuario pulsa "Confirmar", false si cancela
 */
export const confirmarAccion = async (
  titulo: string,
  texto: string,
  textoConfirmar = 'Sí, eliminar',
  textoCancelar = 'Cancelar'
): Promise<boolean> => {
  const resultado = await Swal.fire({
    title: titulo,
    text: texto,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#059669', // Verde esmeralda coherente con el tema
    cancelButtonColor: '#94a3b8', // Gris pizarra suave
    confirmButtonText: textoConfirmar,
    cancelButtonText: textoCancelar,
    reverseButtons: true,
    focusCancel: true,
  });

  return resultado.isConfirmed;
};

/**
 * Alerta informativa o de éxito en modal central
 */
export const mostrarAlertaExito = (titulo: string, texto?: string) => {
  return Swal.fire({
    title: titulo,
    text: texto,
    icon: 'success',
    confirmButtonColor: '#059669',
    confirmButtonText: 'Aceptar',
  });
};
