# Recall · Dashboard "Resumen de rendimiento" — Handoff de diseño

Este paquete es la especificación visual para implementar la pantalla principal de **Recall** (coach y visor de estadísticas de League of Legends, Laravel + Vue).

Los HTML son **mockups estáticos de referencia**, no código de producción: usan estilos inline para fidelidad visual. Reimplementar con los componentes y el sistema de estilos del proyecto (tokens → variables CSS / config de Tailwind).

| Archivo | Contenido |
|---|---|
| `01-desktop-1440.html` | Pantalla desktop, 1440 × 1000 |
| `02-mobile-390.html` | Pantalla móvil, 390 de ancho (página completa con scroll) |
| `03-estados-navegacion.html` | Estados default / hover / focus / seleccionado de cada navegación |
| `04-decisiones-visuales.html` | Colores, tipografía, radios, espacios, sombras |

---

## 1. Datos que muestra la pantalla

Solo estos datos. **No inventar** evolución temporal, objetivos, recomendaciones ni métricas extra.

| Campo | Valor de ejemplo |
|---|---|
| Partidas | 105 |
| Victorias | 55 |
| Derrotas | 50 |
| Winrate | 52.4% |
| KDA | 2.8 |
| CS/min | 6.2 |
| Daño/min | 520.4 |
| Visión/min | 0.9 |
| Participación en asesinatos | 48.5% |
| Rango | Gold II, 45 LP |
| Cola | Solo/Dúo |
| Plataforma | LAN |

Placeholders del mockup que deben venir de la API: `[Tu Riot ID]`, la cuenta LAS (sin datos en el mockup), `[Campeón]`, `[K/D/A]`.
El selector de periodo muestra "Últimas 105 partidas" como etiqueta; las opciones reales dependen del backend.

---

## 2. Tokens

### Color

| Token | Hex | Uso |
|---|---|---|
| `rail` | `#0B0C0B` | Barra de navegación principal, botón primario |
| `charcoal` | `#1C1E1D` | Panel lateral de cuentas, cabecera móvil |
| `charcoal-raised` | `#262927` | Tarjeta de cuenta en el panel, controles sobre carbón |
| `charcoal-deep` | `#111312` | Fondo del segmento LAN/LAS |
| `sage` | `#DCE5D9` | Fondo del área principal |
| `surface` | `#FFFFFF` | Tarjetas y controles |
| `surface-muted` | `#EEF3ED` | Chip de icono neutro |
| `divider` | `#EDF1EB` | Separadores dentro de tarjetas |
| `ink` | `#151915` | Texto principal y cifras |
| `ink-muted` | `#56604F` | Etiquetas (≥4.5:1 sobre blanco y salvia) |
| `on-dark` | `#FFFFFF` | Texto sobre riel/carbón |
| `on-dark-muted` | `#9AA198` | Etiquetas sobre carbón |
| `on-dark-subtle` | `#C9CEC7` | Items de navegación contextual en reposo |
| `rail-item` | `#1F2220` | Fondo de icono del riel en reposo |
| `rail-item-hover` | `#2C302D` | Hover del riel |
| `rail-icon` | `#A3AAA1` | Icono del riel en reposo |
| **Victoria** `win` | `#2B874C` | Principal: iconos, barras, anillo, números grandes (4.49:1 sobre blanco) |
| `win-soft` | `#DCEFE2` | Fondo de badges/tarjetas de victoria |
| `win-text` | `#1B5C33` | Texto de victoria (6.66:1 sobre `win-soft`) |
| **Derrota** `loss` | `#E0401F` | Principal: iconos, barras, anillo, números grandes (4.27:1 sobre blanco) |
| `loss-soft` | `#FDE4DC` | Fondo de badges/tarjetas de derrota |
| `loss-text` | `#A02A12` | Texto de derrota (6.11:1 sobre `loss-soft`) |
| `sky` | `#3A9BD1` | Acento secundario: barra de LP y de participación |
| `sky-soft` | `#E3EEF4` | Pista de las barras celestes, chip de icono celeste |
| `sky-text` | `#1F6F9C` | Texto/iconos celestes, anillo de foco sobre claro |
| `focus-on-dark` | `#8ACFF2` | Anillo de foco sobre riel/carbón |
| `gold` | `#A77B1E` | Solo para la liga Gold (punto del chip) |
| `gold-soft` | `#F4E7C4` | Fondo del chip de rango / insignia |
| `gold-text` | `#6E4F0E` | Texto del chip de rango |
| `gold-on-dark` | `#E6C77E` | "Gold II · 45 LP" sobre carbón |

