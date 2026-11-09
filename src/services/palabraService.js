import OpenAI from "openai";
import {
    getAllPalabras,
    getPalabraById,
    createPalabra,
    updatePalabra,
    deletePalabra,
} from "../data/palabraData.js";

// --- CONFIGURACIÓN DE GROQ / OPENAI ---
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export const CATEGORIAS = [
    "Business & Work",
    "Travel & Tourism",
    "Academic & Study",
    "General",
];

const SYSTEM_PROMPT = `Eres un asistente experto en enseñanza de inglés y lexicografía bilingüe con español rioplatense (Argentina).
El usuario te enviará una palabra o frase en inglés o en español. Tu tarea es generar sus datos complementarios para un diccionario bilingüe.

Reglas:
1. "word": La palabra o frase SIEMPRE EN INGLÉS. Si el usuario te la envió en español, traducila al inglés; si te la envió en inglés, dejala tal cual.
2. "translation": Traducí la palabra o frase al español rioplatense natural (Argentina). Interpretá modismos y expresiones según su uso local (el sentido, no palabra por palabra). Si el usuario ingresó originalmente la palabra en español, este campo debe contener su traducción al español asegurando que "word" sea el término en inglés y "translation" el término en español.
3. "category": Seleccioná exactamente una de estas categorías: ${CATEGORIAS.map((c) => `${c}`).join(", ")}. Si no encaja claramente en ninguna, usá "General".
4. "definition": Escribí una definición u oración de ejemplo clara en inglés que explique o use la palabra.

Respondé SIEMPRE y ÚNICAMENTE con un JSON válido con esta estructura estricta:
{
  "word": "string con la palabra final en inglés",
  "translation": "string con la traducción al español rioplatense",
  "category": "string con la categoría seleccionada",
  "definition": "string con la definición u oración de ejemplo"
}
No incluyas texto fuera del JSON.`;

function createHttpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function validatePalabraData(data) {
    const { word, category, translation, definition } = data;

    if (!word || typeof word !== "string" || word.trim().length === 0) {
        throw createHttpError(400, "El campo 'word' es obligatorio y no puede estar vacío");
    }
    if (!category || typeof category !== "string" || category.trim().length === 0) {
        throw createHttpError(400, "El campo 'category' es obligatorio");
    }
    if (!translation || typeof translation !== "string" || translation.trim().length === 0) {
        throw createHttpError(400, "El campo 'translation' es obligatorio");
    }
    if (!definition || typeof definition !== "string" || definition.trim().length === 0) {
        throw createHttpError(400, "El campo 'definition' es obligatorio");
    }
}

// --- FUNCIONES CRUD TRADICIONALES ---

export async function listPalabras(filters = {}) {
    return await getAllPalabras(filters);
}

export async function findPalabraById(id) {
    const palabra = await getPalabraById(id);
    if (!palabra) {
        throw createHttpError(404, "Palabra no encontrada");
    }
    return palabra;
}

export async function addPalabra(data) {
    validatePalabraData(data);
    const { word, category, translation, definition } = data;
    return await createPalabra({
        word: word.trim(),
        category: category.trim(),
        translation: translation.trim(),
        definition: definition.trim()
    });
}

export async function replacePalabra(id, data) {
    validatePalabraData(data);
    const { word, category, translation, definition } = data;
    const updated = await updatePalabra(id, {
        word: word.trim(),
        category: category.trim(),
        translation: translation.trim(),
        definition: definition.trim()
    });
    if (!updated) {
        throw createHttpError(404, "Palabra no encontrada");
    }
    return updated;
}

export async function removePalabra(id) {
    const deleted = await deletePalabra(id);
    if (!deleted) {
        throw createHttpError(404, "Palabra no encontrada");
    }
}

// --- NUEVA FUNCIÓN: CREAR PALABRA USANDO IA ---

export async function addPalabraConIA(texto) {
    if (!texto || typeof texto !== "string" || !texto.trim()) {
        throw createHttpError(400, "Debés indicar la palabra o frase para autocompletar");
    }

    try {
        const response = await openai.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: texto.trim() },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
        });

        const parsed = JSON.parse(response.choices[0].message.content);

        // Preparamos el objeto con los datos generados por la IA
        const datosGenerados = {
            word: parsed.word ? parsed.word.trim() : "",
            category: parsed.category ? parsed.category.trim() : "",
            translation: parsed.translation ? parsed.translation.trim() : "",
            definition: parsed.definition ? parsed.definition.trim() : ""
        };

        // Validamos que los datos cumplan con las reglas de tu esquema
        validatePalabraData(datosGenerados);

        // Guardamos directamente en la base de datos
        const nuevaPalabra = await createPalabra(datosGenerados);
        return nuevaPalabra;

    } catch (error) {
        if (error.statusCode) {
            throw error; // Mantiene el error HTTP que lanzamos nosotros
        }
        console.error("Error al procesar la palabra con IA:", error);
        throw createHttpError(500, "Error al generar los datos de la palabra con Inteligencia Artificial");
    }
}