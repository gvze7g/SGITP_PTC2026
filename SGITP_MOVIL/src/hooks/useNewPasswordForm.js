import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';

// La contraseña nueva debe tener mínimo 8 caracteres, una mayúscula y un número.
const newPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Incluye al menos una letra mayúscula')
      .regex(/[0-9]/, 'Incluye al menos un número'),
    confirmNewPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmNewPassword'],
  });

// Última pantalla del flujo de recuperación: guarda la contraseña nueva.
export function useNewPasswordForm(onSuccess) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: '', confirmNewPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ newPassword, confirmNewPassword }) => {
    setIsSubmitting(true);
    try {
      await authService.resetPassword(newPassword, confirmNewPassword);
      // Mensaje propio en español (el backend responde en inglés acá).
      showToast('Contraseña actualizada correctamente', 'success');
      onSuccess?.();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  });

  return { control, errors, onSubmit, isSubmitting };
}
