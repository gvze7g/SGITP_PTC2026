import mongoose from "mongoose";
import app from "./app.js";
import "./database.js";
import { config } from "./src/config.js";

// Un error que se escapó de algún try/catch no debe tumbar el servidor sin
// dejar rastro: se registra. Si es una excepción no capturada, el proceso
// queda en un estado incierto, así que se cierra y Render lo reinicia limpio.
process.on("unhandledRejection", (reason) => {
  console.error("Promesa rechazada sin manejar:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Excepción no capturada:", error);
  process.exit(1);
});

async function main() {
  const port = config.server.port || 4000;
  const server = app.listen(port, "0.0.0.0", () => {
    console.log("server on port " + port);
  });

  // El balanceador de Render mantiene conexiones abiertas hasta 60 s: el
  // servidor debe esperar un poco más para no cortarlas a medias.
  server.keepAliveTimeout = 65 * 1000;
  server.headersTimeout = 66 * 1000;
  server.requestTimeout = 60 * 1000;

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error("Port " + port + " is already in use");
      process.exit(1);
    }

    console.error("Server error", error);
    process.exit(1);
  });

  // Apagado ordenado (despliegues y reinicios): termina las peticiones en
  // curso y cierra la conexión a la base antes de salir.
  const shutdown = (signal) => {
    console.log(`${signal} recibido, cerrando servidor...`);
    server.close(async () => {
      await mongoose.connection.close().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10 * 1000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main();
