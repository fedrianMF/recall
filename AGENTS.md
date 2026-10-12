# Recall Frontend — reglas del proyecto

Respóndeme siempre en español. El código, los nombres y los comentarios van en inglés.

## Qué es

Frontend en Vue 3 + Vite de Recall, un coach personal de League of Legends. Muestra las estadísticas de mis partidas (cuentas LAN y LAS) que calcula la API de Laravel, que vive en otro repositorio (`recall-api`, junto a este). No toques el backend desde aquí: si una pantalla necesita un endpoint que no existe, descríbeme qué debería devolver y lo hacemos allá.

Este repositorio es **público**. Nunca incluyas credenciales, tokens, claves, URLs privadas, datos personales ni Riot IDs reales (tampoco en mocks, pruebas o documentos).

## Stack

- Vue 3 con Composition API y `<script setup>`, en **JavaScript** (no TypeScript): estoy aprendiendo JS.
- Si una Skill o guía de buenas prácticas usa TypeScript (`lang="ts"`, tipos), aplica la misma práctica en JavaScript. Mis reglas del proyecto ganan sobre la Skill.
- Vite, Vue Router y Tailwind CSS 4. Pruebas con Vitest y Vue Test Utils.
- Node y npm corren directo en WSL (no en Docker).
- Desarrollo: `npm run dev` → `http://localhost:5173`.
- No agregues dependencias sin proponérmelo antes.

## Conexión con la API

- Las variables `VITE_*` se leen solo en `src/config/env.js` (validadas al arrancar): el resto del código importa `apiUrl` y `useMocks` de ahí. La URL de la API (`http://recall-api.aime.test` en local) es solo el origen. Nunca la escribas a mano en el código.
- Todos los endpoints viven bajo `/api/v1` y responden JSON con la forma `{ "data": ... }` (Eloquent API Resources).
- Toda llamada HTTP pasa por `src/api/recall.js`, con una función por endpoint (`getSummary()`, `getMatches()`...). Los componentes nunca usan `fetch` directo.
- Mientras un endpoint no exista en el backend, usa datos de ejemplo en `src/api/mocks/` con exactamente la forma del contrato, activados con `VITE_USE_MOCKS=true` en `.env.development` (solo en desarrollo: una compilación de producción con mocks se rechaza).
- Imágenes de campeones desde Data Dragon (`https://ddragon.leagueoflegends.com`), sin clave. Obtén la versión actual de `https://ddragon.leagueoflegends.com/api/versions.json`.
- El contrato completo de la API está en docs/openapi.json. Úsalo como fuente de verdad para las formas de las respuestas; no inventes campos.

## Convenciones

- Vistas en `src/views/`, componentes en `src/components/`, lógica reutilizable en composables `src/composables/useX.js`, funciones puras en `src/utils/`.
- Componentes chicos y con una sola responsabilidad.
- Cada vista que pide datos resuelve los estados de carga, vacío y error.
- Nunca leas ni modifiques `.env`. Si hace falta una variable nueva, agrégala a `.env.example` y avísame.

### Estilos y accesibilidad

- Los colores, radios y sombras salen de los tokens de `src/assets/main.css` (`bg-surface`, `text-ink`, `rounded-control`...). Nada de colores hex ni de la paleta por defecto de Tailwind. Solo hay tema claro. El diseño de referencia está en `docs/recall-diseno/`.
- Usa elementos semánticos reales (`<button>`, `<nav>`, `<dl>`, `<table>`). Victoria y derrota llevan palabra o icono además del color. Áreas táctiles de al menos 44 px.
- Nunca uses `focus:outline-none`: el anillo de foco global (`:focus-visible`) debe verse.
- Una sola `<h1>` por pantalla y encabezados sin saltos de nivel (`h1` → `h2`).
- Si una acción desmonta el elemento enfocado (paginar, reintentar), mueve antes el foco a un destino estable con `tabindex="-1"`.
- Las animaciones llevan `motion-reduce:animate-none`.

### Pruebas

- Las pruebas viven en `tests/`, con la misma estructura que `src/`, y importan con el alias `@`.
- Todo cambio con lógica o comportamiento nuevo lleva pruebas. Un cambio solo visual no debe romper las existentes: si lo hace, explícame por qué antes de tocarlas.
- Prueba el comportamiento visible (texto, roles ARIA, eventos, llamadas a la API), no clases CSS ni detalles internos. Nunca uses red real.
- Una prueba que no puede fallar no sirve: comprueba que falla al romper el código a propósito.

### Agentes y skills

- Existen los agentes `vue-builder`, `vue-tester` y `vue-reviewer` (en `.claude/agents/` y `.codex/agents/`). Sus criterios viven en `docs/ai/`.
- Las skills instaladas en `.agents/skills/` son de terceros: no las edites.

## Git y GitHub

- `main` está protegida: solo recibe cambios mediante un Pull Request cuyo check `quality` esté en verde. Nunca cambies `main` directamente.
- Los cambios se hacen en una rama `tipo/nombre-corto` (`feat/`, `fix/`, `docs/`, `chore/`). Si hace falta crearla, dame el comando y yo la creo.
- Nunca hagas commit ni push: propón el mensaje de commit en español y yo commiteo y abro el PR.
- Las acciones en GitHub (mezclar PRs, cambiar ajustes, permisos o secretos) solo las haces cuando te lo pida de forma explícita.
- Dependabot abre PRs cada lunes: se mezclan con el CI en verde.

## Cómo trabajar conmigo

- Estoy aprendiendo y reviso todo lo que haces. Prioriza código claro sobre código ingenioso, y explica en una o dos frases cualquier concepto de JavaScript o Vue que no sea obvio.
- Antes de cualquier cambio no trivial, propón un plan corto y espera mi OK.
- Una tarea por vez, en cambios chicos y fáciles de revisar.
- Antes de dar algo por terminado, corre `npm run check` (lint, formato, pruebas y build) y confirma que pasa. `npm run lint` y `npm run format` arreglan archivos; `lint:check` y `format:check` solo comprueban.
- Al terminar, resume: qué cambiaste y por qué, archivos tocados y cómo probarlo en el navegador.
