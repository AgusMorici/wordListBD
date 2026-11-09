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

// GET /api/users/me/words
userRoutes.get("/me/words", authMiddleware, getMisPalabras);
userRoutes.post("/me/words/:palabraId", authMiddleware, agregarPalabra);
userRoutes.delete("/me/words/:palabraId", authMiddleware, quitarPalabra);

userRoutes.post('/me/words/:palabraId/game-attempt', authMiddleware, registrarIntentoJuegoController);
export default userRoutes;
