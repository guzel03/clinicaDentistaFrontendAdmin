import { useState } from 'react'
import type { FormEvent } from 'react'
import type { MonedaBackend } from '../api'

export default function Nomenclador({
  monedas,
  cargando,
  datosCargados,
  onAgregarMoneda,
  onModificarMoneda,
  onEliminarMoneda,
  onRevision,
  onMostrarModal,
}: {
  monedas: MonedaBackend[]
  cargando: boolean
  datosCargados: boolean
  onAgregarMoneda: (nombre: string) => Promise<void>
  onModificarMoneda: (id: string, nombre: string) => Promise<void>
  onEliminarMoneda: (id: string) => Promise<void>
  onRevision: () => void
  onMostrarModal: (tipo: 'exito' | 'error', titulo: string, mensaje: string) => void
}) {
  const [form, setForm] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [monedaAEditar, setMonedaAEditar] = useState<MonedaBackend | null>(null)
  const [formEdit, setFormEdit] = useState('')
  const [monedaAEliminar, setMonedaAEliminar] = useState<MonedaBackend | null>(null)

  function cerrarFormulario() {
    setMostrarFormulario(false)
    setForm('')
  }

  async function manejarEnvio(e: FormEvent) {
    e.preventDefault()
    const nombre = form.trim()
    if (!nombre) return

    try {
      await onAgregarMoneda(nombre)
      setForm('')
      setMostrarFormulario(false)
      onRevision()
    } catch {
      onMostrarModal(
        'error',
        'Error al guardar',
        'No se pudo guardar la moneda. Verifica que el backend esté disponible.',
      )
    }
  }

  function abrirEditar(m: MonedaBackend) {
    setMonedaAEditar(m)
    setFormEdit(m.tipoMoneda)
  }

  async function guardarEdicion(e: FormEvent) {
    e.preventDefault()
    if (!monedaAEditar) return
    const nombre = formEdit.trim()
    if (!nombre) return

    try {
      await onModificarMoneda(monedaAEditar._id, nombre)
      setMonedaAEditar(null)
      onRevision()
    } catch {
      onMostrarModal(
        'error',
        'Error al guardar',
        'No se pudo modificar la moneda. Verifica que el backend esté disponible.',
      )
    }
  }

  function cancelar() {
    setMonedaAEditar(null)
    setFormEdit('')
  }

  async function eliminarMonedaClick(id: string) {
    try {
      await onEliminarMoneda(id)
      onRevision()
    } catch {
      onMostrarModal(
        'error',
        'Error al eliminar',
        'No se pudo eliminar la moneda. Verifica que el backend esté disponible.',
      )
    }
  }

  function confirmarEliminar() {
    if (!monedaAEliminar) return
    eliminarMonedaClick(monedaAEliminar._id)
    setMonedaAEliminar(null)
  }

  return (
    <div className="admin-seccion">
      <div className="admin-section-header">
        <div>
          <h2>Nomenclador</h2>
          <p className="page-subtitle">Administra las monedas que se usan en los servicios.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? 'Cerrar formulario' : '+ Agregar moneda'}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="modal-overlay" onClick={cerrarFormulario}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agregar moneda</h2>
              <button className="modal-close" onClick={cerrarFormulario} aria-label="Cerrar">
                ✕
              </button>
            </div>

            <form onSubmit={manejarEnvio}>
              <div className="campo">
                <label htmlFor="mon-tipo">Tipo de moneda</label>
                <input
                  id="mon-tipo"
                  type="text"
                  required
                  value={form}
                  onChange={(e) => setForm(e.target.value.toUpperCase())}
                  placeholder="Ej. SOL, USD, EUR, CUP"
                />
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  Agregar moneda
                </button>
                <button type="button" className="btn btn-outline" onClick={cerrarFormulario}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="lista-servicios">
        <h2>Monedas actuales</h2>
        {monedas.length === 0 ? (
          <p className="empty">
            {cargando && !datosCargados ? 'Cargando monedas...' : 'No hay monedas registradas.'}
          </p>
        ) : (
          <ul>
            {monedas.map((m) => (
              <li key={m._id} className="servicio-item">
                <div className="servicio-info">
                  <strong>{m.tipoMoneda}</strong>
                </div>
                <div className="servicio-acciones">
                  <button className="btn btn-small btn-outline" onClick={() => abrirEditar(m)}>
                    Editar
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => setMonedaAEliminar(m)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {monedaAEditar && (
        <div className="modal-overlay" onClick={cancelar}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modificar moneda</h2>
              <button className="modal-close" onClick={cancelar}>
                ✕
              </button>
            </div>

            <form onSubmit={guardarEdicion}>
              <div className="campo">
                <label htmlFor="edit-mon-tipo">Tipo de moneda</label>
                <input
                  id="edit-mon-tipo"
                  type="text"
                  required
                  value={formEdit}
                  onChange={(e) => setFormEdit(e.target.value.toUpperCase())}
                  placeholder="Ej. SOL, USD, EUR, CUP"
                />
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  Guardar cambios
                </button>
                <button type="button" className="btn btn-outline" onClick={cancelar}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {monedaAEliminar && (
        <div className="modal-overlay" onClick={() => setMonedaAEliminar(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Eliminar moneda</h2>
              <button
                className="modal-close"
                onClick={() => setMonedaAEliminar(null)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <p>
              ¿Estás seguro de que deseas borrar la moneda{' '}
              <strong>{monedaAEliminar.tipoMoneda}</strong>?
            </p>

            <div className="form-buttons">
              <button type="button" className="btn btn-danger" onClick={confirmarEliminar}>
                Sí, eliminar
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setMonedaAEliminar(null)}
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