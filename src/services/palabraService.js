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
1. "name": La palabra o frase SIEMPRE EN INGLÉS. Si el usuario te la envió en español, traducila al inglés; si te la envió en inglés, dejala tal cual.
2. "traduccion": Traducí la palabra o frase al español rioplatense natural (Argentina). Interpretá modismos y expresiones según su uso local (el sentido, no palabra por palabra). Si el usuario ingresó originalmente la palabra en español, este campo debe contener su traducción al inglés o viceversa, asegurando que "name" sea el término en inglés y "traduccion" el término en español.
3. "category": Seleccioná exactamente una de estas categorías: ${CATEGORIAS.map((c) => `${c}`).join(", ")}. Si no encaja claramente en ninguna, usá "General".
4. "ejemplo": Escribí una oración de ejemplo clara en inglés que use la palabra.

Respondé SIEMPRE y ÚNICAMENTE con un JSON válido con esta estructura estricta:
{
  "name": "string con la palabra final en inglés",
  "traduccion": "string con la traducción al español rioplatense",
  "category": "string con la categoría seleccionada",
  "ejemplo": "string con la oración de ejemplo"
}
No incluyas texto fuera del JSON.`;

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
            name: parsed.name ? parsed.name.trim() : "",
            category: parsed.category ? parsed.category.trim() : "",
            traduccion: parsed.traduccion ? parsed.traduccion.trim() : "",
            ejemplo: parsed.ejemplo ? parsed.ejemplo.trim() : ""
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