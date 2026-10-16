<p align="center">
  <img src="public/favicon.svg" alt="Logo de Recall" width="96" />
</p>

<h1 align="center">Recall</h1>

<p align="center">
  Tu coach personal de <strong>League of Legends</strong>: el frontend que convierte tus partidas en estadísticas claras.
</p>

<p align="center">
  <a href="https://github.com/fedrianMF/recall/actions/workflows/ci.yml"><img src="https://github.com/fedrianMF/recall/actions/workflows/ci.yml/badge.svg" alt="Estado del CI" /></a>
  <img src="https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/JavaScript-sin_TypeScript-f7df1e?logo=javascript&logoColor=black" alt="JavaScript" />
</p>

---

## Qué es

Recall muestra el rendimiento de tus partidas en las cuentas **LAN** y **LAS**: winrate, rango, métricas por partida, campeones y el detalle de cada juego. Las estadísticas las calcula una API de Laravel conectada a Riot, que vive en un repositorio aparte; este repositorio contiene **solo el frontend**.

El proyecto se desarrolla con ayuda de agentes de IA (Claude Code y Codex) bajo reglas explícitas y con una red de pruebas que verifica su trabajo. Más abajo, en [Desarrollo asistido por IA](#desarrollo-asistido-por-ia), se explica cómo.

## Pantallas

| Ruta           | Pantalla               | Qué muestra                                                       |
| -------------- | ---------------------- | ----------------------------------------------------------------- |
| `/`            | **Resumen**            | Winrate con anillo, partidas, rango y las métricas de rendimiento |
| `/champions`   | **Campeones**          | Tabla ordenable con el rendimiento agrupado por campeón           |
| `/matches`     | **Historial**          | Lista paginada con filtro por cola                                |
| `/matches/:id` | **Detalle de partida** | Tus métricas y las tablas de ambos equipos                        |

Todas comparten un marco común (riel de navegación, selector de cuenta y área principal) con versión móvil. Cada pantalla que pide datos resuelve sus estados de **carga, vacío y error**.

## Stack

- **Vue 3** con Composition API y `<script setup>`, en JavaScript.
- **Vite** como herramienta de compilación y **Vue Router** en modo historial.
- **Tailwind CSS 4** con tokens de diseño propios y tipografías autoalojadas (Geist y Bricolage Grotesque).
- **Vitest** + **Vue Test Utils** + jsdom para las pruebas.
- **ESLint**, **Oxlint** y **Prettier** para la calidad del código.
- **GitHub Actions**, **Dependabot** y **CodeQL** para la integración continua y la seguridad.
- **Docker** (Nginx) para servir la compilación estática.

## Inicio rápido

Requisitos: **Node.js** `^22.22.2`, `^24.15` o `>=26` y **npm**.

```sh
git clone https://github.com/fedrianMF/recall.git
cd recall
npm ci

# Origen de la API (compartido por desarrollo y compilación)
printf 'VITE_API_URL=http://recall-api.aime.test\n' > .env

# Datos de ejemplo: no necesitas el backend para ver la aplicación
printf 'VITE_USE_MOCKS=true\n' > .env.development

npm run dev
```

La aplicación queda en <http://localhost:5173>. Con `VITE_USE_MOCKS=true` funciona sin backend: usa los datos de `src/api/mocks/`, que respetan exactamente la forma del contrato de la API.

## Configuración del entorno

| Variable         | Archivo            | Descripción                                                                                                  |
| ---------------- | ------------------ | ------------------------------------------------------------------------------------------------------------ |
| `VITE_API_URL`   | `.env`             | Origen de la API (`http://` o `https://`, **sin ruta, consulta ni fragmento**). Obligatoria salvo con mocks. |
| `VITE_USE_MOCKS` | `.env.development` | `true` activa datos de ejemplo. Solo se lee en `npm run dev`.                                                |

Las variables se leen **únicamente** en `src/config/env.js`, que las valida al arrancar: si la configuración es inválida, la aplicación muestra un error claro en lugar de una pantalla en blanco. Además, `vite build` ejecuta la misma validación **al compilar**, así que un build de producción con mocks o sin una URL válida se rechaza antes de generar nada. Las reglas viven en un solo módulo puro (`src/config/parseEnv.js`) que reutilizan ambos momentos.

`.env.example` documenta las dos variables. Los archivos `.env*` reales nunca se versionan.

## Scripts

| Comando                       | Para qué sirve                                              |
| ----------------------------- | ----------------------------------------------------------- |
| `npm run dev`                 | Servidor de desarrollo con recarga en caliente              |
| `npm run build`               | Compilación de producción (valida el entorno)               |
| `npm run preview`             | Sirve localmente la compilación                             |
| `npm run test` / `test:watch` | Pruebas una vez / en modo vigilancia                        |
| `npm run check`               | **Todo lo que corre el CI**: lint, formato, pruebas y build |
| `npm run lint`                | Lint **con** arreglos automáticos (uso local)               |
| `npm run lint:check`          | Lint **sin** modificar archivos (el que usa el CI)          |
| `npm run format`              | Formatea `src/` con Prettier                                |
| `npm run format:check`        | Comprueba el formato de `src/` y `tests/`                   |

## Arquitectura

```text
src/
├── views/          Una pantalla por ruta; componen componentes y estados
├── components/     Componentes pequeños, de una sola responsabilidad
│   ├── shell/      Marco de la aplicación: riel, panel de cuentas, navegación móvil
│   └── summary/    Piezas del Resumen: anillo de winrate, paneles, métricas, estados
├── composables/    Lógica reutilizable (useSummary, useMatches, useApiRequest…)
├── api/            recall.js (una función por endpoint) y mocks/
├── config/         Lectura y validación del entorno
├── utils/          Funciones puras: formato, geometría del anillo, textos accesibles
└── router/         Rutas y títulos de pestaña
```

El flujo de datos es siempre el mismo y cada capa se puede probar por separado:

```text
Vista ──▶ composable (useApiRequest) ──▶ api/recall.js ──▶ config/env.js
  │              │                            │
  │              └ carga, error y protección  └ fetch o mocks
  │                contra respuestas viejas
  └ decide qué estado mostrar: carga · vacío · error · datos
```

- **Los componentes nunca usan `fetch`**: toda llamada HTTP pasa por `src/api/recall.js`.
- **`useApiRequest`** gestiona carga, error y datos, y descarta respuestas obsoletas cuando se lanzan varias peticiones seguidas.
- Las imágenes de campeones salen de **Data Dragon** (sin clave), con la versión más reciente consultada una sola vez.

## Contrato de la API

El contrato completo está en [`docs/openapi.json`](docs/openapi.json) (OpenAPI 3.1, generado por el backend) y es la fuente de verdad de las formas de las respuestas. Una prueba de contrato valida los datos de ejemplo contra ese esquema con **Ajv**, de modo que si el backend cambia y el contrato se reexporta, la prueba avisa qué mock quedó desactualizado.

## Pruebas

Más de **440 pruebas** en 35 archivos, organizadas como el código fuente:

| Carpeta              | Qué cubre                                                              |
| -------------------- | ---------------------------------------------------------------------- |
| `tests/utils/`       | Funciones puras, incluida la matemática del anillo de winrate          |
| `tests/composables/` | Carga, errores, reactividad y coordinación de `watch`                  |
| `tests/components/`  | Componentes por su comportamiento visible (texto, roles ARIA, eventos) |
| `tests/views/`       | Cada vista con sus cuatro estados, la paginación, el orden y el foco   |
| `tests/api/`         | La capa de red (URLs, cabeceras, errores) y el contrato OpenAPI        |
| `tests/config/`      | Validación del entorno al arrancar y al compilar                       |

Principios: se prueba el **comportamiento observable**, no los detalles internos; nunca hay red real; y una prueba que no puede fallar no cuenta. Para comprobarlo, las pruebas críticas se verifican con **mutaciones**: se rompe el código a propósito y se confirma que alguna prueba falla.

## Calidad y CI

Cada push a `main` y cada Pull Request ejecuta en GitHub Actions, con los pasos separados para ver de inmediato cuál falla:

1. **Lint** (`oxlint` y `eslint`, sin `--fix`)
2. **Formato** (`prettier --check`)
3. **Pruebas** (`vitest`)
4. **Build** con las variables de producción

Un segundo trabajo audita las dependencias de producción (`npm audit`). Además:

- **Dependabot** revisa cada lunes las dependencias de npm y las acciones de GitHub, agrupando las actualizaciones menores en un solo PR.
- **CodeQL** analiza el código y los workflows; **secret scanning** con _push protection_ bloquea que se suban credenciales.
- La rama `main` está protegida: exige un Pull Request y que el check `quality` pase.

Para reproducir en local lo mismo que el CI: `npm run check`.

## Docker

La imagen compila los estáticos con Vite y los sirve con Nginx (con _fallback_ a `index.html` para el router, caché inmutable para `/assets/` y cabeceras de seguridad). Como `VITE_*` se incrusta durante la compilación, la URL se pasa como argumento de build, y **si falta, el build falla**:

```sh
docker build --build-arg VITE_API_URL=https://api.ejemplo.com -t recall-frontend .
docker run --rm -p 8080:80 recall-frontend
```

## Diseño y accesibilidad

- El diseño está especificado en [`docs/recall-diseno/`](docs/recall-diseno/README.md): tokens de color, tipografía, radios, sombras, maquetas de escritorio (1440) y móvil (390) y estados de navegación.
- Solo hay tema claro, con colores y espaciados definidos como tokens de Tailwind en `src/assets/main.css`.
- Accesibilidad como requisito, no como extra: HTML semántico, victoria y derrota con **icono o palabra además del color**, áreas táctiles de 44 px, anillo de foco visible, enlace para saltar al contenido, jerarquía de encabezados continua, gestión del foco al paginar o reintentar y respeto de `prefers-reduced-motion`.

## Desarrollo asistido por IA

Este proyecto está construido con agentes de IA, y las reglas que los gobiernan forman parte del repositorio:

- [`AGENTS.md`](AGENTS.md) (enlazado también como `CLAUDE.md`) contiene las reglas del proyecto: stack, convenciones, límites y flujo de trabajo. Las leen tanto **Claude Code** como **Codex**.
- Tres agentes especializados (**constructor**, **probador** y **revisor**) existen en versión Claude (`.claude/agents/`) y Codex (`.codex/agents/`), y comparten los mismos criterios, que viven en [`docs/ai/`](docs/ai/).
- Se usan _skills_ de buenas prácticas de Vue, Vue Router, pruebas y diseño web, instaladas con un `skills-lock.json` reproducible.
- Ningún agente confirma su propio trabajo: cada resultado se verifica contra el código real, con la suite de pruebas y con mutaciones.

## Contribuir

1. Crea una rama desde `main`: `git switch -c tipo/nombre-corto` (por ejemplo `fix/foco-al-paginar`).
2. Haz cambios pequeños y enfocados, con pruebas cuando haya lógica o comportamiento nuevo.
3. Ejecuta `npm run check` y confirma que todo pasa.
4. Abre un Pull Request: el CI debe estar en verde para poder mezclarlo.

Los mensajes de commit y las descripciones de PR se escriben en español. El código, los nombres y los comentarios, en inglés.

## Licencia

Este repositorio es público para consulta y aún no tiene una licencia: **todos los derechos están reservados** salvo que se indique lo contrario.
