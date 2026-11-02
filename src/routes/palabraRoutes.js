import express from "express";
import {
    getPalabras,
    getPalabra,
    createPalabra,
    updatePalabra,
    deletePalabra,
} from "../controllers/palabraController.js";

const palabraRoutes = express.Router();

// GET /api/products
// GET /api/products?category=notebook
// GET /api/products?brand=Logitech
palabraRoutes.get("/", getPalabras);

// GET /api/products/:id
palabraRoutes.get("/:id", getPalabra);

// POST /api/products
palabraRoutes.post("/", createPalabra);

// PUT /api/products/:id
palabraRoutes.put("/:id", updatePalabra);

// DELETE /api/products/:id
palabraRoutes.delete("/:id", deletePalabra);

export default palabraRoutes;
