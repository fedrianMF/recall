const relativeTimeFormatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

export function formatDuration(durationSeconds) {
  if (durationSeconds === null || durationSeconds === undefined) {
    return '—'
  }

  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function formatRelativeTime(dateString, now = new Date()) {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  const differenceInSeconds = (date.getTime() - now.getTime()) / 1000
  const units = [
    { name: 'year', seconds: 31_536_000 },
    { name: 'month', seconds: 2_592_000 },
    { name: 'day', seconds: 86_400 },
    { name: 'hour', seconds: 3_600 },
    { name: 'minute', seconds: 60 },
    { name: 'second', seconds: 1 },
  ]

  const unit = units.find(({ seconds }) => Math.abs(differenceInSeconds) >= seconds)

  if (!unit) {
    return relativeTimeFormatter.format(0, 'second')
  }

  const value = Math.round(Math.abs(differenceInSeconds / unit.seconds))
  const signedValue = differenceInSeconds < 0 ? -value : value

  return relativeTimeFormatter.format(signedValue, unit.name)
}
