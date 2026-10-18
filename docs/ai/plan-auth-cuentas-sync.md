# Plan: authentication, linked accounts and sync

Executable plan for Codex. Branch: `feat/auth-cuentas-sync` (the user creates it; do NOT create it, commit or push). Work through the five steps in order. Tick the checkbox of each step in this file when it is done.

Source of truth for shapes: `docs/openapi.json` (already updated, do not edit it). Project rules: `AGENTS.md` and `docs/ai/vue-build.md`. User-facing text is Spanish; code, names and comments are English. JavaScript only, no new dependencies.

## How to run each step

1. `vue-builder` implements the step.
2. `vue-tester` writes the tests of the step.
3. `vue-reviewer` reviews; fix what it reports.
4. `npm run check` must pass (lint, format, tests, build).
5. Break-test: for each new test file, break the code on purpose once and confirm the test fails, then restore.
6. Tick the step and append a 3-line note under it (files touched, how to try it in the browser, proposed commit message in Spanish).

## Credentials

This repository is public. Never write real credentials, emails, tokens or Riot IDs in code, tests, mocks, docs or reports. Tests use obviously fake values (`user@example.test`, `not-a-real-password`). Codex does not log in to the real backend: the user does the manual browser check with their own account.

## Stop conditions (stop and report instead of guessing)

- The contract and the real behaviour of `http://recall-api.aime.test` disagree.
- You need a new dependency, to touch `.env`, or to change the backend.
- An existing test breaks and you cannot explain why the change is expected. Explain before editing the test.

## Decisions already taken (do not re-open)

- Token in `localStorage` under the key `recall.session`, saved as `{ token, expiresAt }`. Wrap every read/write in try/catch (storage can be blocked). A token whose `expiresAt` is in the past counts as no session.
- The real backend runs at `http://recall-api.aime.test`. Auth, accounts and sync endpoints always call the real API, even when `VITE_USE_MOCKS=true`. Only the existing data endpoints (summary, champions, positions, matches, match, rank history) keep their mocks. Do not create mocks for the new endpoints. If `apiUrl` is `null` (mocks without URL) the new functions throw a clear `Error`. Tell the user at the end to set `VITE_USE_MOCKS=false` in `.env.development` to use the real data (do not touch the file).
- The email verification link ends at `http://localhost:5173/email-verified?status=ok|already|invalid` (public route, works with or without session).
- The data filter keeps using `account=la1|la2` (platform). Filtering by `account_id` is a separate backend task: do not implement it, but leave one comment where the platform filter is built saying so.
- Sync `status` values are exactly `queued`, `running`, `completed`, `failed` (the contract still says `string`). Any other value is shown as a generic terminal state and must not crash.
- Design: there are no auth screens in `docs/recall-diseno/`. Read `README.md` and `04-decisiones-visuales.html` there first and stay faithful to it: `bg-sage` page, `bg-surface` card with `rounded-shell` and `shadow-card`, `font-display` headings, primary button `bg-rail text-on-dark rounded-control min-h-11`, error blocks like `SummaryErrorPanel.vue`, dark shell parts with `data-focus-theme="dark"`. Only tokens from `src/assets/main.css`; no hex, no default Tailwind palette. Reuse `AppLogo`.
- Accessibility rules from AGENTS.md apply: one `<h1>` per screen, real labels, `aria-invalid` + `aria-describedby` on invalid fields, 44px targets, visible focus ring, `motion-reduce:animate-none`, move focus to a stable `tabindex="-1"` target when the focused element disappears.

## Contract summary (all bodies are `{ "data": ... }` unless noted)

Auth header on everything except login, register and verify: `Authorization: Bearer <token>`.

| Call                                                                | Success                                       | Errors                                                                              |
| ------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------- |
| `POST /auth/register` `{name,email,password,password_confirmation}` | 201 `data:{id,name,email,email_verified}`     | 403 registration closed, 422, 429                                                   |
| `POST /auth/login` `{email,password,device_name?}`                  | 200 `data:{token,token_type,expires_at}`      | 401 `invalid_credentials`, 422                                                      |
| `POST /auth/logout`                                                 | 204                                           | 401                                                                                 |
| `GET /auth/me`                                                      | 200 `data:{id,name,email,email_verified}`     | 401                                                                                 |
| `POST /auth/email/resend`                                           | 204                                           | 401, 409 `email_already_verified`, 429 `too_many_requests`                          |
| `GET /accounts`                                                     | 200 `data:[{id,game_name,tag_line,platform}]` | 401                                                                                 |
| `POST /accounts` `{game_name(<=32),tag_line(<=10),platform:la1      | la2}`                                         | 201 created, 200 already linked (same body)                                         | 401, 403 `email_not_verified`, 409 `account_already_linked`, 422 (`validation_failed` / `account_limit_reached` / `riot_account_not_found`), 503 `riot_key_expired` |
| `POST /sync` (no body)                                              | 202 `data:SyncRun`                            | 401, 403 `email_not_verified`, 409 `already_running`, 422 `no_accounts_linked`, 429 |
| `GET /sync/latest`                                                  | 200 `data:SyncRun`                            | 401, 404 none yet                                                                   |

