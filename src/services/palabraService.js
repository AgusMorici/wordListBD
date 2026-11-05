import {
    getAllPalabras,
    getPalabraById,
    createPalabra,
    updatePalabra,
    deletePalabra,
} from "../data/palabraData.js";

function createHttpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function validatePalabraData(data) {
    const { name, category, traduccion, ejemplo } = data;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        throw createHttpError(400, "El campo 'name' (palabra) es obligatorio y no puede estar vacío");
    }
    if (!category || typeof category !== "string" || category.trim().length === 0) {
        throw createHttpError(400, "El campo 'category' es obligatorio");
    }
    if (!traduccion || typeof traduccion !== "string" || traduccion.trim().length === 0) {
        throw createHttpError(400, "El campo 'traduccion' es obligatorio");
    }
    if (!ejemplo || typeof ejemplo !== "string" || ejemplo.trim().length === 0) {
        throw createHttpError(400, "El campo 'ejemplo' es obligatorio");
    }
}

export async function listPalabras(filters = {}) {
    return await getAllPalabras(filters);
}

export async function findPalabraById(id) {
    const palabra = await getPalabraById(id);
    if (!palabra) {
        throw createHttpError(404, "Palabra no encontrado");
    }
    return palabra;
}

export async function addPalabra(data) {
    validatePalabraData(data);
    const { name, category, traduccion, ejemplo } = data;
    return await createPalabra({ 
        name: name.trim(), 
        category: category.trim(), 
        traduccion: traduccion.trim(),
        ejemplo: ejemplo.trim()
    });
}

export async function replacePalabra(id, data) {
    validatePalabraData(data);
    const { name, category, traduccion, ejemplo } = data;
    const updated = await updatePalabra(id, { 
        name: name.trim(), 
        category: category.trim(), 
        traduccion: traduccion.trim(),
        ejemplo: ejemplo.trim()
    });
    if (!updated) {
        throw createHttpError(404, "Palabra no encontrada");
    }
    return updated;
}

export async function removePalabra(id) {
    const deleted = await deletePalabra(id);
    if (!deleted) {
        throw createHttpError(404, "Palabra no encontrado");
    }
}
