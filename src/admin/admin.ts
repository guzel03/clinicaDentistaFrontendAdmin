export const formVacio = { nombre: '', descripcion: '', precio: '', moneda: '', disponible: true }
export const clienteVacio = { ci: '', nombre: '', apellidos: '', telefono: '', direccion: '' }
export const citaVacio = { cliente: '', servicio: '', fecha: '' }

export interface ModalResultado {
  tipo: 'exito' | 'error'
  titulo: string
  mensaje: string
}

export const LOGIN_STORAGE_KEY = 'clinica-sonrisa-admin-login'
export const USUARIO = 'alex'
export const CONTRASEÑA = '1234'

export const OPCIONES_MENU = [
  { id: 'dashboard', label: 'Dashboard', icono: 'home' },
  { id: 'servicios', label: 'Servicios', icono: 'servicios' },
  { id: 'clientes', label: 'Clientes', icono: 'clientes' },
  { id: 'citas', label: 'Citas', icono: 'citas' },
  { id: 'entrada', label: 'Productos Entrada', icono: 'entrada' },
  { id: 'stock', label: 'Stock', icono: 'stock' },
] as const

export const OPCIONES_SECUNDARIAS = [
  { id: 'configuracion', label: 'Configuración', icono: 'config' },
] as const

export type Seccion =
  | (typeof OPCIONES_MENU)[number]['id']
  | (typeof OPCIONES_SECUNDARIAS)[number]['id']

export function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.slice(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}