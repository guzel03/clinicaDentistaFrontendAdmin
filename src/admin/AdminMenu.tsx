import { OPCIONES_MENU, OPCIONES_SECUNDARIAS } from './admin'
import type { Seccion } from './admin'
import { Icono } from './iconos'
import { useContacto } from '../contactConfig'

export default function AdminMenu({
  seccion,
  onSeleccionar,
  onVolverAlSitio,
  onCerrarSesion,
  cerrado,
  onToggle,
}: {
  seccion: Seccion
  onSeleccionar: (seccion: Seccion) => void
  onVolverAlSitio?: () => void
  onCerrarSesion: () => void
  cerrado: boolean
  onToggle: () => void
}) {
  const { contacto } = useContacto()

  return (
    <aside className={`admin-sidebar ${cerrado ? 'admin-sidebar-cerrado' : ''}`}>
      <div className="sidebar-brand">
        <span className="brand-name">{contacto.name}</span>
        {cerrado && (
          <button
            type="button"
            className="sidebar-toggle"
            onClick={onToggle}
            title="Expandir menú"
            aria-label="Expandir menú"
          >
            <Icono nombre="muela" size={20} />
          </button>
        )}
      </div>

      <nav className="sidebar-menu">
        {OPCIONES_MENU.map((opcion) => (
          <button
            key={opcion.id}
            title={cerrado ? opcion.label : undefined}
            className={`sidebar-link ${seccion === opcion.id ? 'active' : ''}`}
            onClick={() => onSeleccionar(opcion.id)}
          >
            <Icono nombre={opcion.icono} />
            <span className="sidebar-texto">{opcion.label}</span>
          </button>
        ))}

        <div className="sidebar-divider" />

        {OPCIONES_SECUNDARIAS.map((opcion) => (
          <button
            key={opcion.id}
            title={cerrado ? opcion.label : undefined}
            className={`sidebar-link ${seccion === opcion.id ? 'active' : ''}`}
            onClick={() => onSeleccionar(opcion.id)}
          >
            <Icono nombre={opcion.icono} />
            <span className="sidebar-texto">{opcion.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {onVolverAlSitio && (
          <button
            type="button"
            className="sidebar-link sidebar-volver"
            title={cerrado ? 'Volver al sitio' : undefined}
            onClick={onVolverAlSitio}
          >
            <Icono nombre="home" />
            <span className="sidebar-texto">Volver al sitio</span>
          </button>
        )}
        <div className="admin-user">
          <span className="admin-avatar">L</span>
          <span className="admin-user-info">
            <span className="admin-user-name">Login</span>
            <span className="admin-user-cargo">Administrador</span>
          </span>
          <button
            className="sidebar-logout"
            onClick={onCerrarSesion}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <Icono nombre="logout" size={20} />
          </button>
        </div>
      </div>
    </aside>
  )
}