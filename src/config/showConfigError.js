function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

export function showConfigError(error, container) {
  const target = container ?? document.getElementById('app') ?? document.body
  const alert = document.createElement('div')
  const title = document.createElement('h1')
  const message = document.createElement('p')

  alert.setAttribute('role', 'alert')
  alert.style.maxWidth = '40rem'
  alert.style.margin = '2rem auto'
  alert.style.padding = '1.5rem'
  alert.style.border = '1px solid #b42318'
  alert.style.borderRadius = '1rem'
  alert.style.backgroundColor = '#fff4f2'
  alert.style.color = '#7a271a'
  alert.style.fontFamily = 'system-ui, sans-serif'

  title.textContent = 'Error de configuración'
  title.style.margin = '0 0 0.75rem'
  title.style.fontSize = '1.5rem'

  message.textContent = getErrorMessage(error)
  message.style.margin = '0'

  alert.append(title, message)
  target.replaceChildren(alert)

  return alert
}
