import mongoose from "mongoose";
import dns from "node:dns";
import { config } from "./src/config.js";

if (config.db.dnsServers?.length) {
  dns.setServers(config.db.dnsServers);
}

const RETRY_DELAY_MS = 5000;

// Antes, si la primera conexión fallaba (red caída al arrancar), el servidor
// quedaba vivo pero sin base de datos para siempre. Ahora reintenta cada 5 s.
async function connectWithRetry() {
  try {
    await mongoose.connect(config.db.URI, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
  } catch (error) {
    console.error(`DB connection failed: ${error.message}. Reintentando en ${RETRY_DELAY_MS / 1000}s`);
    setTimeout(connectWithRetry, RETRY_DELAY_MS);
  }
}

connectWithRetry();

const connection = mongoose.connection;

connection.on("connected", () => {
  console.log("DB is connected");
});

connection.on("disconnected", () => {
  console.log("DB is disconnected");
});

connection.on("error", (error) => {
  console.log("error found " + error);
});
