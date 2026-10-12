import { formatTier, isApexTier } from './summaryFormat'

// Continuous scale: every league starts at a fixed number of points and every
// division adds 100 on top of it. Apex leagues all share the same base.
const LEAGUE_BASE_POINTS = {
  IRON: 0,
  BRONZE: 400,
  SILVER: 800,
  GOLD: 1200,
  PLATINUM: 1600,
  EMERALD: 2000,
  DIAMOND: 2400,
  MASTER: 2800,
  GRANDMASTER: 2800,
  CHALLENGER: 2800,
}

const DIVISION_OFFSETS = { IV: 0, III: 100, II: 200, I: 300 }

const POINTS_PER_DIVISION = 100
const POINTS_PER_LEAGUE = 400
const APEX_START_POINTS = 2800
const DEFAULT_MAX_TICKS = 5

// Order of the divisions inside a league, from lowest to highest.
const DIVISIONS_BY_INDEX = ['IV', 'III', 'II', 'I']
// Leagues ordered by their base points, to find the league of a point value.
const LEAGUES_BY_INDEX = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND']

export function getLadderPoints(tier, division, leaguePoints) {
  if (typeof tier !== 'string' || typeof leaguePoints !== 'number') {
    return null
  }

  if (!Number.isFinite(leaguePoints)) {
    return null
  }

  const normalizedTier = tier.toUpperCase()
  const base = LEAGUE_BASE_POINTS[normalizedTier]

  if (base === undefined) {
    return null
  }

  // Apex leagues have no divisions, so the division is ignored (and may be missing).
  if (isApexTier(normalizedTier)) {
    return base + leaguePoints
  }

  const offset = typeof division === 'string' ? DIVISION_OFFSETS[division.toUpperCase()] : undefined

  if (offset === undefined) {
    return null
  }

  return base + offset + leaguePoints
}

// Label of the boundary that starts at `points` (a multiple of 100).
function getTickLabel(points) {
  if (points >= APEX_START_POINTS) {
    const extra = points - APEX_START_POINTS

    return extra === 0 ? 'Master' : `Master ${extra} LP`
  }

  const league = LEAGUES_BY_INDEX[Math.floor(points / POINTS_PER_LEAGUE)]
  const division = DIVISIONS_BY_INDEX[(points % POINTS_PER_LEAGUE) / POINTS_PER_DIVISION]

  return formatTier(league, division)
}

export function getLadderTicks(min, max, maxTicks = DEFAULT_MAX_TICKS) {
  // A non finite range has no meaningful ticks (and would never stop growing the step).
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return []
  }

  // The step grows 100, 200, 400, 800... until few enough ticks fit in the range.
  let step = POINTS_PER_DIVISION

  while (Math.floor(max / step) - Math.ceil(min / step) + 1 > maxTicks) {
    step *= 2
  }

  const ticks = []

  // The ladder starts at 0: the chart margin can push the axis below it, but there is no
  // league boundary there (and Math.ceil(-0.5) * step would produce a -0 tick).
  const firstTick = Math.max(0, Math.ceil(min / step) * step)

  for (let points = firstTick; points <= max; points += step) {
    ticks.push({ points, label: getTickLabel(points) })
  }

  return ticks
}
