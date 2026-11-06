import { listUsers, getUserById, registerUserService, loginUserServices, registrarIntentoJuego } from "../services/userService.js";
import { getPalabrasDeUser, addPalabraToUser, removePalabraFromUser } from "../data/userData.js";
import jwt from "jsonwebtoken";

function handleServiceError(error, res, next) {
    if (error.statusCode) {
        return res.status(error.statusCode).json({ error: error.message });
    }
    next(error);
}

export async function getUsers(req, res, next) {
    try {
        const users = await listUsers();
        res.status(200).json({ data: users });
    } catch (error) {
        handleServiceError(error, res, next);
    }
}

export async function getUser(req, res, next) {
    try {
        const { id } = req.params;
        const user = await getUserById(id);
        res.status(200).json({ data: user });
    } catch (error) {
        handleServiceError(error, res, next);
    }
}

export async function registerUserController(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email y password son requeridos" });
    }

    try {
        const result = await registerUserService({ name, email, password });
        res.status(201).json({ message: "Usuario registrado exitosamente", userId: result.insertedId });
    } catch (error) {
        if (error.message === "El email ya esta registrado") {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: "Error interno al registrar un usuario" });
    }
}

export async function loginUserController(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email y password son requeridos" });
    }

    try {
        const user = await loginUserServices(email, password);

        // generar el token JWT
        const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // traer las palabras completas del usuario
        const palabras = await getPalabrasDeUser(user._id);

        res.json({
            message: "Login exitoso",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                palabras,
            },
        });
    } catch (error) {
        if (error.message == "Credenciales inválidas") {
            return res.status(401).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: "error desconocido al hacer login" });
    }
}

export const getMisPalabras = async (req, res, next) => {
    try {
        const palabras = await getPalabrasDeUser(req.user._id);
        res.status(200).json({ data: palabras });
    } catch (error) {
        handleServiceError(error, res, next);
    }
};

export const agregarPalabra = async (req, res, next) => {
    try {
        await addPalabraToUser(req.user._id, req.params.palabraId);
        res.status(201).json({ message: "Palabra agregada a tu lista" });
    } catch (error) {
        handleServiceError(error, res, next);
    }
};

export const quitarPalabra = async (req, res, next) => {
    try {
        await removePalabraFromUser(req.user._id, req.params.palabraId);
        res.status(200).json({ message: "Palabra quitada de tu lista" });
    } catch (error) {
        handleServiceError(error, res, next);
    }
};

export const registrarIntentoJuegoController = async (req, res, next) => {
    try {
        const { palabraId } = req.params;
        const { isCorrect } = req.body;

        await registrarIntentoJuego(req.user._id, palabraId, Boolean(isCorrect));

        res.status(200).json({ message: "Progreso de juego actualizado con éxito" });
    } catch (error) {
        handleServiceError(error, res, next);
    }
};