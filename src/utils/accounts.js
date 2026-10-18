// Single source of truth for the Riot platforms the app supports.
export const accountOptions = [
  { value: 'la1', label: 'LAN' },
  { value: 'la2', label: 'LAS' },
]

export function platformOptions(accounts = []) {
  const platforms = new Set(accounts.map((account) => account.platform))
  return accountOptions.filter((option) => platforms.has(option.value))
}

export function platformLabel(platform) {
  return accountOptions.find((option) => option.value === platform)?.label ?? platform
}
