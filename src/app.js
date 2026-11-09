import express from "express";
import morgan from "morgan";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import palabraRoutes from "./routes/palabraRoutes.js";

// CORS significa Cross-Origin Resource Sharing (Intercambio de Recursos de Origen Cruzado).

const app = express();

// Middleware
app.use(morgan("dev")); // Loguea todas las peticiones HTTP en la consola
app.use(cors());
app.use(express.json());


// Ruta base
app.get("/", (req, res) => {    
    res.send("API funcionando 🚀");
});

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/words", palabraRoutes);

// Manejo global de 404 (ruta no encontrada)
app.use((req, res) => {
    res.status(404).json({ error: "Recurso no encontrado" });
});

// Manejo global de errores inesperados
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
});

export default app;