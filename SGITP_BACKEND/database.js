import mongoose from "mongoose";
import dns from "node:dns";
import { config } from "./src/config.js";

if (config.db.dnsServers?.length) {
  dns.setServers(config.db.dnsServers);
}

mongoose.connect(config.db.URI);

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("DB is connected");
});

connection.on("disconnected", () => {
  console.log("DB is disconnected");
});

connection.on("error", (error) => {
  console.log("error found " + error);
});