`SyncRun = { id, status, new_matches, error_code|null, started_at|null, finished_at|null, created_at }`.
Error bodies: `{ message, code, errors? }` where `errors` is `{ field: [messages] }`. Every existing data endpoint can now answer 401 `unauthenticated`.
Use `device_name: 'Recall web'` on login. Use `device_name` nowhere else.

---

## Step 1 - Session foundation (no UI) `[x]`

Files touched: `src/api/recall.js`, `src/composables/useApiRequest.js`, `src/utils/authStorage.js`, `src/composables/useSession.js`, plus session/API tests.
Browser: configure the real API and verify that login, token restoration, expiry and forced 401 return to `/login`.
Commit message: `feat: agrega la base de autenticación y sesión`

Files: `src/api/recall.js`, `src/composables/useApiRequest.js`, new `src/utils/authStorage.js`, new `src/composables/useSession.js`.

- `ApiError` gets `code` and `errors` (parsed from the JSON error body; if the body is not JSON they stay `undefined`). Keep `status`. `useApiRequest` must copy `code` and `errors` to the display error as it already does for `status`.
- `fetchJson` becomes a general helper that accepts `{ method, body, auth = true }`: sends `Accept: application/json`, `Content-Type: application/json` when there is a body, and `Authorization: Bearer` when `auth` and a token exists. Handles 204 (returns `null`). Keep the signature/behaviour used by the Data Dragon call (no auth header there: never send the token to ddragon).
- A 401 on an authenticated call clears the stored session and calls a handler registered with `setUnauthorizedHandler(fn)` (exported from `recall.js`). Login and register use `auth: false`, so an `invalid_credentials` 401 never triggers it.
- New functions, one per endpoint: `login({email,password})`, `register({name,email,password,passwordConfirmation})` (maps to snake_case), `logout()`, `getMe()`, `resendVerificationEmail()`, `getAccounts()`, `linkAccount({gameName,tagLine,platform})`, `getLatestSync()` (404 -> resolves `null`), `startSync()`. They return the parsed JSON, except `getLatestSync` as noted. `linkAccount` returns `{ data, created }` using the status (201 vs 200).
- `src/utils/authStorage.js` (pure helpers): `readSession()`, `saveSession({token,expiresAt})`, `clearSession()`. It uses `localStorage`, not the browser's `sessionStorage`.
- `useSession.js`: module-level shared state (like `useAccount.js`): `user`, `isAuthenticated`, `isRestoring`. Methods: `signIn(credentials)` (login, save token, load `me`), `signUp(data)` (register, then signIn with the same credentials), `restore()` (if a valid token exists call `getMe`; on failure clear), `signOut()` (call `logout`, ignore its failure, always clear local state), `refreshUser()`. It registers the unauthorized handler so a 401 sets the user to `null` and sends the router to login.

Tests: `tests/api/recall.test.js` (auth header sent, not sent to ddragon, 204, 404 -> null, error `code`/`errors` parsed, 401 clears session and calls the handler, login 401 does not), `tests/utils/authStorage.test.js` (expired token, blocked storage), `tests/composables/useSession.test.js`, update `useApiRequest` tests. Use `fetch` stubs; no real network.

## Step 2 - Login, register and protected routes `[x]`

Files touched: auth views/components, router, `App.vue`, shell session controls and related tests.
Browser: open `/register`, create a test account against the real API, then verify `/login`, redirects and sign-out.
Commit message: `feat: agrega acceso y rutas protegidas`

Files: new `src/views/LoginView.vue`, `src/views/RegisterView.vue`, `src/components/auth/AuthLayout.vue`, `src/components/auth/AuthField.vue` (label + input + error), `src/components/auth/FormAlert.vue` as needed, `src/router/index.js`, `src/App.vue`, shell sign-out control.

