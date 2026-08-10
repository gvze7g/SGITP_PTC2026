import { request } from './apiClient';

// Todas las llamadas al backend relacionadas con la cuenta del usuario.
export const authService = {
  // Inicia sesión con correo y contraseña.
  loginCustomer(email, password) {
    return request('/loginCustomer', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Crea una cuenta nueva (el backend manda un código de verificación por correo).
  registerCustomer({ fullName, email, password }) {
    return request('/registerCustomer', {
      method: 'POST',
      body: JSON.stringify({ full_name: fullName, email, password }),
    });
  },

  // Pregunta al backend si la cookie guardada todavía es válida y trae los
  // datos del usuario logueado.
  fetchMe() {
    return request('/auth/me', { method: 'GET' });
  },

  // Cierra la sesión (borra la cookie en el servidor).
  logout() {
    return request('/logout', { method: 'POST' });
  },

  // Confirma el código que llegó al correo al registrarse.
  verifyRegistrationCode(code) {
    return request('/registerCustomer/verifyCodeEmail', {
      method: 'POST',
      body: JSON.stringify({ verificationCodeRequest: code }),
    });
  },

  // Pide que se envíe un código para recuperar la contraseña.
  requestRecoveryCode(email) {
    return request('/recoveryPassword/requestCode', {
      method: 'POST',
      body: JSON.stringify({ email, userType: 'Customer' }),
    });
  },

  // Confirma el código de recuperación de contraseña.
  verifyRecoveryCode(code) {
    return request('/recoveryPassword/verifyCode', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  // Guarda la nueva contraseña (solo funciona si ya se verificó el código).
  resetPassword(newPassword, confirmNewPassword) {
    return request('/recoveryPassword/newPassword', {
      method: 'POST',
      body: JSON.stringify({ newPassword, confirmNewPassword }),
    });
  },
};
