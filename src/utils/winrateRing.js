export function getWinrateRing(winrate, options = {}) {
  if (typeof winrate !== 'number' || !Number.isFinite(winrate)) {
    return null
  }

  const { radius = 100, gap = 3 } = options
  const clampedWinrate = Math.min(100, Math.max(0, winrate))
  const circumference = 2 * Math.PI * radius

  if (clampedWinrate === 0) {
    return {
      circumference,
      win: { length: 0, offset: 0 },
      loss: { length: circumference, offset: 0 },
    }
  }

  if (clampedWinrate === 100) {
    return {
      circumference,
      win: { length: circumference, offset: 0 },
      loss: { length: 0, offset: 0 },
    }
  }

  const share = (clampedWinrate / 100) * circumference

  return {
    circumference,
    win: {
      length: Math.max(0, share - gap),
      offset: gap / 2,
    },
    loss: {
      length: Math.max(0, circumference - share - gap),
      offset: share + gap / 2,
    },
  }
}
