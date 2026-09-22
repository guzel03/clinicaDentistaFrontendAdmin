import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { CLINIC } from './config'
import { getConfiguracion, updateConfiguracion } from './api'
import type { ConfiguracionBackend } from './api'

export interface HorarioItem {
  days: string
  hours: string
}

export interface ContactoConfig {
  name: string
  address: string
  telephone: string
  email: string
  schedule: HorarioItem[]
  facebook: string
  instagram: string
  whatsapp: string
  whatsappUrl: string
  maxCitasPorDia: number
}

const STORAGE_KEY = 'clinica-sonrisa-contacto'

const MAX_CITAS_POR_DIA_POR_DEFECTO = 10

export const VALORES_INICIALES: ContactoConfig = {
  name: CLINIC.name,
  address: CLINIC.address,
  telephone: CLINIC.telephone,
  email: CLINIC.email,
  schedule: CLINIC.schedule.map((s) => ({ ...s })),
  facebook: CLINIC.facebook,
  instagram: CLINIC.instagram,
  whatsapp: CLINIC.whatsapp,
  whatsappUrl: `https://wa.me/${CLINIC.whatsapp}?text=${encodeURIComponent('Hola, quiero más información.')}`,
  maxCitasPorDia: MAX_CITAS_POR_DIA_POR_DEFECTO,
}

function cargarContacto(): ContactoConfig {
  const guardado = localStorage.getItem(STORAGE_KEY)
  if (guardado) {
    try {
      const parseado = JSON.parse(guardado) as Partial<ContactoConfig>
      return {
        ...VALORES_INICIALES,
        ...parseado,
        schedule: parseado.schedule ?? VALORES_INICIALES.schedule,
      }
    } catch {
      return VALORES_INICIALES
    }
  }
  return VALORES_INICIALES
}

function aConfiguracionBackend(c: ContactoConfig): ConfiguracionBackend {
  return {
    name: c.name,
    address: c.address,
    telephone: c.telephone,
    email: c.email,
    whatsapp: c.whatsapp,
    whatsappUrl: c.whatsappUrl,
    facebook: c.facebook,
    instagram: c.instagram,
    schedule: c.schedule.map((s) => ({ days: s.days, hours: s.hours })),
    maxCitasPorDia: c.maxCitasPorDia,
  }
}

function aContactoConfig(c: ConfiguracionBackend): ContactoConfig {
  return {
    name: c.name || VALORES_INICIALES.name,
    address: c.address || VALORES_INICIALES.address,
    telephone: c.telephone || VALORES_INICIALES.telephone,
    email: c.email || VALORES_INICIALES.email,
    whatsapp: c.whatsapp || VALORES_INICIALES.whatsapp,
    whatsappUrl: c.whatsappUrl || VALORES_INICIALES.whatsappUrl,
    facebook: c.facebook || VALORES_INICIALES.facebook,
    instagram: c.instagram || VALORES_INICIALES.instagram,
    schedule:
      Array.isArray(c.schedule) && c.schedule.length > 0
        ? c.schedule.map((s) => ({ days: s.days, hours: s.hours }))
        : VALORES_INICIALES.schedule,
    maxCitasPorDia: c.maxCitasPorDia || VALORES_INICIALES.maxCitasPorDia,
  }
}

interface ContactoContextValue {
  contacto: ContactoConfig
  actualizarContacto: (campos: Partial<ContactoConfig>) => Promise<boolean>
  restablecerContacto: () => Promise<boolean>
}

const ContactoContext = createContext<ContactoContextValue | undefined>(undefined)

export function ContactoProvider({ children }: { children: ReactNode }) {
  const [contacto, setContacto] = useState<ContactoConfig>(cargarContacto)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacto))
  }, [contacto])

  useEffect(() => {
    let activo = true
    getConfiguracion()
      .then((config) => {
        if (activo) setContacto(aContactoConfig(config))
      })
      .catch(() => {
        // Se mantiene el valor local cuando el backend no responde
      })
    return () => { activo = false }
  }, [])

  const actualizarContacto = async (campos: Partial<ContactoConfig>): Promise<boolean> => {
    const siguiente = { ...contacto, ...campos }
    setContacto(siguiente)
    try {
      await updateConfiguracion(aConfiguracionBackend(siguiente))
      return true
    } catch {
      return false
    }
  }

  const restablecerContacto = async (): Promise<boolean> => {
    setContacto(VALORES_INICIALES)
    try {
      await updateConfiguracion(aConfiguracionBackend(VALORES_INICIALES))
      return true
    } catch {
      return false
    }
  }

  return (
    <ContactoContext.Provider value={{ contacto, actualizarContacto, restablecerContacto }}>
      {children}
    </ContactoContext.Provider>
  )
}

export function useContacto(): ContactoContextValue {
  const ctx = useContext(ContactoContext)
  if (!ctx) throw new Error('useContacto debe usarse dentro de ContactoProvider')
  return ctx
}

export function whatsappLink(whatsapp: string, message: string): string {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`
}