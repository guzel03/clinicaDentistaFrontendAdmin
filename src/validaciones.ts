const SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/
const SOLO_NUMEROS = /^\d+$/
const CI_REGEX = /^\d{11}$/
const TELEFONO_REGEX = /^[0-9+\s-]+$/

export function esCiValida(ci: string): boolean {
  if (!CI_REGEX.test(ci)) return false

  const anioCorto = Number(ci.slice(0, 2))
  const mes = Number(ci.slice(2, 4))
  const dia = Number(ci.slice(4, 6))

  if (mes < 1 || mes > 12) return false

  const anioActual = new Date().getFullYear()
  const siglo = anioCorto > anioActual % 100 ? 1900 : 2000
  const anioCompleto = siglo + anioCorto
  const diasEnMes = new Date(anioCompleto, mes, 0).getDate()

  return dia >= 1 && dia <= diasEnMes
}

export function soloLetras(valor: string): boolean {
  return SOLO_LETRAS.test(valor.trim())
}

export function soloNumeros(valor: string): boolean {
  return SOLO_NUMEROS.test(valor.trim())
}

export function ciValido(valor: string): boolean {
  return esCiValida(valor.trim())
}

export function telefonoValido(valor: string): boolean {
  return TELEFONO_REGEX.test(valor.trim())
}

export function soloLetrasInput(valor: string): string {
  return valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '')
}

export function soloNumerosInput(valor: string): string {
  return valor.replace(/\D/g, '')
}

export function soloTelefonoInput(valor: string): string {
  return valor.replace(/[^0-9+\s-]/g, '')
}

export function ciInput(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 11)
}