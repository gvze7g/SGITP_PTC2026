import cors from "cors"

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    // permitir el envio de cookies y credenciales
    credentials: true
}))

app.use(cookieParser());

//Que acepte JSON desde postman
app.use(express.json());

export default app;