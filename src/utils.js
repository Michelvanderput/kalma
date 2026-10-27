export const uid = () => crypto.randomUUID()

const pad = (n) => String(n).padStart(2, '0')

export function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function daysSince(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((today - start) / 86400000)
}

export function formatDate(ts) {
  return new Date(ts).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function greeting(name) {
  const h = new Date().getHours()
  const part = h < 6 ? 'Goedenacht' : h < 12 ? 'Goedemorgen' : h < 18 ? 'Goedemiddag' : 'Goedenavond'
  return name ? `${part}, ${name}` : part
}

// 06-12345678 of +31 6 ... wordt 31612345678, het formaat dat wa.me verwacht.
export function whatsappNumber(phone = '') {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('00')) return digits.slice(2)
  if (digits.startsWith('0')) return '31' + digits.slice(1)
  return digits
}

export const PROOF_TYPES = {
  drang: 'Drangmoment gewonnen',
  trots: 'Trots op',
  moeilijk: 'Moeilijk, en toch gedaan',
  compliment: 'Compliment gekregen',
  belofte: 'Belofte nagekomen',
  gesprek: 'Lastig gesprek gevoerd',
  anders: 'Iets anders',
}
