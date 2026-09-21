import axios from 'axios'


const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'


export const api = axios.create({ baseURL: API_URL })


export interface ServicioBackend {
  _id: string
  nombreServicio: string
  descripcionServicio: string
  precioServicio: number
  monedaServicio: string
  disponible?: boolean
}


export interface ClienteBackend {
  _id: string
  ci: string
  nombre: string
  apellidos: string
  telefono: string
  direccion?: string
}


export interface CitaBackend {
  _id: string
  cliente: string
  servicio: string
  fecha: string
}


export interface HorarioBackend {
  days: string
  hours: string
}


export interface MonedaBackend {
  _id: string
  tipoMoneda: string
}


export interface ClienteNuevo {
  ci: string
  nombre: string
  apellidos: string
  telefono: string
  direccion?: string
}


export interface CitaNueva {
  cliente: string
  servicio: string
  fecha: string
}


export interface ConfiguracionBackend {
  _id?: string
  name: string
  address: string
  telephone: string
  email: string
  whatsapp: string
  whatsappUrl: string
  facebook: string
  instagram: string
  schedule: HorarioBackend[]
}


export interface ServicioNuevo {
  nombreServicio: string
  descripcionServicio: string
  precioServicio: number
  monedaServicio: string
  disponible?: boolean
}


export async function getServicios(): Promise<ServicioBackend[]> {
  const { data } = await api.get<ServicioBackend[]>('/servicios')
  return data
}


export async function getMonedas(): Promise<MonedaBackend[]> {
  const { data } = await api.get<MonedaBackend[]>('/moneda')
  return data
}

export interface MonedaNueva {
  tipoMoneda: string
}

export async function createMoneda(datos: MonedaNueva): Promise<MonedaBackend> {
  const { data } = await api.post<MonedaBackend>('/moneda', datos)
  return data
}

export async function updateMoneda(
  id: string,
  datos: Partial<MonedaNueva>,
): Promise<MonedaBackend> {
  const { data } = await api.patch<MonedaBackend>(`/moneda/${id}`, datos)
  return data
}

export async function deleteMoneda(id: string): Promise<void> {
  await api.delete(`/moneda/${id}`)
}


export async function getClientes(): Promise<ClienteBackend[]> {
  const { data } = await api.get<ClienteBackend[]>('/cliente')
  return data
}

export async function getClientePorCi(ci: string): Promise<ClienteBackend> {
  const { data } = await api.get<ClienteBackend>(
    `/cliente/ci/${encodeURIComponent(ci)}`,
  )
  return data
}

export async function createCliente(datos: {
  ci: string
  nombre: string
  apellidos: string
  telefono: string
  direccion?: string
}): Promise<ClienteBackend> {
  const { data } = await api.post<ClienteBackend>('/cliente', datos)
  return data
}


export async function getCitas(): Promise<CitaBackend[]> {
  const { data } = await api.get<CitaBackend[]>('/cita')
  return data
}


export async function crearCliente(cliente: ClienteNuevo): Promise<ClienteBackend> {
  const { data } = await api.post<ClienteBackend>('/cliente', cliente)
  return data
}


export async function updateCliente(
  id: string,
  datos: Partial<ClienteNuevo>,
): Promise<ClienteBackend> {
  const { data } = await api.patch<ClienteBackend>(`/cliente/${id}`, datos)
  return data
}


export async function crearCita(cita: CitaNueva): Promise<CitaBackend> {
  const { data } = await api.post<CitaBackend>('/cita', cita)
  return data
}


export interface DiaInhabilitadoBackend {
  _id: string
  fecha: string
}


export async function getDiasInhabilitados(): Promise<DiaInhabilitadoBackend[]> {
  const { data } = await api.get<DiaInhabilitadoBackend[]>('/dias-inhabilitados')
  return data
}


export async function crearDiaInhabilitado(fecha: string): Promise<DiaInhabilitadoBackend> {
  const { data } = await api.post<DiaInhabilitadoBackend>('/dias-inhabilitados', { fecha })
  return data
}


export async function eliminarDiaInhabilitado(id: string): Promise<void> {
  await api.delete(`/dias-inhabilitados/${id}`)
}


export async function getConfiguracion(): Promise<ConfiguracionBackend> {
  const { data } = await api.get<ConfiguracionBackend>('/configuracion')
  return data
}


export async function updateConfiguracion(
  config: Partial<ConfiguracionBackend>,
): Promise<ConfiguracionBackend> {
  const { data } = await api.patch<ConfiguracionBackend>('/configuracion', config)
  return data
}


export async function createServicio(datos: ServicioNuevo): Promise<ServicioBackend> {
  const { data } = await api.post<ServicioBackend>('/servicios', datos)
  return data
}


export async function updateServicio(
  id: string,
  datos: Partial<ServicioNuevo>,
): Promise<ServicioBackend> {
  const { data } = await api.patch<ServicioBackend>(`/servicios/${id}`, datos)
  return data
}


export async function deleteServicio(id: string): Promise<void> {
  await api.delete(`/servicios/${id}`)
}


export async function deleteCliente(id: string): Promise<void> {
  await api.delete(`/cliente/${id}`)
}


export async function deleteCita(id: string): Promise<void> {
  await api.delete(`/cita/${id}`)
}