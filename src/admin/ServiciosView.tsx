import { useState } from 'react'
import type { FormEvent } from 'react'
import type { MonedaBackend } from '../api'
import type { Servicio } from '../types'
import { formVacio } from './admin'

export default function ServiciosView({
  servicios,
  monedas,
  cargando,
  datosCargados,
  onAgregarServicio,
  onModificarServicio,
  onEliminarServicio,
  onRevision,
  onMostrarModal,
}: {
  servicios: Servicio[]
  monedas: MonedaBackend[]
  cargando: boolean
  datosCargados: boolean
  onAgregarServicio: (s: Omit<Servicio, 'id'>) => Promise<void>
  onModificarServicio: (s: Servicio) => Promise<void>
  onEliminarServicio: (id: string) => Promise<void>
  onRevision: () => void
  onMostrarModal: (tipo: 'exito' | 'error', titulo: string, mensaje: string) => void
}) {
  const [form, setForm] = useState(formVacio)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editando, setEditando] = useState<Servicio | null>(null)
  const [servicioAEliminar, setServicioAEliminar] = useState<Servicio | null>(null)
  const [formEdit, setFormEdit] = useState(formVacio)
  const POR_PAGINA = 8
  const [pagina, setPagina] = useState(0)
  const totalPaginas = Math.max(1, Math.ceil(servicios.length / POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas - 1)
  const inicio = paginaSegura * POR_PAGINA
  const serviciosVisibles = servicios.slice(inicio, inicio + POR_PAGINA)

  function cerrarFormulario() {
    setMostrarFormulario(false)
    setForm(formVacio)
  }

  async function manejarEnvio(e: FormEvent) {
    e.preventDefault()
    const precio = Number(form.precio)
    if (!form.nombre || Number.isNaN(precio) || precio < 0) return

    try {
      await onAgregarServicio({
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio,
        moneda: form.moneda || monedas[0]?.tipoMoneda || '',
        disponible: form.disponible,
      })
      setForm(formVacio)
      setMostrarFormulario(false)
      onRevision()
    } catch {
      onMostrarModal(
        'error',
        'Error al guardar',
        'No se pudo guardar el servicio. Verifica que el backend esté disponible.',
      )
    }
  }

  function abrirEditar(s: Servicio) {
    setEditando(s)
    setFormEdit({
      nombre: s.nombre,
      descripcion: s.descripcion,
      precio: String(s.precio),
      moneda: s.moneda,
      disponible: s.disponible,
    })
  }

  async function guardarEdicion(e: FormEvent) {
    e.preventDefault()
    if (!editando) return
    const precio = Number(formEdit.precio)
    if (!formEdit.nombre || Number.isNaN(precio) || precio < 0) return

    try {
      await onModificarServicio({
        ...editando,
        nombre: formEdit.nombre,
        descripcion: formEdit.descripcion,
        precio,
        moneda: formEdit.moneda,
        disponible: formEdit.disponible,
      })
      setEditando(null)
      setFormEdit(formVacio)
      onRevision()
    } catch {
      onMostrarModal(
        'error',
        'Error al guardar',
        'No se pudo modificar el servicio. Verifica que el backend esté disponible.',
      )
    }
  }

  async function eliminarServicioClick(id: string) {
    try {
      await onEliminarServicio(id)
      onRevision()
    } catch {
      onMostrarModal(
        'error',
        'Error al eliminar',
        'No se pudo eliminar el servicio. Verifica que el backend esté disponible.',
      )
    }
  }

  function cancelar() {
    setEditando(null)
    setFormEdit(formVacio)
  }

  function confirmarEliminarServicio() {
    if (!servicioAEliminar) return
    eliminarServicioClick(servicioAEliminar.id)
    setServicioAEliminar(null)
  }

  return (
    <div className="admin-seccion">
      <div className="admin-section-header">
        <div>
          <h2>Servicios</h2>
          <p className="page-subtitle">Administra los servicios que se muestran en la vista de servicios.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          {mostrarFormulario ? 'Cerrar formulario' : '+ Agregar servicio'}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="modal-overlay" onClick={cerrarFormulario}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agregar servicio</h2>
              <button className="modal-close" onClick={cerrarFormulario} aria-label="Cerrar">
                ✕
              </button>
            </div>

            <form onSubmit={manejarEnvio}>
              <div className="campo">
                <label htmlFor="s-nombre">Nombre del servicio</label>
                <input
                  id="s-nombre"
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej. Blanqueamiento dental"
                />
              </div>

              <div className="campo">
                <label htmlFor="s-desc">Descripción</label>
                <textarea
                  id="s-desc"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Breve descripción del servicio"
                />
              </div>

              <div className="campo-row">
                <div className="campo">
                  <label htmlFor="s-precio">Precio</label>
                  <input
                    id="s-precio"
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    placeholder="20"
                  />
                </div>
                <div className="campo">
                  <label htmlFor="s-moneda">Moneda</label>
                  <select
                    id="s-moneda"
                    value={form.moneda || monedas[0]?.tipoMoneda || ''}
                    onChange={(e) => setForm({ ...form, moneda: e.target.value })}
                  >
                    {monedas.length === 0 ? (
                      <option value="" disabled>
                        No hay monedas registradas
                      </option>
                    ) : (
                      monedas.map((m) => (
                        <option key={m._id} value={m.tipoMoneda}>
                          {m.tipoMoneda}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="campo">
                <label htmlFor="s-disponible">Disponibilidad</label>
                <select
                  id="s-disponible"
                  value={form.disponible ? '1' : '0'}
                  onChange={(e) => setForm({ ...form, disponible: e.target.value === '1' })}
                >
                  <option value="1">Disponible</option>
                  <option value="0">No disponible</option>
                </select>
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  Agregar servicio
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
        <h2>Servicios actuales</h2>
        {servicios.length === 0 ? (
          <p className="empty">
            {cargando && !datosCargados ? 'Cargando servicios...' : 'No hay servicios registrados.'}
          </p>
        ) : (
          <ul>
            {serviciosVisibles.map((s) => (
              <li key={s.id} className="servicio-item">
                <div className="servicio-info">
                  <strong>{s.nombre}</strong>
                  <span className="servicio-desc">{s.descripcion}</span>
                  <span className="precio">
                    {s.moneda} {s.precio}
                  </span>
                  <span
                    className={`estado-servicio ${s.disponible ? 'disponible' : 'no-disponible'}`}
                  >
                    {s.disponible ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
                <div className="servicio-acciones">
                  <button className="btn btn-small btn-outline" onClick={() => abrirEditar(s)}>
                    Editar
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => setServicioAEliminar(s)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {servicios.length > POR_PAGINA && (
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
              {inicio + 1}–{Math.min(inicio + POR_PAGINA, servicios.length)} de {servicios.length}
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
      </div>

      {editando && (
        <div className="modal-overlay" onClick={cancelar}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modificar servicio</h2>
              <button className="modal-close" onClick={cancelar}>
                ✕
              </button>
            </div>

            <form onSubmit={guardarEdicion}>
              <div className="campo">
                <label htmlFor="edit-nombre">Nombre del servicio</label>
                <input
                  id="edit-nombre"
                  type="text"
                  required
                  value={formEdit.nombre}
                  onChange={(e) => setFormEdit({ ...formEdit, nombre: e.target.value })}
                  placeholder="Ej. Blanqueamiento dental"
                />
              </div>

              <div className="campo">
                <label htmlFor="edit-desc">Descripción</label>
                <textarea
                  id="edit-desc"
                  value={formEdit.descripcion}
                  onChange={(e) => setFormEdit({ ...formEdit, descripcion: e.target.value })}
                  placeholder="Breve descripción del servicio"
                />
              </div>

              <div className="campo-row">
                <div className="campo">
                  <label htmlFor="edit-precio">Precio</label>
                  <input
                    id="edit-precio"
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={formEdit.precio}
                    onChange={(e) => setFormEdit({ ...formEdit, precio: e.target.value })}
                    placeholder="20"
                  />
                </div>
                <div className="campo">
                  <label htmlFor="edit-moneda">Moneda</label>
                  <select
                    id="edit-moneda"
                    value={
                      monedas.some((m) => m.tipoMoneda === formEdit.moneda)
                        ? formEdit.moneda
                        : monedas[0]?.tipoMoneda || ''
                    }
                    onChange={(e) => setFormEdit({ ...formEdit, moneda: e.target.value })}
                  >
                    {monedas.length === 0 ? (
                      <option value="" disabled>
                        No hay monedas registradas
                      </option>
                    ) : (
                      monedas.map((m) => (
                        <option key={m._id} value={m.tipoMoneda}>
                          {m.tipoMoneda}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="campo">
                <label htmlFor="edit-disponible">Disponibilidad</label>
                <select
                  id="edit-disponible"
                  value={formEdit.disponible ? '1' : '0'}
                  onChange={(e) => setFormEdit({ ...formEdit, disponible: e.target.value === '1' })}
                >
                  <option value="1">Disponible</option>
                  <option value="0">No disponible</option>
                </select>
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

      {servicioAEliminar && (
        <div className="modal-overlay" onClick={() => setServicioAEliminar(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Eliminar servicio</h2>
              <button
                className="modal-close"
                onClick={() => setServicioAEliminar(null)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <p>
              ¿Estás seguro de que deseas borrar el servicio{' '}
              <strong>{servicioAEliminar.nombre}</strong>?
            </p>

            <div className="form-buttons">
              <button type="button" className="btn btn-danger" onClick={confirmarEliminarServicio}>
                Sí, eliminar
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setServicioAEliminar(null)}
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