- Routes: `/login` (`name: 'login'`), `/register` (`name: 'register'`), meta `{ public: true, guestOnly: true, layout: 'auth' }`. Titles "Iniciar sesión", "Crear cuenta".
- `App.vue`: routes with `meta.layout === 'auth'` render only `RouterView` inside `AuthLayout` (no `AppShell`). Others render `AppShell`.
- Router `beforeEach` (async): call `restore()` once on the first navigation. Non-public route without session -> `{ name: 'login', query: { redirect: to.fullPath } }`. `guestOnly` route with session -> `/`. After login go to `redirect` only if it is an internal path (starts with `/`, not `//`); otherwise `/`. Keep the `/404` catch-all last. Update `tests/helpers/createTestRouter.js` and the router tests.
- Login form: email, password, submit "Entrar", link to register. Messages: 401 `invalid_credentials` -> "Correo o contraseña incorrectos."; 422 -> per-field errors from `errors`; network/other -> "No se pudo iniciar sesión. Inténtalo de nuevo."
- Register form: name, email, password, password confirmation (client check that both match before sending), submit "Crear cuenta", link to login. 403 -> "El registro está cerrado por ahora."; 429 -> "Demasiados intentos. Espera un momento."; 422 -> per-field. On success, auto login and go to `/` (the verification banner appears in step 3).
- Forms: `<form @submit.prevent>`, submit disabled and `aria-busy` while sending, on error move focus to the first invalid field or to the alert (`tabindex="-1"`). Correct `autocomplete` (`email`, `current-password`, `new-password`, `name`) and `type`.
- Sign-out: new `src/components/shell/SessionControls.vue` (user name + "Cerrar sesión" button, 44px) shown in `ShellAccountPanel` (xl) and in the other breakpoints next to `AccountCompactSelect` (mobile header and the md-lg top strip). After sign-out go to `/login`.

Tests: both views (fields, validation messages, success path calls API and navigates, error paths per code, a11y roles/labels), router guard (redirect with and without session, open redirect rejected), `SessionControls`, `App.vue` layout switching.

## Step 3 - Email verification `[x]`

Files touched: `EmailVerifiedView.vue`, `EmailVerificationBanner.vue`, shell and router, plus verification coverage.
Browser: visit `/email-verified?status=ok`, `already` and an invalid status; resend from the shell with an unverified account.
Commit message: `feat: agrega verificación de correo`

Files: new `src/views/EmailVerifiedView.vue`, new `src/components/shell/EmailVerificationBanner.vue`, `src/router/index.js`, `src/components/shell/AppShell.vue`.

- Route `/email-verified` (`name: 'email-verified'`, `meta: { public: true, layout: 'auth' }`, title "Correo verificado"). Reads `route.query.status`: `ok` -> success "Tu correo quedó verificado" + button to go to `/` (or to login if no session); `already` -> "Tu correo ya estaba verificado"; `invalid` or anything else -> error "El enlace no es válido o venció" with a link to log in to request a new one. If there is a session, call `refreshUser()` on mount. Success/failure carry a word or icon besides color.
- Banner (`role="status"`) at the top of the shell content while `user.email_verified === false`: text "Verifica tu correo para vincular cuentas y sincronizar." and a "Reenviar correo" button. 204 -> "Te enviamos un correo nuevo." ; 409 -> `refreshUser()` and the banner disappears; 429 -> "Espera un momento antes de volver a intentarlo."; other -> generic error. Disable the button while sending.

Tests: view per status (including unknown/missing), banner states and the three outcomes of resend.

## Step 4 - Linked accounts `[x]`

Files touched: accounts composable, view/components, account utilities and shell selectors/panel, plus account coverage.
Browser: open `/accounts`, link a fake/test Riot account on LAN or LAS, and verify dynamic platform options and empty-account gating.
Commit message: `feat: permite vincular cuentas de League of Legends`

Files: new `src/composables/useAccounts.js`, new `src/views/AccountsView.vue`, new `src/components/accounts/LinkAccountForm.vue`, new `src/components/accounts/NoAccountsPanel.vue`, new `src/components/accounts/RequireAccounts.vue`, `src/utils/accounts.js`, `src/components/shell/ShellAccountPanel.vue`, `src/components/shell/AccountCompactSelect.vue`, `src/components/shell/AccountSwitch.vue`, `src/App.vue`, `src/router/index.js`.

