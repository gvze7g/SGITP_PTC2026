import app from "./app.js"
import "./database.js"
import { config } from "./config.js";

//Creamos la función 
//Que se encarga de ejecutar el servidor
async function main() {
    app.listen(config.server.port)
    console.log("server on port"+ config.server.port)
}

main();