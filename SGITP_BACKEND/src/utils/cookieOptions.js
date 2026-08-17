const isProduction = process.env.NODE_ENV === "production";

// En producción (API en Render, frontend en otro dominio) el navegador
// exige SameSite=None + Secure para aceptar una cookie entre sitios
// distintos; en desarrollo local alcanza con Lax y sin Secure (http).
// Un solo lugar para no repetir esta lógica en cada controlador que
// hace login/logout/registro/recuperación.
export function getAuthCookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge,
  };
}

// Para clearCookie: los atributos deben coincidir con los que se usaron
// al crear la cookie, si no el navegador no la borra.
export function getClearCookieOptions() {
  return {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  };
}
