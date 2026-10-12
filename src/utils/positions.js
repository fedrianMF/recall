// Canonical order of the positions, also used to break ties when sorting.
const POSITION_ORDER = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY']

const POSITION_NAMES = {
  TOP: 'Superior',
  JUNGLE: 'Jungla',
  MIDDLE: 'Medio',
  BOTTOM: 'Tirador',
  UTILITY: 'Soporte',
}

// Returns the canonical index of a position, or -1 when it is unknown.
function getPositionIndex(position) {
  if (typeof position !== 'string') {
    return -1
  }

  return POSITION_ORDER.indexOf(position.toUpperCase())
}

function hasValidGames(item) {
  return typeof item?.games === 'number' && Number.isFinite(item.games)
}

export function formatPosition(position) {
  if (position === null || position === undefined || position === '') {
    return '—'
  }

  const index = getPositionIndex(position)

  if (index === -1) {
    return position
  }

  return POSITION_NAMES[POSITION_ORDER[index]]
}

export function sortPositionsByGames(positions) {
  if (!Array.isArray(positions)) {
    return []
  }

  // Spread into a new array: sort() mutates, and the input must stay untouched.
  return [...positions].sort((a, b) => {
    const indexA = getPositionIndex(a?.position)
    const indexB = getPositionIndex(b?.position)

    // Unknown positions always go last, even with more games.
    if ((indexA === -1) !== (indexB === -1)) {
      return indexA === -1 ? 1 : -1
    }

    // Entries without a numeric games count go last.
    if (hasValidGames(a) !== hasValidGames(b)) {
      return hasValidGames(a) ? -1 : 1
    }

    if (hasValidGames(a) && a.games !== b.games) {
      return b.games - a.games
    }

    // Both unknown: -1 - -1 is 0, so the original order is kept.
    return indexA - indexB
  })
}

export function getPositionLabel({ position, games, winrate }) {
  const gamesLabel = games === 1 ? 'partida' : 'partidas'
  const winrateLabel =
    winrate === null || winrate === undefined ? 'sin winrate' : `${winrate}% de victorias`

  return `${formatPosition(position)}: ${games} ${gamesLabel}, ${winrateLabel}`
}
