import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { request } from '../services/apiClient';
import { useToast } from '../context/ToastContext';

// Solo pedimos el correo en esta pantalla.
const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
});

// Lógica de la pantalla "Recuperar Acceso": valida el correo, le pide al
// backend que mande un código, y avisa con un toast.
export function useForgotPasswordForm(onSuccess) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setIsSubmitting(true);
    try {
      await request('/recoveryPassword/requestCode', {
        method: 'POST',
        body: JSON.stringify({ email, userType: 'Customer' }),
      });
      showToast('Código enviado a tu correo', 'success');
      onSuccess?.(email); // le pasamos el correo a la pantalla siguiente (VerifyCode)
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  });

  return { control, errors, onSubmit, isSubmitting };
}
