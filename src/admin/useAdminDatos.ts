import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getServicios,
  getMonedas,
  getClientes,
  getCitas,
  getDiasInhabilitados,
  createServicio,
  updateServicio,
  deleteServicio,
  createCliente,
  deleteCliente,
  crearCita,
  deleteCita,
  crearDiaInhabilitado,
  eliminarDiaInhabilitado,
} from '../api'
import type {
  CitaBackend,
  CitaNueva,
  ClienteBackend,
  ClienteNuevo,
  DiaInhabilitadoBackend,
  MonedaBackend,
  ServicioBackend,
} from '../api'
import type { Servicio } from '../types'
import { CONTRASEÑA, LOGIN_STORAGE_KEY, USUARIO } from './admin'
import type { ModalResultado, Seccion } from './admin'

export function useAdminDatos() {
  const [autenticado, setAutenticado] = useState(
    () => localStorage.getItem(LOGIN_STORAGE_KEY) === 'true',
  )
  const [seccion, setSeccion] = useState<Seccion>('dashboard')
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [serviciosBackend, setServiciosBackend] = useState<ServicioBackend[]>([])
  const [monedas, setMonedas] = useState<MonedaBackend[]>([])
  const [clientes, setClientes] = useState<ClienteBackend[]>([])
  const [citas, setCitas] = useState<CitaBackend[]>([])
  const [diasInhabilitados, setDiasInhabilitados] = useState<DiaInhabilitadoBackend[]>([])
  const [diaModal, setDiaModal] = useState<{ fecha: string; inhabilitado: boolean } | null>(null)
  const [guardandoDia, setGuardandoDia] = useState(false)
  const [datosCargados, setDatosCargados] = useState(false)
  const [cargandoDashboard, setCargandoDashboard] = useState(false)
  const [errorDashboard, setErrorDashboard] = useState('')
  const [revisionDashboard, setRevisionDashboard] = useState(0)
  const [modalConfig, setModalConfig] = useState<ModalResultado | null>(null)

  const fechasInhabilitadas = useMemo(
    () => new Set(diasInhabilitados.map((d) => d.fecha.slice(0, 10))),
    [diasInhabilitados],
  )

  const revisar = useCallback(() => setRevisionDashboard((prev) => prev + 1), [])

  useEffect(() => {
    if (!autenticado) return
    let activo = true

    async function cargarDatos() {
      try {
        const [serviciosData, monedasData, clientesData, citasData, diasData] =
          await Promise.all([
            getServicios(),
            getMonedas(),
            getClientes(),
            getCitas(),
            getDiasInhabilitados(),
          ])
        if (!activo) return
        const monedaPorId = new Map(monedasData.map((m) => [m._id, m.tipoMoneda]))
        setMonedas(monedasData)
        setServiciosBackend(serviciosData)
        setServicios(
          serviciosData.map((s) => ({
            id: s._id,
            nombre: s.nombreServicio,
            descripcion: s.descripcionServicio,
            precio: s.precioServicio,
            moneda: monedaPorId.get(s.monedaServicio) ?? '',
            disponible: s.disponible !== false,
          })),
        )
        setClientes(clientesData)
        setCitas(citasData)
        setDiasInhabilitados(diasData)
        setDatosCargados(true)
        setErrorDashboard('')
      } catch {
        if (activo) setErrorDashboard('No se pudo conectar con el backend.')
      } finally {
        if (activo) setCargandoDashboard(false)
      }
    }

    setCargandoDashboard(true)
    cargarDatos()
    const intervalo = setInterval(cargarDatos, 10000)

    return () => {
      activo = false
      clearInterval(intervalo)
    }
  }, [autenticado, revisionDashboard])

  const iniciarSesion = useCallback((usuario: string, contraseña: string): boolean => {
    if (usuario === USUARIO && contraseña === CONTRASEÑA) {
      localStorage.setItem(LOGIN_STORAGE_KEY, 'true')
      setAutenticado(true)
      return true
    }
    return false
  }, [])

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(LOGIN_STORAGE_KEY)
    setAutenticado(false)
    setSeccion('dashboard')
  }, [])

  const idMoneda = useCallback(
    (moneda: string) => monedas.find((m) => m.tipoMoneda === moneda)?._id,
    [monedas],
  )

  const agregarServicio = useCallback(
    async (s: Omit<Servicio, 'id'>) => {
      const monedaServicio = idMoneda(s.moneda)
      if (!monedaServicio) throw new Error('Moneda no válida')
      await createServicio({
        nombreServicio: s.nombre,
        descripcionServicio: s.descripcion,
        precioServicio: s.precio,
        monedaServicio,
        disponible: s.disponible,
      })
    },
    [idMoneda],
  )

  const modificarServicio = useCallback(
    async (s: Servicio) => {
      const monedaServicio = idMoneda(s.moneda)
      if (!monedaServicio) throw new Error('Moneda no válida')
      await updateServicio(s.id, {
        nombreServicio: s.nombre,
        descripcionServicio: s.descripcion,
        precioServicio: s.precio,
        monedaServicio,
        disponible: s.disponible,
      })
    },
    [idMoneda],
  )

  const eliminarServicio = useCallback(async (id: string) => {
    await deleteServicio(id)
  }, [])

  const registrarCliente = useCallback(async (datos: ClienteNuevo) => {
    await createCliente(datos)
  }, [])

  const eliminarCliente = useCallback(async (id: string) => {
    await deleteCliente(id)
  }, [])

  const registrarCita = useCallback(async (cita: CitaNueva) => {
    await crearCita(cita)
  }, [])

  const eliminarCita = useCallback(async (id: string) => {
    await deleteCita(id)
  }, [])

  const abrirModalDia = useCallback(
    (fecha: string) => {
      setDiaModal({ fecha, inhabilitado: fechasInhabilitadas.has(fecha) })
    },
    [fechasInhabilitadas],
  )

  const confirmarModalDia = useCallback(async () => {
    if (!diaModal) return
    setGuardandoDia(true)
    try {
      if (diaModal.inhabilitado) {
        const ids = diasInhabilitados
          .filter((d) => d.fecha.slice(0, 10) === diaModal.fecha)
          .map((d) => d._id)
        for (const id of ids) await eliminarDiaInhabilitado(id)
      } else {
        await crearDiaInhabilitado(diaModal.fecha)
      }
      const data = await getDiasInhabilitados()
      setDiasInhabilitados(data)
      setDiaModal(null)
    } catch {
      setModalConfig({
        tipo: 'error',
        titulo: 'No se pudo actualizar el día',
        mensaje: 'No se pudo conectar con el backend. Inténtalo de nuevo.',
      })
    } finally {
      setGuardandoDia(false)
    }
  }, [diaModal, diasInhabilitados])

  return {
    autenticado,
    iniciarSesion,
    cerrarSesion,
    seccion,
    setSeccion,
    servicios,
    serviciosBackend,
    monedas,
    clientes,
    citas,
    diasInhabilitados,
    fechasInhabilitadas,
    cargandoDashboard,
    errorDashboard,
    datosCargados,
    revisar,
    agregarServicio,
    modificarServicio,
    eliminarServicio,
    registrarCliente,
    eliminarCliente,
    registrarCita,
    eliminarCita,
    diaModal,
    guardandoDia,
    abrirModalDia,
    confirmarModalDia,
    setDiaModal,
    modalConfig,
    setModalConfig,
  }
}