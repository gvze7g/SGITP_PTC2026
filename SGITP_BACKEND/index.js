import app from "./app.js";
import "./database.js";
import { config } from "./src/config.js";

async function main() {
  const port = config.server.port || 4000;
  const server = app.listen(port, "0.0.0.0", () => {
    console.log("server on port " + port);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error("Port " + port + " is already in use");
      process.exit(1);
    }

    console.error("Server error", error);
    process.exit(1);
  });
}

main();
