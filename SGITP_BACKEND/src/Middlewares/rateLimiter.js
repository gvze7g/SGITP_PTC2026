import rateLimit from "express-rate-limit";

const TOO_MANY_REQUESTS = "Demasiadas solicitudes. Espera unos minutos e intenta de nuevo.";

// Límite general por visitante (IP real: ver "trust proxy" en app.js). Una
// página de la tienda hace varias peticiones a la vez, así que el tope es
// holgado para la navegación normal y solo frena abusos (bots, bucles).
const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  // Las consultas previas del navegador (CORS) no cuentan.
  skip: (req) => req.method === "OPTIONS",
  message: { message: TOO_MANY_REQUESTS },
});

// Límite estricto para login, registro, Google y recuperar contraseña:
// evita que adivinen contraseñas o códigos probando miles de veces. Solo
// cuentan los intentos fallidos.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: (req) => req.method === "OPTIONS",
  message: {
    message: "Demasiados intentos. Espera 15 minutos antes de volver a intentarlo.",
  },
});

export default limiter;
