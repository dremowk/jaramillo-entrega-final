# 🐾 Generador de Historias con Imágenes (Gatitos y Perritos)

Este proyecto genera **historias cortas y tiernas** sobre gatitos o perritos en **español**, y luego crea una **imagen ilustrativa con IA** basada en esa historia.

Para coordinar correctamente las APIs, se usa **Gemini (Google)** para generar el texto en español y traducirlo al inglés, y después se utiliza **Stable Diffusion XL (Stability AI)** para generar la imagen.

---

## 🚀 Tecnologías utilizadas

- **HTML5 + CSS3 + JavaScript (Frontend puro)**
- **[Google Generative AI (Gemini)](https://ai.google.dev/)**

  - Se usa el modelo `gemini-1.5-flash` para:
    - Generar la historia en español.
    - Traducir la historia al inglés antes de enviar el prompt a Stable Diffusion.

- **[Stability AI API](https://platform.stability.ai/)**
  - Se usa el modelo `stable-diffusion-xl-1024-v1-0` para generar imágenes a partir de texto.
  - Este modelo **solo soporta prompts en inglés**, por eso es necesaria la traducción previa.

---

## ⚙️ Configuración del proyecto

1. Clona o descarga este repositorio.
2. Abre el archivo `index.html` en un navegador.
3. Crea tus claves de API en:
   - **Gemini API Key**: [Google AI Studio](https://ai.google.dev/tutorials/setup)
   - **Stability API Key**: [Stability Platform](https://platform.stability.ai/account/api-keys)
