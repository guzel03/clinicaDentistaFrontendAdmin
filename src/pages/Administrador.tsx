import { useState } from 'react'
import AdminMenu from '../admin/AdminMenu'
import AdminNavbar from '../admin/AdminNavbar'
import CitasView from '../admin/CitasView'
import ClientesView from '../admin/ClientesView'
import ConfiguracionView from '../admin/ConfiguracionView'
import DashboardView from '../admin/DashboardView'
import EntradaView from '../admin/EntradaView'
import LoginView from '../admin/LoginView'
import Nomenclador from '../admin/Nomenclador'
import ServiciosView from '../admin/ServiciosView'
import StockView from '../admin/StockView'
import { useAdminDatos } from '../admin/useAdminDatos'
import { formatearFecha } from '../admin/admin'

export default function Administrador({ onVolverAlSitio }: { onVolverAlSitio?: () => void }) {
  const admin = useAdminDatos()
  const [menuCerrado, setMenuCerrado] = useState(false)

  if (!admin.autenticado) {
    return <LoginView onLogin={admin.iniciarSesion} onVolverAlSitio={onVolverAlSitio} />
  }

  function mostrarModal(tipo: 'exito' | 'error', titulo: string, mensaje: string) {
    admin.setModalConfig({ tipo, titulo, mensaje })
  }

  return (
    <section className="page administrador">
      <div className={`admin-layout ${menuCerrado ? 'admin-layout-cerrado' : ''}`}>
        <AdminMenu
          seccion={admin.seccion}
          onSeleccionar={admin.setSeccion}
          onVolverAlSitio={onVolverAlSitio}
          onCerrarSesion={admin.cerrarSesion}
          cerrado={menuCerrado}
          onToggle={() => setMenuCerrado((v) => !v)}
        />

        <div className="admin-contenido" onClick={() => setMenuCerrado(true)}>
          <AdminNavbar />

          <div className="admin-pagina">
          {admin.seccion === 'dashboard' && (
            <DashboardView
              servicios={admin.servicios}
              serviciosBackend={admin.serviciosBackend}
              clientes={admin.clientes}
              citas={admin.citas}
              totalMonedas={admin.monedas.length}
              fechasInhabilitadas={admin.fechasInhabilitadas}
              cargando={admin.cargandoDashboard}
              datosCargados={admin.datosCargados}
              error={admin.errorDashboard}
              onReintentar={admin.revisar}
              onSeleccionarDia={admin.abrirModalDia}
            />
          )}

          {admin.seccion === 'servicios' && (
            <ServiciosView
              servicios={admin.servicios}
              monedas={admin.monedas}
              cargando={admin.cargandoDashboard}
              datosCargados={admin.datosCargados}
              onAgregarServicio={admin.agregarServicio}
              onModificarServicio={admin.modificarServicio}
              onEliminarServicio={admin.eliminarServicio}
              onRevision={admin.revisar}
              onMostrarModal={mostrarModal}
            />
          )}

          {admin.seccion === 'clientes' && (
            <ClientesView
              clientes={admin.clientes}
              cargando={admin.cargandoDashboard}
              datosCargados={admin.datosCargados}
              onRegistrarCliente={admin.registrarCliente}
              onEliminarCliente={admin.eliminarCliente}
              onRevision={admin.revisar}
              onMostrarModal={mostrarModal}
            />
          )}

          {admin.seccion === 'citas' && (
            <CitasView
              clientes={admin.clientes}
              serviciosBackend={admin.serviciosBackend}
              citas={admin.citas}
              fechasInhabilitadas={admin.fechasInhabilitadas}
              cargando={admin.cargandoDashboard}
              datosCargados={admin.datosCargados}
              onRegistrarCita={admin.registrarCita}
              onEliminarCita={admin.eliminarCita}
              onModificarCliente={admin.modificarCliente}
              onRevision={admin.revisar}
              onMostrarModal={mostrarModal}
            />
          )}

          {admin.seccion === 'nomenclador' && (
            <Nomenclador
              monedas={admin.monedas}
              cargando={admin.cargandoDashboard}
              datosCargados={admin.datosCargados}
              onAgregarMoneda={admin.agregarMoneda}
              onModificarMoneda={admin.modificarMoneda}
              onEliminarMoneda={admin.eliminarMoneda}
              onRevision={admin.revisar}
              onMostrarModal={mostrarModal}
            />
          )}

          {admin.seccion === 'entrada' && <EntradaView />}
          {admin.seccion === 'stock' && <StockView />}

          {admin.seccion === 'configuracion' && (
            <ConfiguracionView onMostrarModal={mostrarModal} />
          )}
          </div>
        </div>
      </div>

      {admin.diaModal && (
        <div className="modal-overlay" onClick={() => !admin.guardandoDia && admin.setDiaModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{admin.diaModal.inhabilitado ? 'Habilitar día' : 'Inhabilitar día'}</h2>
              <button
                className="modal-close"
                onClick={() => admin.setDiaModal(null)}
                aria-label="Cerrar"
                disabled={admin.guardandoDia}
              >
                ✕
              </button>
            </div>
            <p className="modal-texto">
              {admin.diaModal.inhabilitado
                ? `¿Deseas habilitar el día ${formatearFecha(admin.diaModal.fecha)}? Se podrán agendar citas nuevamente.`
                : `¿Deseas inhabilitar el día ${formatearFecha(admin.diaModal.fecha)}? No se podrán agendar citas en esa fecha.`}
            </p>
            <div className="form-buttons">
              <button
                type="button"
                className="btn btn-primary"
                disabled={admin.guardandoDia}
                onClick={admin.confirmarModalDia}
              >
                {admin.guardandoDia
                  ? 'Guardando...'
                  : admin.diaModal.inhabilitado
                    ? 'Sí, habilitar'
                    : 'Sí, inhabilitar'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                disabled={admin.guardandoDia}
                onClick={() => admin.setDiaModal(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {admin.modalConfig && (
        <div className="modal-overlay" onClick={() => admin.setModalConfig(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{admin.modalConfig.titulo}</h2>
              <button
                className="modal-close"
                onClick={() => admin.setModalConfig(null)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <p className={admin.modalConfig.tipo === 'exito' ? 'success-box' : 'login-error'}>
              {admin.modalConfig.mensaje}
            </p>
            <div className="form-buttons">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => admin.setModalConfig(null)}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}