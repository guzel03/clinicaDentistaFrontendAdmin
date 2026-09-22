import { useState } from 'react'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function fechaStr(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

interface Props {
  fechasInhabilitadas?: ReadonlySet<string>
  fechaSeleccionada?: string
  resaltarConCita?: ReadonlySet<string>
  bloquearInhabilitados?: boolean
  bloquearPasados?: boolean
  citasPorDia?: ReadonlyMap<string, number>
  maxCitasPorDia?: number
  onSeleccionarDia?: (fecha: string) => void
}

export default function CalendarioCitas({
  fechasInhabilitadas = new Set<string>(),
  fechaSeleccionada = '',
  resaltarConCita = new Set<string>(),
  bloquearInhabilitados = false,
  bloquearPasados = false,
  citasPorDia,
  maxCitasPorDia,
  onSeleccionarDia,
}: Props) {
  const hoy = new Date()
  const [anioC, setAnioC] = useState(hoy.getFullYear())
  const [mesC, setMesC] = useState(hoy.getMonth())

  const fechaHoy = fechaStr(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())

  const primerDia = new Date(anioC, mesC, 1).getDay()
  const diasEnMes = new Date(anioC, mesC + 1, 0).getDate()
  const celdas: (number | null)[] = Array(primerDia).fill(null)
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d)

  function cambiarMes(delta: number) {
    let mes = mesC + delta
    let anio = anioC
    if (mes < 0) {
      mes = 11
      anio -= 1
    }
    if (mes > 11) {
      mes = 0
      anio += 1
    }
    setMesC(mes)
    setAnioC(anio)
  }

  return (
    <div className="calendario">
      <div className="calendario-titulo">
        <button
          type="button"
          className="cal-nav"
          onClick={() => cambiarMes(-1)}
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <span>
          {MESES[mesC]} {anioC}
        </span>
        <button
          type="button"
          className="cal-nav"
          onClick={() => cambiarMes(1)}
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      <div className="calendario-semana">
        {DIAS_SEMANA.map((dia) => (
          <span key={dia} className="cal-semana-dia">
            {dia}
          </span>
        ))}
      </div>

      <div className="calendario-dias">
        {celdas.map((d, i) => {
          if (d === null) {
            return <span key={`vacio-${i}`} className="cal-dia vacio" />
          }
          const fecha = fechaStr(anioC, mesC, d)
          const inhabilitado = fechasInhabilitadas.has(fecha)
          const conCita = resaltarConCita.has(fecha)
          const esHoy = fecha === fechaHoy
          const seleccionado = fecha === fechaSeleccionada
          const pasado = bloquearPasados && fecha < fechaHoy
          const ocupadas = citasPorDia?.get(fecha) ?? 0
          const conCupos = maxCitasPorDia != null && citasPorDia != null
          const restantes = conCupos ? Math.max(maxCitasPorDia - ocupadas, 0) : null
          const lleno = conCupos && restantes === 0
          const bloqueado = (bloquearInhabilitados && inhabilitado) || pasado || lleno

          const clases = ['cal-dia']
          if (esHoy) clases.push('hoy')
          if (conCita) clases.push('con-cita')
          if (inhabilitado) clases.push('inhabilitado')
          if (seleccionado) clases.push('seleccionado')
          if (pasado) clases.push('pasado')
          if (lleno) clases.push('lleno')

          const titulo = inhabilitado
            ? 'Día inhabilitado'
            : conCita
              ? 'Tiene citas'
              : lleno
                ? 'Día completo'
                : undefined

          if (onSeleccionarDia && !bloqueado) {
            return (
              <button
                type="button"
                key={`${fecha}-btn`}
                className={clases.join(' ')}
                onClick={() => {
                  if (lleno) return
                  onSeleccionarDia(fecha)
                }}
                title={titulo}
              >
                {d}
              </button>
            )
          }

          return (
            <span
              key={`${fecha}-span`}
              className={clases.join(' ')}
              title={titulo}
            >
              {d}
            </span>
          )
        })}
      </div>
    </div>
  )
}