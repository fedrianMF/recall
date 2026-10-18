const labels = {
  queued: 'En cola',
  running: 'Sincronizando…',
  completed: 'Completada',
  failed: 'Falló',
}

export function isActiveSync(status) {
  return status === 'queued' || status === 'running'
}
export function syncStatusLabel(status) {
  return labels[status] ?? 'Estado desconocido'
}
