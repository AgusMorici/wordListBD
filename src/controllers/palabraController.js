import {
    listPalabras,
    findPalabraById,
    addPalabra,
    replacePalabra,
    removePalabra,
} from "../services/palabraService.js";

function handleServiceError(error, res, next) {
    if (error.statusCode) {
        return res.status(error.statusCode).json({ error: error.message });
    }
    next(error);
}

export async function getPalabras(req, res, next) {
    try {
        const { category } = req.query;
        const palabras = await listPalabras({ category });
        res.status(200).json({ data: palabras });
    } catch (error) {
        handleServiceError(error, res, next);
    }
}

export async function getPalabra(req, res, next) {
    try {
        const { id } = req.params;
        const palabra = await findPalabraById(id);
        res.status(200).json({ data: palabra });
    } catch (error) {
        handleServiceError(error, res, next);
    }
}

export async function createPalabra(req, res, next) {
    try {
        const palabra = await addPalabra(req.body);
        res.status(201).json({ message: "Palabra creada", data: palabra });
    } catch (error) {
        handleServiceError(error, res, next);
    }
}

export async function updatePalabra(req, res, next) {
    try {
        const { id } = req.params;
        const palabra = await replacePalabra(id, req.body);
        res.status(200).json({ message: "Palabra actualizada", data: palabra });
    } catch (error) {
        handleServiceError(error, res, next);
    }
}

export async function deletePalabra(req, res, next) {
    try {
        const { id } = req.params;
        await removePalabra(id);
        res.status(204).send();
    } catch (error) {
        handleServiceError(error, res, next);
    }
}