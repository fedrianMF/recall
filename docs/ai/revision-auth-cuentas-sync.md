# Revisión de Claude: auth, cuentas y sync

Notas de supervisión mientras Codex implementa `docs/ai/plan-auth-cuentas-sync.md`.

## Ciclo 10:18 (Codex aún corriendo; los 5 pasos ya aparecen marcados)

Escaneo estático de solo lectura, sin hallazgos en el código nuevo:

- Sin colores hex, sin paleta por defecto de Tailwind ni `focus:outline-none` en vistas y componentes nuevos.
- Sin `lang="ts"` ni `fetch` fuera de `src/api/recall.js`.
- Sin cambios en `.env`, `package.json` ni `package-lock.json`.
- Sin credenciales ni correos reales en el código nuevo.

Hallazgo previo, no es de Codex:

- `src/api/mocks/match.js:35` contiene un Riot ID que parece real (`riot_id`). Incumple la regla de no incluir Riot IDs reales en un repo público. Conviene reemplazarlo por un valor ficticio (tarea aparte, la decide el usuario).

Pendiente: correr `npm run check` y revisar el código a fondo cuando Codex termine.

## Revisión a fondo (Claude, tras terminar Codex)

`npm run check` pasa (lint, formato, pruebas, build). Problemas encontrados en el código:

1. **`useSync` se instancia 3 veces** (`SyncButton` está montado en cabecera móvil, franja md y panel xl; `App.vue` también llama `useSync`). El `timer`, `startedAt` y `requestInFlight` son por instancia, pero `isRunning` es compartido: se triplican las consultas a `/sync/latest` y desmontar una instancia detiene el estado de las otras.
2. **Datos de otro usuario tras cerrar sesión:** `signOut()` no llama `clearAccounts()` ni limpia el estado de sync. `RequireAccounts` solo carga si la lista está vacía, así que un segundo usuario en la misma pestaña vería las cuentas del anterior.
3. **Parpadeo de "sin cuentas":** `RequireAccounts` renderiza `NoAccountsPanel` en el primer render, antes de que `onMounted` dispare la carga (`hasLoaded` existe pero no se usa).
4. **El 401 pierde el destino:** el handler de 401 hace `router.push({ name: 'login' })` sin `redirect`.

## Verificación de los 4 arreglos (Claude)

`npm run check` pasa: 53 archivos y 810 pruebas, build correcto. Los 4 hallazgos están corregidos en el código:

1. Sync: estado y polling compartidos en `src/composables/syncState.js`; un solo polling para todas las instancias.
2. `signOut` y el handler de 401 llaman `clearAccounts()` y `clearSyncState()`.
3. `RequireAccounts` muestra el skeleton hasta `hasLoaded` o error.
4. El 401 redirige a `login?redirect=<ruta actual>` si la ruta no es pública.

Menores que quedan (no bloquean):

- `latestLoaded` pasa a `true` aunque la primera carga de `/sync/latest` falle, y no se reintenta hasta cambiar de usuario.
- `useSession` y el router se importan entre sí (funciona, pero es frágil).
- `restore()` cierra la sesión ante cualquier error, incluso un fallo de red pasajero.
