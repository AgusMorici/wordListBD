import express from "express";
import {
    getPalabras,
    getPalabra,
    createPalabra,
    updatePalabra,
    deletePalabra,
    crearPalabraConIAController,
} from "../controllers/palabraController.js";
import { authMiddleware } from "../middleware/auth.js";

const palabraRoutes = express.Router();

// GET /api/words
// GET /api/words?category=General
palabraRoutes.get("/", getPalabras);

// POST /api/words/ia
palabraRoutes.post("/ia", authMiddleware, crearPalabraConIAController);

// GET /api/words/:id
palabraRoutes.get("/:id", getPalabra);

// POST /api/words
palabraRoutes.post("/", createPalabra);


// PUT /api/words/:id
palabraRoutes.put("/:id", updatePalabra);

// DELETE /api/words/:id
palabraRoutes.delete("/:id", deletePalabra);

export default palabraRoutes;