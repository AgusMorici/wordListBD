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
    const { name, brand, category, price, stock } = data;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        throw createHttpError(400, "El campo 'name' es obligatorio y no puede estar vacío");
    }
    if (!brand || typeof brand !== "string" || brand.trim().length === 0) {
        throw createHttpError(400, "El campo 'brand' es obligatorio");
    }
    if (!category || typeof category !== "string" || category.trim().length === 0) {
        throw createHttpError(400, "El campo 'category' es obligatorio");
    }
    if (typeof price !== "number" || Number.isNaN(price) || price <= 0) {
        throw createHttpError(400, "El campo 'price' debe ser numérico y mayor a 0");
    }
    if (!Number.isInteger(stock) || stock < 0) {
        throw createHttpError(400, "El campo 'stock' debe ser un número entero mayor o igual a 0");
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
    const { name, brand, category, price, stock } = data;
    return await createPalabra({ name: name.trim(), brand: brand.trim(), category: category.trim(), price, stock });
}

export async function replacePalabra(id, data) {
    validatePalabraData(data);
    const { name, brand, category, price, stock } = data;
    const updated = await updatePalabra(id, { name: name.trim(), brand: brand.trim(), category: category.trim(), price, stock });
    if (!updated) {
        throw createHttpError(404, "Palabra no encontrado");
    }
    return updated;
}

export async function removePalabra(id) {
    const deleted = await deletePalabra(id);
    if (!deleted) {
        throw createHttpError(404, "Palabra no encontrado");
    }
}