- `useAccounts()` (shared module state): `accounts`, `isLoading`, `error`, `hasLoaded`, `load()`, `add(account)`. Loads after a session exists and is cleared on sign-out.
- `src/utils/accounts.js`: keep `la1 -> LAN`, `la2 -> LAS` as a label map plus a pure helper `platformOptions(accounts)` returning the distinct platforms of the linked accounts, in `la1, la2` order. The switch and compact select use it instead of the fixed list. If the selected platform disappears, reset the selection to all. Add the comment about the future `account_id` filter next to it.
- `ShellAccountPanel` (xl) also lists the linked accounts (`game_name#tag_line` + platform label, from runtime data only) and has a link "Vincular cuenta" to `/accounts`.
- Route `/accounts` (`name: 'accounts'`, title "Cuentas", protected): `h1`, the list of linked accounts and `LinkAccountForm` (game name, tag line, platform select LAN/LAS; trim values; remove a leading `#` from the tag line; respect max lengths 32/10). Submit -> `linkAccount`; on 201 or 200 add to the list and show "Cuenta vinculada" (200 is not an error). Error messages by `code`: `riot_account_not_found` -> "No encontramos ese Riot ID en esa plataforma."; `account_limit_reached` -> "Alcanzaste el límite de cuentas vinculadas."; `validation_failed` -> per-field; 409 `account_already_linked` -> "Esa cuenta ya está vinculada a otro usuario."; 403 `email_not_verified` -> "Verifica tu correo para vincular cuentas."; 503 `riot_key_expired` -> "Riot no está disponible por ahora. Inténtalo más tarde."; other -> generic. Loading, empty and error states for the list.
- `RequireAccounts` wraps the page in `App.vue` for routes with `meta.needsAccounts` (summary, champions, matches, match-detail): while loading accounts show a skeleton, on error a retry panel, with zero accounts show `NoAccountsPanel` (welcome text + button to `/accounts`), otherwise render the slot. This way the data views are not touched and never request data before an account exists.

Tests: `useAccounts`, `platformOptions`, form (every error code, 200 vs 201, trimming), `RequireAccounts` (four states), panel/switch with dynamic options, `/accounts` view.

## Step 5 - Sync `[x]`

Files touched: `syncStatus.js`, `useSync.js`, `SyncButton.vue`, shell placement and refresh wiring, plus sync coverage.
Browser: with a verified account and linked account, press `Sincronizar partidas` and verify progress, completion and refreshed data.
Commit message: `feat: agrega sincronización de partidas`

Files: new `src/utils/syncStatus.js`, new `src/composables/useSync.js`, new `src/components/shell/SyncButton.vue`, `src/App.vue`, shell placement.

- `syncStatus.js` (pure): `isActiveSync(status)` (`queued`/`running`), label per status in Spanish ("En cola", "Sincronizando…", "Completada", "Falló"), unknown -> "Estado desconocido" treated as finished.
- `useSync()`: on mount call `getLatestSync()` once (null = never synced); if the latest is active, resume polling. `start()` calls `startSync()` and polls `getLatestSync()` with a chained `setTimeout` every 3 s while active, never overlapping requests; stop on `completed`/`failed`, on unmount and on sign-out; give up after 5 minutes with a "tarda más de lo normal" message. A 409 `already_running` means "join the running one": start polling instead of showing an error. Expose `latest`, `isRunning`, `error`, `start`, and a `completedCount` number that increments each time a run reaches `completed`.
- `SyncButton`: button "Sincronizar partidas" (disabled while running or when the email is not verified, with the reason visible as text). Shows "Última sincronización: <date> · N partidas nuevas" and a `role="status"` live region for progress; `aria-busy` while running. Errors: 422 `no_accounts_linked` -> text + link to `/accounts`; 403 -> "Verifica tu correo para sincronizar."; 429 -> "Espera un momento antes de volver a sincronizar."; `failed` -> "La sincronización falló. Inténtalo de nuevo." (show `error_code` only inside the title/tooltip-free text if useful, never invent meanings). Place it in `ShellAccountPanel` (xl) and, like `SessionControls`, in the compact header/top strip below xl; keep 44px targets.
- Refresh: in `App.vue` use `completedCount` as the `:key` of the page `RouterView` so the visible view re-fetches after a completed sync; before the remount move focus to `#main` (`tabindex="-1"`), and also call `useAccounts().load()`.

Tests: `syncStatus`, `useSync` with fake timers (polling, no overlap, stops, 409 join, 404 none, timeout, cleanup on unmount), `SyncButton` (every state and error code), key-driven refresh.

---

## Final checklist (after step 5)

- `npm run check` green on the whole branch.
- Manual run in the browser against the real API: register -> banner -> verify via the email link (`/email-verified?status=ok`) -> link account -> sync -> data visible -> sign out -> protected routes redirect to login; a forced 401 (delete the token in dev tools) sends you to login.
- Report in Spanish: what changed and why, files touched per step, how to try it, proposed commit messages (one per step), and open points (`account_id` filter pending in the backend; sync `status` enum pending in `openapi.json`; `VITE_USE_MOCKS` should be `false` in `.env.development`; backend `FRONTEND_URL` must be exactly `http://localhost:5173`).
