import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useContacto, VALORES_INICIALES } from '../contactConfig'
import type { ContactoConfig, HorarioItem } from '../contactConfig'

export default function ConfiguracionView({
  onMostrarModal,
}: {
  onMostrarModal: (tipo: 'exito' | 'error', titulo: string, mensaje: string) => void
}) {
  const { contacto, actualizarContacto, restablecerContacto } = useContacto()
  const [formContacto, setFormContacto] = useState<ContactoConfig>(contacto)
  const [editandoConfig, setEditandoConfig] = useState(false)
  const [guardandoConfig, setGuardandoConfig] = useState(false)

  useEffect(() => {
    if (!editandoConfig) setFormContacto(contacto)
  }, [contacto, editandoConfig])

  function cambiarCampoContacto(campo: keyof ContactoConfig, valor: string) {
    setEditandoConfig(true)
    setFormContacto((prev) => ({ ...prev, [campo]: valor }))
  }

  function cambiarMaxCitas(valor: string) {
    let numero = Math.floor(Number(valor))
    if (isNaN(numero) || numero < 1) numero = 1
    setEditandoConfig(true)
    setFormContacto((prev) => ({ ...prev, maxCitasPorDia: numero }))
  }

  function cambiarHorario(index: number, campo: keyof HorarioItem, valor: string) {
    setEditandoConfig(true)
    setFormContacto((prev) => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)),
    }))
  }

  function agregarHorario() {
    setEditandoConfig(true)
    setFormContacto((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { days: '', hours: '' }],
    }))
  }

  function eliminarHorario(index: number) {
    setEditandoConfig(true)
    setFormContacto((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
    }))
  }

  async function guardarContacto(e: FormEvent) {
    e.preventDefault()
    const horarioLimpio = formContacto.schedule
      .map((item) => ({ days: item.days.trim(), hours: item.hours.trim() }))
      .filter((item) => item.days || item.hours)
    setGuardandoConfig(true)
    const exito = await actualizarContacto({ ...formContacto, schedule: horarioLimpio })
    setGuardandoConfig(false)
    if (exito) {
      setEditandoConfig(false)
      onMostrarModal('exito', 'Cambios guardados', 'La configuración se guardó correctamente.')
    } else {
      onMostrarModal('error', 'Error al guardar', 'No se pudo conectar con el backend. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="admin-seccion admin-config-seccion">
      <h2>Configuración</h2>
      <p className="page-subtitle">
        Modifica la información que se muestra en Contáctenos. Los cambios se guardan y se aplican en
        todo el sitio.
      </p>

      {guardandoConfig && <div className="success-box">Guardando cambios...</div>}

      <form className="servicio-form admin-config-form" onSubmit={guardarContacto}>
        <div className="campo">
          <label htmlFor="c-nombre">Nombre de la clínica</label>
          <input
            id="c-nombre"
            type="text"
            value={formContacto.name}
            onChange={(e) => cambiarCampoContacto('name', e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="c-direccion">Dirección</label>
          <input
            id="c-direccion"
            type="text"
            value={formContacto.address}
            onChange={(e) => cambiarCampoContacto('address', e.target.value)}
            placeholder="Ej. Av. Principal #123, Sector El Centro, Ciudad"
          />
        </div>

        <div className="campo-row">
          <div className="campo">
            <label htmlFor="c-telefono">Teléfono</label>
            <input
              id="c-telefono"
              type="text"
              value={formContacto.telephone}
              onChange={(e) => cambiarCampoContacto('telephone', e.target.value)}
              placeholder="Ej. +53 55912936"
            />
          </div>
          <div className="campo">
            <label htmlFor="c-correo">Correo electrónico</label>
            <input
              id="c-correo"
              type="email"
              value={formContacto.email}
              onChange={(e) => cambiarCampoContacto('email', e.target.value)}
              placeholder="Ej. contacto@clinica.com"
            />
          </div>
        </div>

        <div className="campo">
          <label htmlFor="c-whatsapp">Número de WhatsApp</label>
          <input
            id="c-whatsapp"
            type="text"
            value={formContacto.whatsapp}
            onChange={(e) => cambiarCampoContacto('whatsapp', e.target.value)}
            placeholder="Ej. 55912936 (solo número)"
          />
        </div>

        <div className="campo">
          <label htmlFor="c-whatsapp-url">Link de WhatsApp</label>
          <input
            id="c-whatsapp-url"
            type="url"
            value={formContacto.whatsappUrl}
            onChange={(e) => cambiarCampoContacto('whatsappUrl', e.target.value)}
            placeholder="https://wa.me/55912936?text=..."
          />
        </div>

        <div className="campo-row">
          <div className="campo">
            <label htmlFor="c-facebook">Link de Facebook</label>
            <input
              id="c-facebook"
              type="url"
              value={formContacto.facebook}
              onChange={(e) => cambiarCampoContacto('facebook', e.target.value)}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div className="campo">
            <label htmlFor="c-instagram">Link de Instagram</label>
            <input
              id="c-instagram"
              type="url"
              value={formContacto.instagram}
              onChange={(e) => cambiarCampoContacto('instagram', e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
        </div>

        <div className="campo">
          <label htmlFor="c-max-citas">Cupos de citas por día</label>
          <input
            id="c-max-citas"
            type="number"
            min={1}
            value={formContacto.maxCitasPorDia}
            onChange={(e) => cambiarMaxCitas(e.target.value)}
            placeholder="Ej. 10"
          />
          <p className="campo-ayuda">Cantidad máxima de citas que se pueden reservar en un día en la web.</p>
        </div>

        <div className="campo">
          <span className="campo-label">Horario de atención</span>
          {formContacto.schedule.length === 0 && <p className="empty">No hay horarios registrados.</p>}
          <div className="horario-lista">
            {formContacto.schedule.map((item, i) => (
              <div key={`${item.days}-${i}`} className="horario-fila">
                <input
                  type="text"
                  value={item.days}
                  onChange={(e) => cambiarHorario(i, 'days', e.target.value)}
                  placeholder="Días (ej. Lunes a Viernes)"
                />
                <input
                  type="text"
                  value={item.hours}
                  onChange={(e) => cambiarHorario(i, 'hours', e.target.value)}
                  placeholder="Horas (ej. 8:00 AM – 6:00 PM)"
                />
                <button
                  type="button"
                  className="btn btn-small btn-danger"
                  onClick={() => eliminarHorario(i)}
                  aria-label={`Eliminar horario ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-small btn-outline" onClick={agregarHorario}>
            + Agregar horario
          </button>
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn btn-primary" disabled={guardandoConfig}>
            {guardandoConfig ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            disabled={guardandoConfig}
            onClick={async () => {
              setGuardandoConfig(true)
              const exito = await restablecerContacto()
              setGuardandoConfig(false)
              if (exito) {
                setFormContacto(VALORES_INICIALES)
                setEditandoConfig(false)
                onMostrarModal(
                  'exito',
                  'Valores restablecidos',
                  'La configuración volvió a los valores por defecto.',
                )
              } else {
                onMostrarModal(
                  'error',
                  'Error al restablecer',
                  'No se pudo conectar con el backend. Inténtalo de nuevo.',
                )
              }
            }}
          >
            Restablecer valores
          </button>
        </div>
      </form>
    </div>
  )
}