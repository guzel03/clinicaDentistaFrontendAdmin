import { useState } from 'react'
import type { FormEvent } from 'react'
import fondoLogin from '../pictures/Fondo.jpeg'
import iconoLogin from '../pictures/iconob.png'

export default function LoginView({
  onLogin,
  onVolverAlSitio,
}: {
  onLogin: (usuario: string, contraseña: string) => boolean
  onVolverAlSitio?: () => void
}) {
  const [usuario, setUsuario] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [error, setError] = useState('')

  function manejarLogin(e: FormEvent) {
    e.preventDefault()
    if (onLogin(usuario, contraseña)) {
      setUsuario('')
      setContraseña('')
      setError('')
    } else {
      setError('Usuario o contraseña incorrectos.')
    }
  }

  return (
    <section
      className="page administrador login-page"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3)), url(${fondoLogin})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      

      <form className="servicio-form login-form" onSubmit={manejarLogin}>
        <img className="login-icono" src={iconoLogin} alt="" />

        <h2>Iniciar sesión</h2>

        <div className="campo">
          <label htmlFor="login-usuario">Usuario</label>
          <input
            id="login-usuario"
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Ingresa tu usuario"
          />
        </div>

        <div className="campo">
          <label htmlFor="login-contraseña">Contraseña</label>
          <input
            id="login-contraseña"
            type="password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            placeholder="Ingresa tu contraseña"
          />
        </div>

        {error && <p className="login-error">{error}</p>}

        <div className="form-buttons">
          <button type="submit" className="btn btn-primary">
            Entrar
          </button>
          {onVolverAlSitio && (
            <button type="button" className="btn btn-outline" onClick={onVolverAlSitio}>
              ← Volver al sitio
            </button>
          )}
        </div>
      </form>
    </section>
  )
}