Regla: el texto pequeño de victoria/derrota usa siempre `win-text` / `loss-text`, nunca el principal.

### Tipografía (Google Fonts)

- **Bricolage Grotesque** (700, `letter-spacing` negativo): títulos y cifras. Escala: 116 (winrate desktop) · 76 (winrate móvil) · 60 · 48 · 40 · 30 · 28 px.
- **Geist** (400/500/600): interfaz. 16 títulos de tarjeta (600) · 15 cuerpo · 14 botones · 13 etiquetas · 12 · 11 micro.
- Todas las cifras con `font-variant-numeric: tabular-nums`.

```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Geist:wght@400..700&display=swap" rel="stylesheet">
```

### Radios

| Valor | Uso |
|---|---|
| 8 px | Chip de icono |
| 10 px | Controles (botones, selector de periodo, filas de nav contextual) |
| 12 px | Bloques internos, pestañas móviles |
| 14 px | Tarjetas de métrica |
| 16 px | Paneles grandes (winrate, partidas, rango), nav móvil |
| 20 px | Esquina izquierda del panel carbón y del área principal (desktop); esquinas superiores del área principal (móvil) |
| 999 px | Píldoras, iconos circulares del riel, segmento LAN/LAS |

### Espacio (base 4)

8 icono↔texto · 12 entre tarjetas en móvil · 16 entre tarjetas en desktop · 20–24 padding de tarjeta · 28 entre bloques del área principal · 40 margen del área principal en desktop (20 en móvil). Área táctil mínima: 44 px.

### Sombras

- Reposo (tarjetas): `0 1px 2px rgba(20,30,20,.06), 0 6px 18px rgba(20,30,20,.08)`
- Flotante (solo nav móvil): `0 12px 32px rgba(11,12,11,.28)`
- Foco: anillo `2px` sólido (`sky-text` sobre claro, `focus-on-dark` sobre oscuro) con `outline-offset: 3px`. Nunca sombra difusa.

Sin bordes decorativos, sin degradados, sin glassmorphism.

---

## 3. Layout desktop (1440)

```
┌─────┬──────────────┬──────────────────────────────────────────────┐
│ 72  │ 280 carbón    │ área salvia (flex 1), padding 36/40/40        │
│riel │ Tus cuentas   │ H1 "Resumen de rendimiento" | Periodo | Actualizar │
│     │ [LAN | LAS]   │ Identidad: insignia · Riot ID #LAN · chips    │
│     │ tarjeta cuenta│ ┌ Winrate 560×472 ┐ ┌ Partidas 432×196 ┐     │
│     │ En esta vista │ │ 52.4% + anillo  │ ├ Rango 432×260    ┤     │
│     │ nav contextual│ └─────────────────┘ └──────────────────┘     │
│ ⚙   │ Vincular cta. │ Rendimiento en partida: 5 tarjetas (grid 5)   │
└─────┴──────────────┴──────────────────────────────────────────────┘
```

