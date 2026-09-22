import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ClienteBackend, ClienteNuevo } from '../api'
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

export default function ClientesView({
  clientes,
  cargando,
  datosCargados,
  onRegistrarCliente,
  onEliminarCliente,
  onRevision,
  onMostrarModal,
}: {
  clientes: ClienteBackend[]
  cargando: boolean
  datosCargados: boolean
  onRegistrarCliente: (datos: ClienteNuevo) => Promise<void>
  onEliminarCliente: (id: string) => Promise<void>
  onRevision: () => void
  onMostrarModal: (tipo: 'exito' | 'error', titulo: string, mensaje: string) => void
}) {
  const [formCliente, setFormCliente] = useState(clienteVacio)
  const [mostrarFormCliente, setMostrarFormCliente] = useState(false)
  const [guardandoCliente, setGuardandoCliente] = useState(false)
  const [erroresCliente, setErroresCliente] = useState<Record<string, string>>({})
  const [clienteAEliminar, setClienteAEliminar] = useState<ClienteBackend | null>(null)

  function cerrarFormCliente() {
    setMostrarFormCliente(false)
    setFormCliente(clienteVacio)
    setErroresCliente({})
  }

  async function manejarCrearCliente(e: FormEvent) {
    e.preventDefault()
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
      await onRegistrarCliente({
        ci: formCliente.ci.trim(),
        nombre: formCliente.nombre.trim(),
        apellidos: formCliente.apellidos.trim(),
        telefono: formCliente.telefono.trim(),
        edad: Number(formCliente.edad),
        direccion: formCliente.direccion.trim() || undefined,
      })
      setFormCliente(clienteVacio)
      setMostrarFormCliente(false)
      onRevision()
    } catch {
      onMostrarModal(
        'error',
        'Error al guardar',
        'No se pudo registrar el cliente. Verifica que el backend esté disponible.',
      )
    } finally {
      setGuardandoCliente(false)
    }
  }

  async function confirmarEliminarCliente() {
    if (!clienteAEliminar) return
    try {
      await onEliminarCliente(clienteAEliminar._id)
      setClienteAEliminar(null)
      onRevision()
    } catch {
      onMostrarModal(
        'error',
        'Error al eliminar',
        'No se pudo eliminar el cliente. Verifica que el backend esté disponible.',
      )
    }
  }

  return (
    <div className="admin-seccion">
      <div className="admin-section-header">
        <div>
          <h2>Clientes</h2>
          <p className="page-subtitle">Administra los clientes registrados en la clínica.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setMostrarFormCliente(!mostrarFormCliente)}
        >
          {mostrarFormCliente ? 'Cerrar formulario' : '+ Agregar cliente'}
        </button>
      </div>

      {mostrarFormCliente && (
        <div className="modal-overlay" onClick={cerrarFormCliente}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agregar cliente</h2>
              <button className="modal-close" onClick={cerrarFormCliente} aria-label="Cerrar">
                ✕
              </button>
            </div>

            <form onSubmit={manejarCrearCliente}>
              <div className="campo">
                <label htmlFor="ac-ci">Carné de identidad</label>
                <input
                  id="ac-ci"
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
                  <label htmlFor="ac-nombre">Nombre</label>
                  <input
                    id="ac-nombre"
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
                  <label htmlFor="ac-apellidos">Apellidos</label>
                  <input
                    id="ac-apellidos"
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
                  <label htmlFor="ac-telefono">Teléfono</label>
                  <input
                    id="ac-telefono"
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
                  <label htmlFor="ac-edad">Edad</label>
                  <input
                    id="ac-edad"
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
                <label htmlFor="ac-direccion">Dirección</label>
                <input
                  id="ac-direccion"
                  type="text"
                  value={formCliente.direccion}
                  onChange={(e) => setFormCliente({ ...formCliente, direccion: e.target.value })}
                  placeholder="Ej. Av. Los Olivos 123"
                />
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-primary" disabled={guardandoCliente}>
                  {guardandoCliente ? 'Guardando...' : 'Agregar cliente'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={guardandoCliente}
                  onClick={cerrarFormCliente}
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
              <th>CI</th>
              <th>Cliente</th>
              <th>Edad</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td className="table-empty" colSpan={6}>
                  {cargando && !datosCargados ? 'Cargando clientes...' : 'No hay clientes registrados.'}
                </td>
              </tr>
            ) : (
              clientes.map((c) => (
                <tr key={c._id}>
                  <td>{c.ci}</td>
                  <td>
                    {c.nombre} {c.apellidos}
                  </td>
                  <td>{c.edad ?? '—'}</td>
                  <td>{c.telefono}</td>
                  <td>{c.direccion || '—'}</td>
                  <td>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => setClienteAEliminar(c)}
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

      {clienteAEliminar && (
        <div className="modal-overlay" onClick={() => setClienteAEliminar(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Eliminar cliente</h2>
              <button
                className="modal-close"
                onClick={() => setClienteAEliminar(null)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <p>
              ¿Estás seguro de que deseas borrar el cliente{' '}
              <strong>
                {clienteAEliminar.nombre} {clienteAEliminar.apellidos}
              </strong>{' '}
              (CI {clienteAEliminar.ci})?
            </p>

            <div className="form-buttons">
              <button type="button" className="btn btn-danger" onClick={confirmarEliminarCliente}>
                Sí, eliminar
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setClienteAEliminar(null)}
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