import app from "./app.js";
import "./database.js";
import { config } from "./src/config.js";

async function main() {
  app.listen(config.server.port);
  console.log("server on port " + config.server.port);
}

main();