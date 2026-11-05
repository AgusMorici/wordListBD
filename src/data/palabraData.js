import { ObjectId } from "mongodb";
import { getDb } from "./connection.js";

function getCollection() {
    return getDb().collection("palabras");
}

// Convierte el documento de Mongo ({ _id, ... }) al formato que usa la app ({ id, ... })
function mapPalabra(doc) {
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { id: _id.toString(), ...rest };
}

// Devuelve null si el id no es un ObjectId válido (24 caracteres hex)
function toObjectId(id) {
    return ObjectId.isValid(id) && String(id).length === 24 ? new ObjectId(id) : null;
}

export async function getAllPalabras({ category } = {}) {
    const filter = {};
    if (category) filter.category = String(category);
    
    // collation strength 2: compara sin distinguir mayúsculas/minúsculas
    const palabras = await getCollection()
        .find(filter, { collation: { locale: "es", strength: 2 } })
        .toArray();
    return palabras.map(mapPalabra); // <-- CORREGIDO: ahora usa mapPalabra
}

export async function getPalabraById(id) {
    const _id = toObjectId(id);
    if (!_id) return null;
    const palabra = await getCollection().findOne({ _id });
    return mapPalabra(palabra);
}

export async function createPalabra(palabraData) {
    const doc = { ...palabraData };
    const { insertedId } = await getCollection().insertOne(doc);
    return { id: insertedId.toString(), ...palabraData };
}

export async function updatePalabra(id, palabraData) {
    const _id = toObjectId(id);
    if (!_id) return null;
    const updated = await getCollection().findOneAndReplace({ _id }, palabraData, { returnDocument: "after" });
    return mapPalabra(updated);
}

export async function deletePalabra(id) {
    const _id = toObjectId(id);
    if (!_id) return false;
    const { deletedCount } = await getCollection().deleteOne({ _id });
    return deletedCount === 1;
}