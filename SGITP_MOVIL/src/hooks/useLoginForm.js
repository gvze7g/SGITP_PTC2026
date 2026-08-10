import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const loginSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Toda la lógica de la pantalla de Login: validación, llamada al backend,
// mensaje de bienvenida y el checkbox de "Recordarme".
export function useLoginForm(onSuccess) {
  const { login, isSubmitting } = useAuth();
  const { showToast } = useToast();
  const [rememberMe, setRememberMe] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      const loggedInUser = await login(email, password);
      showToast(`Bienvenido, ${loggedInUser.full_name}`, 'success');
      onSuccess?.();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  return {
    control,
    errors,
    onSubmit,
    isSubmitting,
    rememberMe,
    toggleRememberMe: () => setRememberMe((prev) => !prev),
  };
}
