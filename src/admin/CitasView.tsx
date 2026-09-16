import { useState } from 'react'
import type { FormEvent } from 'react'
import CalendarioCitas from '../components/CalendarioCitas'
import type { CitaBackend, CitaNueva, ClienteBackend, ServicioBackend } from '../api'
import { citaVacio, formatearFecha } from './admin'

export default function CitasView({
  clientes,
  serviciosBackend,
  citas,
  fechasInhabilitadas,
  cargando,
  datosCargados,
  onRegistrarCita,
  onEliminarCita,
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
  onRevision: () => void
  onMostrarModal: (tipo: 'exito' | 'error', titulo: string, mensaje: string) => void
}) {
  const [formCita, setFormCita] = useState(citaVacio)
  const [mostrarFormCita, setMostrarFormCita] = useState(false)
  const [guardandoCita, setGuardandoCita] = useState(false)
  const [citaAEliminar, setCitaAEliminar] = useState<CitaBackend | null>(null)

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

  const clientePorId = new Map(clientes.map((c) => [c._id, `${c.nombre} ${c.apellidos}`]))
  const servicioPorId = new Map(serviciosBackend.map((s) => [s._id, s.nombreServicio]))

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
                  onSeleccionarDia={(fecha) => setFormCita({ ...formCita, fecha })}
                />
                <p className="campo-ayuda">
                  Los días en rojo están inhabilitados.{' '}
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
              citas.map((cita) => (
                <tr key={cita._id}>
                  <td>{clientePorId.get(cita.cliente) ?? cita.cliente}</td>
                  <td>
                    {servicioPorId.has(cita.servicio) ? (
                      servicioPorId.get(cita.servicio)
                    ) : (
                      <span className="servicio-eliminado">Servicio eliminado</span>
                    )}
                  </td>
                  <td>{formatearFecha(cita.fecha)}</td>
                  <td>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => setCitaAEliminar(cita)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
    </div>
  )
}