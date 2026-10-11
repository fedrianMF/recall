# recall

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Calidad y CI

`npm run check` ejecuta lint, formato, pruebas y build en un solo comando.
GitHub Actions ejecuta esas mismas comprobaciones en cada push a `main` y en cada pull request.
Los pasos aparecen separados en CI para identificar rápidamente qué comprobación falló.
`npm run lint` y `npm run format` corrigen archivos y están pensados para uso local.
`npm run lint:check` y `npm run format:check` solo comprueban, sin modificar archivos.
Dependabot revisa semanalmente las dependencias de npm y de GitHub Actions.
