export const CLINIC = {
  name: 'Clínica Dental ChinaBeautySalón',
  whatsapp: '55912936',
  telephone: '+53 55912936',
  address: 'Av. Principal #123, Sector El Centro, Ciudad',
  email: 'contacto@clinicaChinaBeautySalón.com',
  facebook: 'https://facebook.com/clinicadentalChinaBeautySalón',
  instagram: 'https://instagram.com/clinicadentalChinaBeautySalón',
  schedule: [
    { days: 'Lunes a Viernes', hours: '8:00 AM – 6:00 PM' },
    { days: 'Sábado', hours: '8:00 AM – 1:00 PM' },
    { days: 'Domingo', hours: 'Cerrado' },
  ],
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${CLINIC.whatsapp}?text=${encodeURIComponent(message)}`
}