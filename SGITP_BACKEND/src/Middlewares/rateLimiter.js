import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, //Intervalo de tiempo
  max: 100,
  message: {
    status: 429,
    // "message" es lo que muestran la web, la app y el panel.
    message: "Demasiadas solicitudes. Espera unos minutos e intenta de nuevo.",
  },
});

export default limiter;