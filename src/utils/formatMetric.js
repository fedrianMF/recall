export function formatMetric(value, suffix = '') {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }

  return `${value}${suffix}`
}
