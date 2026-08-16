import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Reglas de validación del formulario de registro. Zod revisa esto antes
// de dejar enviar el formulario y react-hook-form muestra el error debajo
// de cada campo automáticamente.
const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'El nombre es requerido')
      .max(50, 'Máximo 50 caracteres')
      .regex(NAME_PATTERN, 'Solo se permiten letras'),
    lastName: z
      .string()
      .min(1, 'El apellido es requerido')
      .max(50, 'Máximo 50 caracteres')
      .regex(NAME_PATTERN, 'Solo se permiten letras'),
    email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// Toda la lógica de la pantalla de Registro: valida los campos, llama al
// backend para crear la cuenta y avisa con un toast si funcionó o no.
export function useRegisterForm(onSuccess) {
  const { register, isSubmitting } = useAuth();
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ firstName, lastName, email, password }) => {
    try {
      await register({
        fullName: `${firstName} ${lastName}`.trim(),
        email,
        password,
      });
      // Usamos siempre nuestro propio texto en español (el backend a veces
      // responde en inglés y no queremos mezclar idiomas en la app).
      showToast('Cuenta creada, revisa tu correo para verificarla', 'success');
      onSuccess?.(email);
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  return { control, errors, onSubmit, isSubmitting };
}
