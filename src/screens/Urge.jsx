import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { MessageCircle, Phone, X } from 'lucide-react'
import { useStore } from '../store.jsx'
import { Chips, Scale } from '../components.jsx'
import Dashy from '../Dashy.jsx'
import { uid, whatsappNumber } from '../utils.js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const SURF_MINUTES = 10
const TRIGGERS = ['Honger', 'Boos', 'Eenzaam', 'Moe', 'Verveeld', 'Stress', 'Geldzorgen', 'Weet ik niet']

// Het drangprotocol: geen keuzemenu's, gewoon de volgende stap.
export default function Urge({ onClose }) {
  const { data, change } = useStore()
  const { settings, urges } = data
  const [step, setStep] = useState(0)
  const [before, setBefore] = useState(7)
  const [after, setAfter] = useState(4)
  const [triggers, setTriggers] = useState([])
  const [note, setNote] = useState('')
  const [celebrate, setCelebrate] = useState('success')

  const finish = () => {
    const at = Date.now()
    change('urges', (list) => [...list, { id: uid(), at, before, after, triggers, note }])
    change('proof', (list) => [
      ...list,
      { id: uid(), at, type: 'drang', text: note || `Drang van ${before} naar ${after}. Niet toegegeven.` },
    ])
    setStep(5)
  }

  // Na het juichen komt Dashy tot rust in trots.
  useEffect(() => {
    if (step !== 5) return
    const t = setTimeout(() => setCelebrate('proud'), 2400)
    return () => clearTimeout(t)
  }, [step])

  // Dashy spiegelt rust: aandachtig, meedenkend, en nooit in paniek.
  const dashyState = [
    'listening',
    before >= 8 ? 'determined' : 'curious',
    'thinking',
    null, // de surfstap stuurt Dashy zelf aan
    after < before ? 'relieved' : 'nodding',
    celebrate,
  ][step]

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pt-4 pb-10 sm:px-6">
      <div className="flex items-center justify-between">
        <StepDots step={Math.min(step, 4)} />
        <Button variant="secondary" size="sm" className="h-10 rounded-full px-4" onClick={onClose}>
          <X aria-hidden="true" />
          Sluiten
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={step}
          className="flex flex-1 flex-col gap-6 pt-6"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {step === 3 ? (
            <Surf settings={settings} onDone={() => setStep(4)} />
          ) : (
            <div className="flex justify-center">
              <Dashy state={dashyState} size={step === 5 ? 168 : 120} label="Dashy is bij je" />
            </div>
          )}

          {step === 0 && (
            <>
              <p className="text-center text-sm font-semibold text-muted-foreground">Je drukte op de knop. Dat is al winnen.</p>
              <Card className="relative rounded-[1.5rem] border-0 px-6 py-6 shadow-soft">
                <span className="absolute inset-y-6 left-0 w-1 rounded-r bg-primary" aria-hidden="true" />
                <p className="text-xl leading-relaxed whitespace-pre-wrap text-pretty">
                  {settings.message ||
                    'Dit gevoel is echt, en het gaat over. Je hoeft nu niets te doen behalve de volgende tien minuten doorkomen.'}
                </p>
              </Card>
              <Next onClick={() => setStep(1)} />
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-center text-2xl font-extrabold tracking-tight">Hoe sterk is de drang nu?</h1>
              <Card className="rounded-[1.5rem] border-0 px-5 py-6 shadow-soft">
                <Scale label="Drang" value={before} onChange={setBefore} low="rustig" high="heel sterk" />
              </Card>
              <Next onClick={() => setStep(2)} />
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-extrabold tracking-tight">Wat zit eronder?</h1>
                <p className="mt-1 text-muted-foreground">Kies wat past. Meer dan één mag.</p>
              </div>
              <Chips options={TRIGGERS} value={triggers} onChange={setTriggers} multi label="Wat zit eronder?" />
              <Next onClick={() => setStep(3)} />
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="text-center text-2xl font-extrabold tracking-tight">En nu?</h1>
              <Card className="gap-6 rounded-[1.5rem] border-0 px-5 py-6 shadow-soft">
                <Scale label="Drang" value={after} onChange={setAfter} low="rustig" high="heel sterk" />
                <div className="flex flex-col gap-2">
                  <Label htmlFor="note" className="text-[0.95rem] font-semibold">
                    Wat hielp? (optioneel)
                  </Label>
                  <Textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="rounded-xl bg-muted px-4 py-3 text-base" />
                </div>
              </Card>
              <Next label="Opslaan" onClick={finish} />
            </>
          )}

          {step === 5 && (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm font-bold tracking-wide text-primary uppercase">Gewonnen</p>
              <motion.p
                className="text-7xl leading-none font-extrabold tracking-tighter tabular-nums"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.15 }}
              >
                {urges.length}
              </motion.p>
              <p className="max-w-sm text-muted-foreground text-pretty">
                drangmomenten heb je zo doorstaan. Dit staat nu in je Bewijsarchief, en niemand kan het je afpakken.
              </p>
              <Button size="touch" className="mt-4 w-full" onClick={onClose}>
                Terug naar vandaag
              </Button>
            </div>
          )}
        </motion.section>
      </AnimatePresence>
    </div>
  )
}

