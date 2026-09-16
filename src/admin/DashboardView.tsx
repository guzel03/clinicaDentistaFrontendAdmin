import { useState } from 'react'
import CalendarioCitas from '../components/CalendarioCitas'
import type { CitaBackend, ClienteBackend, ServicioBackend } from '../api'
import type { Servicio } from '../types'

function GraficoCitas({ datos }: { datos: { nombre: string; cantidad: number }[] }) {
  const POR_PAGINA = 5
  const [pagina, setPagina] = useState(0)
  const totalPaginas = Math.max(1, Math.ceil(datos.length / POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas - 1)
  const inicio = paginaSegura * POR_PAGINA
  const visibles = datos.slice(inicio, inicio + POR_PAGINA)
  const maximo = Math.max(...datos.map((d) => d.cantidad), 1)

  return (
    <div className="grafico-barras">
      {visibles.map((d) => (
        <div className="barra-fila" key={d.nombre}>
          <span className="barra-label" title={d.nombre}>
            {d.nombre}
          </span>
          <div className="barra-track">
            <div className="barra-valor" style={{ width: `${(d.cantidad / maximo) * 100}%` }} />
          </div>
          <span className="barra-cantidad">{d.cantidad}</span>
        </div>
      ))}

      {datos.length > POR_PAGINA && (
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
            {inicio + 1}–{Math.min(inicio + POR_PAGINA, datos.length)} de {datos.length}
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
  )
}

export default function DashboardView({
  servicios,
  serviciosBackend,
  clientes,
  citas,
  fechasInhabilitadas,
  cargando,
  datosCargados,
  error,
  onReintentar,
  onSeleccionarDia,
}: {
  servicios: Servicio[]
  serviciosBackend: ServicioBackend[]
  clientes: ClienteBackend[]
  citas: CitaBackend[]
  fechasInhabilitadas: Set<string>
  cargando: boolean
  datosCargados: boolean
  error: string
  onReintentar: () => void
  onSeleccionarDia: (fecha: string) => void
}) {
  const fechasConCita = new Set(citas.map((c) => c.fecha.slice(0, 10)))

  const serviciosPorId = new Map(serviciosBackend.map((s) => [s._id, s.nombreServicio]))
  const conteoPorServicio = new Map<string, number>()
  for (const cita of citas) {
    const nombreServicio = serviciosPorId.get(cita.servicio)
    if (!nombreServicio) continue
    conteoPorServicio.set(nombreServicio, (conteoPorServicio.get(nombreServicio) ?? 0) + 1)
  }
  const datosGrafico = [...conteoPorServicio.entries()].map(([nombre, cantidad]) => ({
    nombre,
    cantidad,
  }))

  const totalServicios = servicios.length
  const totalClientes = clientes.length
  const totalCitas = citas.length

  return (
    <div className="admin-seccion dashboard-seccion">
      {cargando && !datosCargados && <p className="empty">Cargando datos del panel...</p>}

      {error && !datosCargados && (
        <div className="login-error" role="alert">
          {error}
          <button type="button" className="btn btn-small btn-outline" onClick={onReintentar}>
            Reintentar
          </button>
        </div>
      )}

      {datosCargados && (
        <>
          <div className="resumen-tarjetas">
            <div className="resumen-card">
              <span className="resumen-label">Total de servicios</span>
              <span className="resumen-valor">{totalServicios ?? '—'}</span>
            </div>
            <div className="resumen-card">
              <span className="resumen-label">Total de clientes</span>
              <span className="resumen-valor">{totalClientes ?? '—'}</span>
            </div>
            <div className="resumen-card">
              <span className="resumen-label">Total de citas</span>
              <span className="resumen-valor">{totalCitas ?? 0}</span>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="panel panel-calendario">
              <h3 className="panel-titulo">Almanaque</h3>
              <p className="panel-ayuda">
                Haz clic en un día para inhabilitarlo o habilitarlo. Los días en rojo están
                inhabilitados.
              </p>
              <CalendarioCitas
                fechasInhabilitadas={fechasInhabilitadas}
                resaltarConCita={fechasConCita}
                onSeleccionarDia={(fecha) => onSeleccionarDia(fecha)}
              />
            </div>
            <div className="panel panel-grafico">
              <h3 className="panel-titulo">Citas por servicio</h3>
              <GraficoCitas datos={datosGrafico} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}