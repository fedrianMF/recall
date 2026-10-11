export const navItems = [
  { to: '/', label: 'Resumen', icon: 'summary' },
  { to: '/champions', label: 'Campeones', icon: 'champions' },
  { to: '/matches', label: 'Historial', icon: 'history' },
]

// The home route must match exactly, otherwise it would be active on every page.
export function isNavItemActive(item, isActive, isExactActive) {
  return item.to === '/' ? isExactActive : isActive
}
