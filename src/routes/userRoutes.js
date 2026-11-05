import express from "express";
import { getUsers, getUser, registerUserController, loginUserController, getMisPalabras, agregarPalabra, quitarPalabra, registrarIntentoJuegoController } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/auth.js";

const userRoutes = express.Router();

// GET /api/users
userRoutes.get("/",authMiddleware,  getUsers);

// GET /api/users/:id
userRoutes.get("/:id", getUser);
userRoutes.post("/register", registerUserController);
userRoutes.post("/login", loginUserController);

// GET /api/users/pablabras
userRoutes.get("/me/palabras", authMiddleware, getMisPalabras);
userRoutes.post("/me/palabras/:palabraId", authMiddleware, agregarPalabra);
userRoutes.delete("/me/palabras/:palabraId", authMiddleware, quitarPalabra);

userRoutes.post('/me/palabras/:palabraId/game-attempt', authMiddleware, registrarIntentoJuegoController);
export default userRoutes;