- **Riel (72 px, `rail`)**: logo arriba; Resumen, Campeones, Historial; Configuración abajo. Botones circulares de 48 px, solo icono con `aria-label` y tooltip en hover.
- **Panel carbón (280 px)**: esquina izquierda redondeada 20 px. Selector segmentado LAN/LAS, tarjeta de cuenta (Riot ID, región, rango actual), navegación contextual (Visión general, Winrate, Partidas, Rendimiento en partida, Rango) y botón "Vincular cuenta" al fondo.
- **Área principal**: esquina izquierda redondeada 20 px, montada sobre el panel carbón.
- **Winrate (componente principal)**: número de 116 px y "%" en `win`. Anillo de 232 px, trazo 20: arco `win` = 52.4%, arco `loss` = resto, 3 px de separación entre ellos y una marca de referencia en el 50% (abajo). Centro: ✓ 55 V / ✕ 50 D. Badge "Por encima del 50%" (solo si winrate > 50). Leyenda abajo.
- **Partidas**: 105 grande; columnas ✓ Victorias 55 / ✕ Derrotas 50; barra proporcional (55/105) `win` | `loss`.
- **Rango**: insignia, "Gold II", "45 / 100 LP", barra LP `sky` al 45%, y una grilla de 4 celdas `<dl>`: Plataforma, Cola, Liga, División.
- **Métricas**: 5 tarjetas iguales (KDA, CS/min, Daño/min, Visión/min, Participación) con chip de icono, etiqueta, valor de 40 px y subtítulo. Participación lleva una barra `sky` al 48.5%. Estas métricas van en tinta neutra (sin verde/rojo), porque no hay referencia contra la cual juzgarlas.

## 4. Layout móvil (390)

- Cabecera carbón: logo, **control compacto de cuenta** (píldora "LAN · Gold II ▾" que abre un selector/hoja) y botón de actualizar (44 px).
- Área salvia con esquinas superiores de 20 px. Orden: título → selector de periodo (ancho completo) → Winrate → Partidas → Métricas (grid 2 × 2 + Participación a ancho completo) → Rango (dl 2 × 2).
- **Navegación inferior** flotante en `rail`: 4 pestañas (Resumen, Campeones, Historial, Ajustes) con icono y texto; la activa es una píldora blanca. Reservar ~120 px de padding inferior en el contenido.
- Sin tablas horizontales. Todas las áreas táctiles ≥44 px.

Breakpoint sugerido: móvil < 768 px; entre 768 y 1280, colapsar el panel carbón (por ejemplo, en un drawer) y pasar la grilla de métricas a 3 columnas.

## 5. Estados de navegación

| Componente | Default | Hover | Focus | Seleccionado |
|---|---|---|---|---|
| Riel | `rail-item`, icono `rail-icon` | `rail-item-hover`, icono blanco, tooltip | anillo `focus-on-dark` | círculo blanco, icono `rail`, `aria-current="page"` |
| Nav contextual | transparente, `on-dark-subtle` | `#2A2D2B`, texto blanco | anillo `focus-on-dark` | píldora blanca, texto `rail` 600, punto `win` |
| Segmento LAN/LAS | texto `on-dark-muted` | fondo `charcoal-raised`, texto blanco | anillo `focus-on-dark` | píldora blanca, `aria-pressed="true"` |
| Pestaña móvil | texto `rail-icon` | `rail-item`, blanco | anillo `focus-on-dark` | píldora blanca, texto `rail` 600 |

El estado seleccionado se distingue por forma (píldora blanca) y contraste, no solo por color.

## 6. Accesibilidad

- Victoria/derrota siempre llevan **icono ✓/✕ + palabra**; el color refuerza pero nunca es la única señal.
- Anillo, barras y medidores tienen `role="img"` y un `aria-label` con el dato completo (por ejemplo, "Winrate 52.4%: 55 victorias y 50 derrotas").
- Usar elementos reales: `<button>`, `<nav>`, `<section aria-labelledby>`, `<dl>` para los datos del rango.
- Foco visible en todos los controles (`:focus-visible`).

## 7. Iconos

Lineales, trazo 1.8, `stroke-linecap/linejoin: round`, 18–22 px (los SVG están inline en los HTML). Se pueden sustituir por Lucide: `layout-dashboard`, `shield`, `list`, `sliders-horizontal`, `refresh-cw`, `calendar`, `chevron-down`, `check`, `x`, `arrow-up-right`, `sword`, `coins`, `zap`, `eye`, `users`, `plus`.

La insignia de rango es un hexágono dorado con dos chevrones: es un placeholder original, no el emblema oficial de Riot.