function Next({ label = 'Verder', onClick }) {
  return (
    <Button size="touch" className="mt-auto w-full" onClick={onClick}>
      {label}
    </Button>
  )
}

function StepDots({ step }) {
  return (
    <div className="flex gap-1.5" aria-label={`Stap ${step + 1} van 5`} role="img">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'w-6 bg-primary' : 'w-1.5 bg-border'}`}
        />
      ))}
    </div>
  )
}

function Surf({ settings, onDone }) {
  const [end] = useState(() => Date.now() + SURF_MINUTES * 60000)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [])

  const left = Math.max(0, end - now)
  const min = Math.floor(left / 60000)
  const sec = Math.floor((left % 60000) / 1000)
  // Ademritme: 4 seconden in, 6 seconden uit. Dashy ademt mee.
  const inhale = ((SURF_MINUTES * 60000 - left) / 1000) % 10 < 4
  const wa = whatsappNumber(settings.buddyPhone)
  const waText = encodeURIComponent('Hey, ik heb even een lastig moment. Kun je me bellen?')
  const buddy = settings.buddyName || 'buddy'

  return (
    <div className="flex flex-1 flex-col items-center gap-5 text-center">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Surf op de golf</h1>
        <p className="mt-1 text-muted-foreground text-pretty">Een drang komt op, piekt en zakt weer. Jij hoeft alleen te ademen.</p>
      </div>

      <motion.div
        className="my-2 flex size-60 flex-col items-center justify-center gap-1 rounded-full bg-[radial-gradient(circle,var(--secondary)_55%,transparent_72%)] sm:size-72"
        animate={{ scale: inhale ? 1.12 : 0.86 }}
        transition={{ duration: inhale ? 4 : 6, ease: 'easeInOut' }}
      >
        <Dashy state={inhale ? 'listening' : 'relieved'} size={104} label="Dashy ademt met je mee" />
        <span className="font-semibold text-secondary-foreground" aria-live="polite">
          {inhale ? 'Adem in' : 'Adem uit'}
        </span>
      </motion.div>

      <p className="text-4xl font-extrabold tracking-tight tabular-nums">
        {min}:{String(sec).padStart(2, '0')}
      </p>

      {settings.buddyPhone && (
        <div className="grid w-full grid-cols-2 gap-3">
          <Button asChild variant="secondary" size="touch">
            <a href={`tel:${settings.buddyPhone}`}>
              <Phone aria-hidden="true" />
              <span className="truncate">Bel {buddy}</span>
            </a>
          </Button>
          <Button asChild variant="secondary" size="touch">
            <a href={`https://wa.me/${wa}?text=${waText}`} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden="true" />
              <span className="truncate">App {buddy}</span>
            </a>
          </Button>
        </div>
      )}

      <Button variant={left === 0 ? 'default' : 'ghost'} size="touch" className="mt-auto w-full" onClick={onDone}>
        {left === 0 ? 'Verder' : 'Ik ben er klaar voor'}
      </Button>
    </div>
  )
}
