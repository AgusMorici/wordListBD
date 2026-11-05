import express from "express";
import {
    getPalabras,
    getPalabra,
    createPalabra,
    updatePalabra,
    deletePalabra,
} from "../controllers/palabraController.js";

const palabraRoutes = express.Router();

// GET /api/palabras
// GET /api/palabras?category=Frutas
palabraRoutes.get("/", getPalabras);

// GET /api/palabras/:id
palabraRoutes.get("/:id", getPalabra);

// POST /api/palabras
palabraRoutes.post("/", createPalabra);

// PUT /api/palabras/:id
palabraRoutes.put("/:id", updatePalabra);

// DELETE /api/palabras/:id
palabraRoutes.delete("/:id", deletePalabra);

export default palabraRoutes;