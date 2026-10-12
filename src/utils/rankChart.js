import { getLadderPoints, getLadderTicks } from './rankLadder'
import { formatTier } from './summaryFormat'

const DEFAULT_WIDTH = 400
const DEFAULT_HEIGHT = 200
const DEFAULT_PADDING = 10
const MIN_VERTICAL_MARGIN = 50
const VERTICAL_MARGIN_RATIO = 0.05
const MS_PER_DAY = 24 * 60 * 60 * 1000

// Rounds to 2 decimals. Number() drops the extra zeros: '40.00' becomes 40.
function round(value) {
  return Number(value.toFixed(2))
}

// Works on a copy: keeps only measurements with a known rank and a valid date,
// and sorts them from oldest to newest. Returns null if fewer than 2 remain
// or if they all share the same moment.
function prepareHistory(history) {
  if (!Array.isArray(history)) {
    return null
  }

  const measurements = history
    .map((measurement) => ({
      measurement,
      time: Date.parse(measurement?.taken_at),
      ladderPoints: getLadderPoints(
        measurement?.tier,
        measurement?.rank,
        measurement?.league_points,
      ),
    }))
    .filter((item) => !Number.isNaN(item.time) && item.ladderPoints !== null)
    .sort((a, b) => a.time - b.time)

  if (measurements.length < 2) {
    return null
  }

  const first = measurements[0]
  const last = measurements[measurements.length - 1]

  if (first.time === last.time) {
    return null
  }

  return { measurements, first, last }
}

export function hasEnoughMeasurements(history) {
  return prepareHistory(history) !== null
}

export function getRankChart(history, options = {}) {
  const prepared = prepareHistory(history)

  if (prepared === null) {
    return null
  }

  const { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, padding = {} } = options
  const {
    top = DEFAULT_PADDING,
    right = DEFAULT_PADDING,
    bottom = DEFAULT_PADDING,
    left = DEFAULT_PADDING,
  } = padding

  const { measurements, first, last } = prepared
  const plotWidth = width - left - right
  const plotHeight = height - top - bottom

  const values = measurements.map((item) => item.ladderPoints)
  const lowest = Math.min(...values)
  const highest = Math.max(...values)
  const margin = Math.max(MIN_VERTICAL_MARGIN, (highest - lowest) * VERTICAL_MARGIN_RATIO)
  const axisMin = lowest - margin
  const axisMax = highest + margin

  // X grows with time. Y is inverted: SVG puts 0 at the top, so higher ranks get smaller y.
  const toX = (time) => left + ((time - first.time) / (last.time - first.time)) * plotWidth
  const toY = (value) => top + ((axisMax - value) / (axisMax - axisMin)) * plotHeight

  const points = measurements.map((item) => ({
    x: round(toX(item.time)),
    y: round(toY(item.ladderPoints)),
    ladderPoints: item.ladderPoints,
    measurement: item.measurement,
  }))

  const ticks = getLadderTicks(axisMin, axisMax).map((tick) => ({
    points: tick.points,
    y: round(toY(tick.points)),
    label: tick.label,
  }))

  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`)

  return {
    points,
    path: path.join(' '),
    ticks,
    first: first.measurement,
    last: last.measurement,
    delta: last.ladderPoints - first.ladderPoints,
    days: Math.round((last.time - first.time) / MS_PER_DAY),
  }
}

export function describeMeasurement(measurement) {
  return `${formatTier(measurement.tier, measurement.rank)} ${measurement.league_points} LP`
}

export function getRankHistoryLabel(history) {
  const prepared = prepareHistory(history)

  if (prepared === null) {
    return 'Evolución del rango: sin datos suficientes'
  }

  const { first, last } = prepared
  const delta = last.ladderPoints - first.ladderPoints
  const days = Math.round((last.time - first.time) / MS_PER_DAY)
  let durationLabel = `${days} días`
  if (days === 0) {
    durationLabel = 'menos de un día'
  } else if (days === 1) {
    durationLabel = '1 día'
  }

  let changeLabel = 'Sin cambios.'
  if (delta > 0) {
    changeLabel = `Subió ${delta} LP.`
  } else if (delta < 0) {
    changeLabel = `Bajó ${Math.abs(delta)} LP.`
  }

  return (
    `Evolución del rango: de ${describeMeasurement(first.measurement)} ` +
    `a ${describeMeasurement(last.measurement)} en ${durationLabel}. ${changeLabel}`
  )
}
