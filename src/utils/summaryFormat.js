const PLATFORM_NAMES = {
  la1: 'LAN',
  la2: 'LAS',
}

const QUEUE_NAMES = {
  RANKED_SOLO_5x5: 'Solo/Dúo',
  RANKED_FLEX_SR: 'Flexible',
}

const APEX_TIERS = new Set(['MASTER', 'GRANDMASTER', 'CHALLENGER'])

export function formatPlatform(platform) {
  if (platform === null || platform === undefined) {
    return '—'
  }

  return PLATFORM_NAMES[platform] ?? platform
}

export function formatQueueType(queueType) {
  if (queueType === null || queueType === undefined) {
    return '—'
  }

  return QUEUE_NAMES[queueType] ?? queueType
}

export function formatTier(tier, division) {
  if (!tier) {
    return 'Sin rango'
  }

  const normalizedKey = tier.toUpperCase()
  const normalizedTier = `${normalizedKey.charAt(0)}${normalizedKey.slice(1).toLowerCase()}`

  if (APEX_TIERS.has(normalizedKey) || !division) {
    return normalizedTier
  }

  return `${normalizedTier} ${division}`
}

export function getProgressPercent(value, total) {
  if (typeof total !== 'number' || !Number.isFinite(total) || total <= 0) {
    return 0
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0
  }

  return Math.min(100, Math.max(0, (value / total) * 100))
}

export function getWinrateLabel({ winrate, wins, losses }) {
  if (winrate === null || winrate === undefined) {
    return 'Winrate sin datos'
  }

  const winsLabel = wins === 1 ? 'victoria' : 'victorias'
  const lossesLabel = losses === 1 ? 'derrota' : 'derrotas'

  return `Winrate ${winrate}%: ${wins} ${winsLabel} y ${losses} ${lossesLabel}`
}
