import { useState } from 'react'
import type { FormEvent } from 'react'
import CalendarioCitas from '../components/CalendarioCitas'
import type { CitaBackend, CitaNueva, ClienteBackend, ClienteNuevo, ServicioBackend } from '../api'
import { citaVacio, formatearFecha } from './admin'
import { useContacto } from '../contactConfig'
import {
  ciValido,
  soloLetras,
  soloNumeros,
  telefonoValido,
  soloLetrasInput,
  soloTelefonoInput,
  soloNumerosInput,
  ciInput,
} from '../validaciones'
import { clienteVacio } from './admin'

export default function CitasView({
  clientes,
  serviciosBackend,
  citas,
  fechasInhabilitadas,
  cargando,
  datosCargados,
  onRegistrarCita,
  onEliminarCita,
  onModificarCliente,
  onRevision,
  onMostrarModal,
}: {
  clientes: ClienteBackend[]
  serviciosBackend: ServicioBackend[]
  citas: CitaBackend[]
  fechasInhabilitadas: Set<string>
  cargando: boolean
  datosCargados: boolean
  onRegistrarCita: (cita: CitaNueva) => Promise<void>
  onEliminarCita: (id: string) => Promise<void>
  onModificarCliente: (id: string, datos: Partial<ClienteNuevo>) => Promise<void>
  onRevision: () => void
  onMostrarModal: (tipo: 'exito' | 'error', titulo: string, mensaje: string) => void
}) {
  const { contacto } = useContacto()
  const [formCita, setFormCita] = useState(citaVacio)
  const [mostrarFormCita, setMostrarFormCita] = useState(false)
  const [guardandoCita, setGuardandoCita] = useState(false)
  const [citaAEliminar, setCitaAEliminar] = useState<CitaBackend | null>(null)
  const [clienteAEditar, setClienteAEditar] = useState<ClienteBackend | null>(null)
  const [formCliente, setFormCliente] = useState(clienteVacio)
  const [guardandoCliente, setGuardandoCliente] = useState(false)
  const [erroresCliente, setErroresCliente] = useState<Record<string, string>>({})

  const POR_PAGINA = 8
  const [pagina, setPagina] = useState(0)
  const totalPaginas = Math.max(1, Math.ceil(citas.length / POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas - 1)
  const inicio = paginaSegura * POR_PAGINA
  const citasVisibles = citas.slice(inicio, inicio + POR_PAGINA)

  function cerrarFormCita() {
    setMostrarFormCita(false)
    setFormCita(citaVacio)
  }

  async function manejarCrearCita(e: FormEvent) {
    e.preventDefault()
    if (!formCita.cliente || !formCita.servicio || !formCita.fecha) return

    setGuardandoCita(true)
    try {
      await onRegistrarCita({
        cliente: formCita.cliente,
        servicio: formCita.servicio,
        fecha: formCita.fecha,
      })
      setFormCita(citaVacio)
      setMostrarFormCita(false)
      onRevision()
    } catch {
      onMostrarModal(
        'error',
        'Error al guardar',
        'No se pudo registrar la cita. Verifica el backend y que el cliente no tenga otra cita en esa fecha.',
      )
    } finally {
      setGuardandoCita(false)
    }
  }

  async function confirmarEliminarCita() {
    if (!citaAEliminar) return
    try {
      await onEliminarCita(citaAEliminar._id)
      setCitaAEliminar(null)
      onRevision()
    } catch {
      onMostrarModal(
        'error',
        'Error al eliminar',
        'No se pudo eliminar la cita. Verifica que el backend esté disponible.',
      )
    }
  }

  function abrirEditarCliente(cliente: ClienteBackend) {
    setClienteAEditar(cliente)
    setFormCliente({
      ci: cliente.ci,
      nombre: cliente.nombre,
      apellidos: cliente.apellidos,
      telefono: cliente.telefono,
      edad: String(cliente.edad ?? ''),
      direccion: cliente.direccion ?? '',
    })
    setErroresCliente({})
  }

  function cerrarEditarCliente() {
    setClienteAEditar(null)
    setFormCliente(clienteVacio)
    setErroresCliente({})
  }

  async function manejarGuardarCliente(e: FormEvent) {
    e.preventDefault()
    if (!clienteAEditar) return

    const erroresLocal: Record<string, string> = {}
    if (!ciValido(formCliente.ci))
      erroresLocal.ci =
        'El CI debe tener 11 dígitos y una fecha de nacimiento válida (mes 01-12 y día válido)'
    if (!soloLetras(formCliente.nombre)) erroresLocal.nombre = 'El nombre solo puede contener letras'
    if (!soloLetras(formCliente.apellidos))
      erroresLocal.apellidos = 'Los apellidos solo pueden contener letras'
    if (!telefonoValido(formCliente.telefono))
      erroresLocal.telefono = 'El teléfono solo puede contener números, espacios o +'
    if (!soloNumeros(formCliente.edad) || Number(formCliente.edad) < 1 || Number(formCliente.edad) > 120)
      erroresLocal.edad = 'La edad debe ser un número entre 1 y 120'
    setErroresCliente(erroresLocal)
    if (Object.keys(erroresLocal).length > 0) return

    setGuardandoCliente(true)
    try {
      await onModificarCliente(clienteAEditar._id, {
        ci: formCliente.ci.trim(),
        nombre: formCliente.nombre.trim(),
        apellidos: formCliente.apellidos.trim(),
        telefono: formCliente.telefono.trim(),
        edad: Number(formCliente.edad),
        direccion: formCliente.direccion.trim() || undefined,
      })
      cerrarEditarCliente()
      onRevision()
      onMostrarModal('exito', 'Cliente actualizado', 'Los datos del cliente se guardaron correctamente.')
    } catch {
      onMostrarModal(
        'error',
        'Error al guardar',
        'No se pudo modificar el cliente. Verifica el backend y que el CI no esté en uso.',
      )
    } finally {
      setGuardandoCliente(false)
    }
  }

  const clientePorId = new Map(clientes.map((c) => [c._id, `${c.nombre} ${c.apellidos}`]))
  const clientePorObjeto = new Map(clientes.map((c) => [c._id, c]))
  const servicioPorId = new Map(serviciosBackend.map((s) => [s._id, s.nombreServicio]))

  const citasPorDia = new Map<string, number>()
  for (const cita of citas) {
    const fecha = cita.fecha.slice(0, 10)
    citasPorDia.set(fecha, (citasPorDia.get(fecha) ?? 0) + 1)
  }

  return (
    <div className="admin-seccion">
      <div className="admin-section-header">
        <div>
          <h2>Citas</h2>
          <p className="page-subtitle">Administra las citas agendadas en la clínica.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setMostrarFormCita(!mostrarFormCita)}>
          {mostrarFormCita ? 'Cerrar formulario' : '+ Agregar cita'}
        </button>
      </div>

      {mostrarFormCita && (
        <div className="modal-overlay" onClick={cerrarFormCita}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agregar cita</h2>
              <button className="modal-close" onClick={cerrarFormCita} aria-label="Cerrar">
                ✕
              </button>
            </div>

            <form onSubmit={manejarCrearCita}>
              <div className="campo">
                <label htmlFor="cita-cliente">Cliente</label>
                <select
                  id="cita-cliente"
                  required
                  value={formCita.cliente}
                  onChange={(e) => setFormCita({ ...formCita, cliente: e.target.value })}
                >
                  <option value="" disabled>
                    {clientes.length === 0 ? 'No hay clientes registrados' : 'Selecciona un cliente'}
                  </option>
                  {clientes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.ci} – {c.nombre} {c.apellidos}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label htmlFor="cita-servicio">Servicio</label>
                <select
                  id="cita-servicio"
                  required
                  value={formCita.servicio}
                  onChange={(e) => setFormCita({ ...formCita, servicio: e.target.value })}
                >
                  <option value="" disabled>
                    {serviciosBackend.length === 0
                      ? 'No hay servicios registrados'
                      : 'Selecciona un servicio'}
                  </option>
                  {serviciosBackend.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.nombreServicio}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <span className="campo-label">Fecha</span>
                <CalendarioCitas
                  fechasInhabilitadas={fechasInhabilitadas}
                  fechaSeleccionada={formCita.fecha}
                  bloquearInhabilitados
                  bloquearPasados
                  citasPorDia={citasPorDia}
                  maxCitasPorDia={contacto.maxCitasPorDia}
                  onSeleccionarDia={(fecha) => setFormCita({ ...formCita, fecha })}
                />
                <p className="campo-ayuda">
                  Los días en rojo están inhabilitados y los verdes están al máximo de cupos.{' '}
                  {formCita.fecha
                    ? `Fecha seleccionada: ${formCita.fecha}`
                    : 'Selecciona un día del calendario.'}
                </p>
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-primary" disabled={guardandoCita}>
                  {guardandoCita ? 'Guardando...' : 'Agregar cita'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={guardandoCita}
                  onClick={cerrarFormCita}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="orders-table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citas.length === 0 ? (
              <tr>
                <td className="table-empty" colSpan={4}>
                  {cargando && !datosCargados ? 'Cargando citas...' : 'No hay citas registradas.'}
                </td>
              </tr>
            ) : (
              citasVisibles.map((cita) => (
                <tr key={cita._id}>
                  <td>
                  {clientePorId.has(cita.cliente) ? (
                    clientePorId.get(cita.cliente)
                  ) : (
                    <span className="servicio-eliminado">Cliente no disponible</span>
                  )}
                </td>
                  <td>
                    {servicioPorId.has(cita.servicio) ? (
                      servicioPorId.get(cita.servicio)
                    ) : (
                      <span className="servicio-eliminado">Servicio eliminado</span>
                    )}
                  </td>
                  <td>{formatearFecha(cita.fecha)}</td>
                  <td>
                    <div className="servicio-acciones">
                      {clientePorObjeto.get(cita.cliente) && (
                        <button
                          className="btn btn-small btn-outline"
                          onClick={() => abrirEditarCliente(clientePorObjeto.get(cita.cliente)!)}
                          title="Editar los datos del cliente"
                        >
                          Editar
                        </button>
                      )}
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => setCitaAEliminar(cita)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {citas.length > POR_PAGINA && (
        <div className="grafico-paginacion">
          <button
            type="button"
            className="btn btn-small btn-outline"
            disabled={paginaSegura === 0}
            onClick={() => setPagina((p) => Math.max(0, p - 1))}
            aria-label="Anterior"
          >
            ←
          </button>
          <span className="grafico-pagina-info">
            {inicio + 1}–{Math.min(inicio + POR_PAGINA, citas.length)} de {citas.length}
          </span>
          <button
            type="button"
            className="btn btn-small btn-outline"
            disabled={paginaSegura >= totalPaginas - 1}
            onClick={() => setPagina((p) => p + 1)}
            aria-label="Siguiente"
          >
            →
          </button>
        </div>
      )}

      {citaAEliminar && (
        <div className="modal-overlay" onClick={() => setCitaAEliminar(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Eliminar cita</h2>
              <button
                className="modal-close"
                onClick={() => setCitaAEliminar(null)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <p>
              ¿Estás seguro de que deseas borrar la cita del{' '}
              <strong>{clientePorId.get(citaAEliminar.cliente) ?? citaAEliminar.cliente}</strong> del
              día <strong>{formatearFecha(citaAEliminar.fecha)}</strong>?
            </p>

            <div className="form-buttons">
              <button type="button" className="btn btn-danger" onClick={confirmarEliminarCita}>
                Sí, eliminar
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setCitaAEliminar(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {clienteAEditar && (
        <div className="modal-overlay" onClick={cerrarEditarCliente}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar cliente</h2>
              <button
                className="modal-close"
                onClick={cerrarEditarCliente}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <form onSubmit={manejarGuardarCliente}>
              <div className="campo">
                <label htmlFor="editc-ci">Carné de identidad</label>
                <input
                  id="editc-ci"
                  type="text"
                  inputMode="numeric"
                  required
                  value={formCliente.ci}
                  onChange={(e) => setFormCliente({ ...formCliente, ci: ciInput(e.target.value) })}
                  placeholder="Ej. 92051234785"
                  className={erroresCliente.ci ? 'input-error' : ''}
                />
                {erroresCliente.ci && <p className="campo-error">{erroresCliente.ci}</p>}
              </div>

              <div className="campo-row">
                <div className="campo">
                  <label htmlFor="editc-nombre">Nombre</label>
                  <input
                    id="editc-nombre"
                    type="text"
                    required
                    value={formCliente.nombre}
                    onChange={(e) =>
                      setFormCliente({ ...formCliente, nombre: soloLetrasInput(e.target.value) })
                    }
                    placeholder="Ej. Juan"
                    className={erroresCliente.nombre ? 'input-error' : ''}
                  />
                  {erroresCliente.nombre && <p className="campo-error">{erroresCliente.nombre}</p>}
                </div>
                <div className="campo">
                  <label htmlFor="editc-apellidos">Apellidos</label>
                  <input
                    id="editc-apellidos"
                    type="text"
                    required
                    value={formCliente.apellidos}
                    onChange={(e) =>
                      setFormCliente({ ...formCliente, apellidos: soloLetrasInput(e.target.value) })
                    }
                    placeholder="Ej. Pérez Gómez"
                    className={erroresCliente.apellidos ? 'input-error' : ''}
                  />
                  {erroresCliente.apellidos && (
                    <p className="campo-error">{erroresCliente.apellidos}</p>
                  )}
                </div>
              </div>

              <div className="campo-row">
                <div className="campo">
                  <label htmlFor="editc-telefono">Teléfono</label>
                  <input
                    id="editc-telefono"
                    type="text"
                    inputMode="tel"
                    required
                    value={formCliente.telefono}
                    onChange={(e) =>
                      setFormCliente({ ...formCliente, telefono: soloTelefonoInput(e.target.value) })
                    }
                    placeholder="Ej. +51 999 888 777"
                    className={erroresCliente.telefono ? 'input-error' : ''}
                  />
                  {erroresCliente.telefono && (
                    <p className="campo-error">{erroresCliente.telefono}</p>
                  )}
                </div>
                <div className="campo">
                  <label htmlFor="editc-edad">Edad</label>
                  <input
                    id="editc-edad"
                    type="text"
                    inputMode="numeric"
                    required
                    value={formCliente.edad}
                    onChange={(e) =>
                      setFormCliente({ ...formCliente, edad: soloNumerosInput(e.target.value) })
                    }
                    placeholder="Ej. 32"
                    className={erroresCliente.edad ? 'input-error' : ''}
                  />
                  {erroresCliente.edad && <p className="campo-error">{erroresCliente.edad}</p>}
                </div>
              </div>

              <div className="campo">
                <label htmlFor="editc-direccion">Dirección</label>
                <input
                  id="editc-direccion"
                  type="text"
                  value={formCliente.direccion}
                  onChange={(e) => setFormCliente({ ...formCliente, direccion: e.target.value })}
                  placeholder="Ej. Av. Los Olivos 123"
                />
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-primary" disabled={guardandoCliente}>
                  {guardandoCliente ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={guardandoCliente}
                  onClick={cerrarEditarCliente}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}