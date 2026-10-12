# Recall Frontend — reglas del proyecto

Respóndeme siempre en español. El código, los nombres y los comentarios van en inglés.

## Qué es

Frontend en Vue 3 + Vite de Recall, un coach personal de League of Legends. Muestra las estadísticas de mis partidas (cuentas LAN y LAS) que calcula la API de Laravel en `/home/fedrian/AiMe/recall-api`. No toques el backend desde aquí: si una pantalla necesita un endpoint que no existe, descríbeme qué debería devolver y lo hacemos allá.

## Stack

- Vue 3 con Composition API y `<script setup>`, en **JavaScript** (no TypeScript): estoy aprendiendo JS.
- Si una Skill o guía de buenas prácticas usa TypeScript (`lang="ts"`, tipos), aplica la misma práctica en JavaScript. Mis reglas del proyecto ganan sobre la Skill.
- Vite, Vue Router y Tailwind CSS.
- Node y npm corren directo en WSL, en `/home/fedrian/AiMe/recall` (no en Docker).
- Desarrollo: `npm run dev` → `http://localhost:5173`.

## Conexión con la API

- Las variables `VITE_*` se leen solo en `src/config/env.js` (validadas al arrancar): el resto del código importa `apiUrl` y `useMocks` de ahí. La URL de la API (`http://recall-api.aime.test` en local) es solo el origen. Nunca la escribas a mano en el código.
- Todos los endpoints viven bajo `/api/v1` y responden JSON con la forma `{ "data": ... }` (Eloquent API Resources).
- Toda llamada HTTP pasa por `src/api/recall.js`, con una función por endpoint (`getSummary()`, `getMatches()`...). Los componentes nunca usan `fetch` directo.
- Mientras un endpoint no exista en el backend, usa datos de ejemplo en `src/api/mocks/` con exactamente la forma del contrato, activados con `VITE_USE_MOCKS=true` (solo en desarrollo: una compilación de producción con mocks se rechaza).
- Imágenes de campeones desde Data Dragon (`https://ddragon.leagueoflegends.com`), sin clave. Obtén la versión actual de `https://ddragon.leagueoflegends.com/api/versions.json`.
- El contrato completo de la API está en docs/openapi.json. Úsalo como fuente de verdad para las formas de las respuestas; no inventes campos.

## Convenciones

- Vistas en `src/views/`, componentes en `src/components/`, lógica reutilizable en composables `src/composables/useX.js`.
- Componentes chicos y con una sola responsabilidad.
- Cada vista que pide datos resuelve los estados de carga, vacío y error.
- Nunca leas ni modifiques `.env`. Si hace falta una variable nueva, agrégala a `.env.example` y avísame.

## Cómo trabajar conmigo

- Estoy aprendiendo y reviso todo lo que haces. Prioriza código claro sobre código ingenioso, y explica en una o dos frases cualquier concepto de JavaScript o Vue que no sea obvio.
- Antes de cualquier cambio no trivial, propón un plan corto y espera mi OK.
- Una tarea por vez, en cambios chicos y fáciles de revisar.
- Trabaja directamente en `main`. Nunca hagas push.
- No hagas commit: al terminar, propón el mensaje de commit en español y yo commiteo.
- Antes de dar algo por terminado, corre `npm run build` y el lint, y confirma que pasan.
- Al terminar, resume: qué cambiaste y por qué, archivos tocados y cómo probarlo en el navegador.
