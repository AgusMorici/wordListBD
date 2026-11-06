import express from "express";
import { generarDatosPalabraController } from "../controllers/translateController.js";
import { authMiddleware } from "../middleware/auth.js";

const translateRouter = express.Router();

translateRouter.post("/", authMiddleware, generarDatosPalabraController);

export default translateRouter;