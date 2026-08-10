import { useState } from 'react';

import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';

const CODE_LENGTH = 6;

// Un mensaje de éxito distinto según para qué se está usando la pantalla.
const SUCCESS_MESSAGE = {
  register: 'Cuenta verificada, ya puedes iniciar sesión',
  recovery: 'Código verificado correctamente',
};

// Esta pantalla se reutiliza en 2 flujos distintos ("mode"), así que esta
// función decide qué endpoint llamar y qué hacer según el caso, en vez de
// tener esa lógica repetida dentro de la pantalla.
export function useVerifyCodeForm({ mode, email, onSuccess }) {
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function submit() {
    if (code.length < CODE_LENGTH) {
      showToast('Ingresa el código completo de 6 dígitos', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        await authService.verifyRegistrationCode(code);
      } else {
        await authService.verifyRecoveryCode(code);
      }
      // Mensaje propio en español (el backend a veces contesta en inglés).
      showToast(SUCCESS_MESSAGE[mode], 'success');
      onSuccess?.();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Reenviar código solo existe para recuperar contraseña: al registrarse
  // no hay un endpoint separado para volver a mandar el correo.
  async function resend() {
    if (mode !== 'recovery' || !email) return;

    setIsResending(true);
    try {
      await authService.requestRecoveryCode(email);
      showToast('Código reenviado a tu correo', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsResending(false);
    }
  }

  return {
    code,
    setCode,
    submit,
    resend: mode === 'recovery' ? resend : null,
    isSubmitting,
    isResending,
  };
}
