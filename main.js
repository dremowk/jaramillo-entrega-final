// ================================
// CONFIGURACIÓN
// ================================
const GEMINI_API_KEY = "AIzaSyDWDYoccaBLVY0dm91RX27JLk1ZsAe6Yho";
const STABILITY_API_KEY = "sk-OIdmpcfRsqnNinEE73H74Dq6wQdhuTofC5Qo26ihTHoZGUjz";

import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// --- ELEMENTOS DEL DOM ---
const generarHistoriaBtn = document.getElementById("generarHistoriaBtn");
const generarImagenBtn = document.getElementById("generarImagenBtn");
const estiloSelect = document.getElementById("estiloSelect");
const historiaSpan = document.getElementById("historia-span");
const imagenGenerada = document.getElementById("imagen-generada");
const loader = document.getElementById("loader");

let ultimaHistoria = "";

// --- FUNCION DE REINTENTO AUTOMATICO ---
async function retryOperation(operation, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(
        `Error: ${error.message}. Reintentando en ${delay / 1000}s...`
      );
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

// --- PROMPT PARA HISTORIAS ---
const promptHistoria = `
Responde ÚNICAMENTE en formato JSON.
No agregues texto extra, explicaciones ni comillas triples.
Estructura de respuesta:
{
  "historia": "Texto de la historia breve"
}

Genera una historia muy breve (máx 4 frases) sobre gatitos y perritos.
Debe ser tierna, coherente y fácil de leer para cualquier persona.
`;

// --- GENERAR HISTORIA ---
generarHistoriaBtn.addEventListener("click", async () => {
  try {
    generarHistoriaBtn.disabled = true;
    generarHistoriaBtn.textContent = "Generando...";
    loader.style.display = "block";

    const modeloTexto = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const resultadoTexto = await retryOperation(() =>
      modeloTexto.generateContent(promptHistoria)
    );
    const respuestaTexto = await resultadoTexto.response.text();

    console.log("Respuesta cruda de Gemini:", respuestaTexto);

    let jsonLimpio = respuestaTexto
      .trim()
      .replace(/```json/gi, "")
      .replace(/```/g, "");

    let datosHistoria;
    try {
      datosHistoria = JSON.parse(jsonLimpio);
    } catch (err) {
      throw new Error(
        "Error al parsear la respuesta de texto: " + respuestaTexto
      );
    }

    ultimaHistoria = datosHistoria.historia;
    historiaSpan.textContent = ultimaHistoria;

    generarImagenBtn.disabled = false;
    estiloSelect.disabled = false;

    console.log("Historia generada con éxito.");
  } catch (error) {
    console.error("Error al generar historia:", error);
    alert("Hubo un error al generar la historia. Revisa la consola.");
  } finally {
    generarHistoriaBtn.disabled = false;
    generarHistoriaBtn.textContent = "Generar historia";
    loader.style.display = "none";
  }
});

// --- FUNCION PARA TRADUCIR HISTORIA AL INGLES ---
async function traducirHistoriaAlIngles(texto) {
  const promptTraduccion = `
Traduce al inglés el siguiente texto. 
Responde solo con la traducción sin explicaciones ni formato adicional:

"${texto}"
`;

  const modeloTexto = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const resultado = await modeloTexto.generateContent(promptTraduccion);
  const traduccion = await resultado.response.text();

  return traduccion.trim();
}

// --- GENERAR IMAGEN CON STABLE DIFFUSION ---
generarImagenBtn.addEventListener("click", async () => {
  if (!ultimaHistoria) {
    alert("Primero genera una historia.");
    return;
  }

  try {
    generarImagenBtn.disabled = true;
    generarImagenBtn.textContent = "Generando imagen...";
    loader.style.display = "block";

    // 1. Traducir historia al inglés
    const traduccionIngles = await traducirHistoriaAlIngles(ultimaHistoria);
    console.log("Historia traducida al inglés:", traduccionIngles);

    // 2. Preparar prompt para la imagen
    const estilo = estiloSelect.value;
    const promptImagen = `Cute illustration in ${estilo} style of the following story: ${traduccionIngles}`;

    // 3. Llamada a Stability AI
    const response = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STABILITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text_prompts: [{ text: promptImagen }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error de Stability AI:", errorData);
      throw new Error(
        `Stable Diffusion Error: ${errorData.message || response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Respuesta de Stability AI:", data);

    if (!data.artifacts || !data.artifacts[0].base64) {
      throw new Error("No se recibió imagen de Stability AI");
    }

    // Convertir base64 a imagen
    imagenGenerada.src = `data:image/png;base64,${data.artifacts[0].base64}`;
    imagenGenerada.style.display = "block";

    console.log("Imagen generada con éxito.");
  } catch (error) {
    console.error("Error al generar imagen:", error);
    alert("Hubo un error al generar la imagen. Revisa la consola.");
  } finally {
    generarImagenBtn.disabled = false;
    generarImagenBtn.textContent = "Generar imagen";
    loader.style.display = "none";
  }
});
