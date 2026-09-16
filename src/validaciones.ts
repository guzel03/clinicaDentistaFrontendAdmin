const SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/
const SOLO_NUMEROS = /^\d+$/
const CI_REGEX = /^\d{11}$/
const TELEFONO_REGEX = /^[0-9+\s-]+$/

export function esCiValida(ci: string): boolean {
  if (!CI_REGEX.test(ci)) return false

  const primerDigito = Number(ci[0])
  const mes = Number(ci.slice(1, 3))
  const dia = Number(ci.slice(3, 5))
  const anioCorto = Number(ci.slice(5, 7))

  if (primerDigito < 1 || primerDigito > 9 || mes < 1 || mes > 12) return false

  const siglo = primerDigito === 3 || primerDigito === 4 ? 2000 : 1900
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