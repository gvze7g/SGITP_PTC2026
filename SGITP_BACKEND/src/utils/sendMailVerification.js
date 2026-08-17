const HTMLVerificationEmail = (code) => {
  return `
    <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f9; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2c3e50; font-size: 24px; margin-bottom: 20px;">Verificación de cuenta</h1>
      <p style="font-size: 16px; color: #555; line-height: 1.5;">
        Gracias por registrarte. Utiliza el siguiente código para verificar tu cuenta:
      </p>
      <div style="display: inline-block; padding: 10px 20px; margin: 20px 0; font-size: 18px; font-weight: bold; color: #fff; background-color: #ff7f50; border-radius: 5px; border: 1px solid #e67e22;">
        ${code}
      </div>
      <p style="font-size: 14px; color: #777; line-height: 1.5;">
        Este código vence en <strong>15 minutos</strong>. Si tú no solicitaste este correo, puedes ignorarlo con seguridad.
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <footer style="font-size: 12px; color: #aaa;">
        Si necesitas ayuda adicional, contacta a nuestro equipo de soporte.
      </footer>
    </div>
  `;
};

export default HTMLVerificationEmail;
