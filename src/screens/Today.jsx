import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Moon, Pencil, Sun, Waves } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '../store.jsx'
import { Chips, Reveal, Scale } from '../components.jsx'
import Dashy, { useDashyMood } from '../Dashy.jsx'
import { daysSince, greeting, todayKey, uid } from '../utils.js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Vanaf dit uur maakt de ochtendcheck-in plaats voor de avond.
const EVENING_HOUR = 17
// Dashy zwaait één keer per keer dat je de app opent.
let greeted = false

export default function Today({ onUrge, goTo }) {
  const { data, change } = useStore()
  const { settings, checkins } = data
  const key = todayKey()
  const day = checkins[key] ?? {}
  const clean = settings.cleanSince ? daysSince(settings.cleanSince) : null
  const hour = new Date().getHours()
  const evening = hour >= EVENING_HOUR
  const base = hour >= 23 || hour < 6 ? 'sleepy' : day.evening ? 'proud' : day.morning ? 'happy' : 'idle'
  const [mood, react] = useDashyMood(base)
  const dashy = useRef(null)

  useEffect(() => {
    if (greeted) return
    greeted = true
    const t = setTimeout(() => dashy.current?.play('hallo'), 400)
    return () => clearTimeout(t)
  }, [])

  const saveCheckin = (part, values) =>
    change('checkins', (all) => ({ ...all, [key]: { ...all[key], [part]: { ...values, at: Date.now() } } }))

  const saveMorning = (values) => {
    saveCheckin('morning', values)
    react('success')
    toast.success('Ochtend opgeslagen')
  }

  // Bij aanpassen vervangen we de bewijsstukken van deze avond, zodat er geen dubbele ontstaan.
  const saveEvening = (values) => {
    saveCheckin('evening', values)
    const at = Date.now()
    const from = `evening:${key}`
    const entries = [
      values.proud && { id: uid(), at, from, type: 'trots', text: values.proud },
      values.hard && { id: uid(), at, from, type: 'moeilijk', text: values.hard },
    ].filter(Boolean)
    change('proof', (list) => [...list.filter((p) => p.from !== from), ...entries])
    react('love', 2600)
    toast.success(entries.length ? 'Dag afgesloten, en bewaard in je Bewijsarchief' : 'Dag afgesloten')
  }

  return (
    <>
      <Reveal className="flex items-center justify-between gap-4 px-1 pt-2">
        <div className="min-w-0">
          <p className="mb-1 text-sm font-semibold text-muted-foreground">{greeting(settings.name)}</p>
          {clean !== null ? (
            <h1>
              <span className="block text-6xl leading-none font-extrabold tracking-tighter text-primary tabular-nums sm:text-7xl">
                {clean}
              </span>
              <span className="mt-1 block text-lg font-semibold text-muted-foreground">dagen vrij</span>
            </h1>
          ) : (
            <h1 className="text-3xl font-extrabold tracking-tight text-balance">Welkom bij Kalma</h1>
          )}
        </div>
        <Dashy ref={dashy} state={mood} size={112} label="Dashy, je maatje in Kalma" />
      </Reveal>

      <Reveal delay={0.05}>
        <button
          onClick={onUrge}
          className="group relative flex w-full cursor-pointer items-center gap-4 overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-urge to-urge-deep p-6 text-left text-urge-foreground shadow-[0_18px_40px_-14px_var(--urge)] transition-transform outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.985]"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <Waves className="size-6" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-xl font-bold tracking-tight">Ik voel drang</span>
            <span className="text-sm opacity-90">Tien minuten, stap voor stap.</span>
          </span>
          <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </button>
      </Reveal>

      {!settings.name && (
        <Reveal delay={0.1}>
          <Card className="gap-4 rounded-[1.5rem] border-0 px-5 py-6 shadow-soft">
            <h2 className="text-lg font-bold">Eerst even instellen</h2>
            <p className="text-muted-foreground">Je naam, je startdatum, je buddy en een bericht aan jezelf. Twee minuten.</p>
            <Button variant="secondary" size="touch" onClick={() => goTo('settings')}>
              Instellen
            </Button>
          </Card>
        </Reveal>
      )}

      {(!evening || day.morning) && (
        <Reveal delay={0.1}>
          <Checkin
            icon={Sun}
            title="Ochtend"
            done={day.morning}
            summary={(m) => (m.intention ? `Intentie: ${m.intention}` : 'Ingevuld.')}
            Form={MorningForm}
            onSave={saveMorning}
          />
        </Reveal>
      )}

      {evening ? (
        <Reveal delay={0.15}>
          <Checkin
            icon={Moon}
            title="Avond"
            done={day.evening}
            summary={() => 'Dag afgesloten. Goed gedaan.'}
            Form={EveningForm}
            onSave={saveEvening}
          />
        </Reveal>
      ) : (
        <p className="pt-1 text-center text-sm text-muted-foreground">De avondcheck-in verschijnt om {EVENING_HOUR}:00.</p>
      )}
    </>
  )
}

function Checkin({ icon: Icon, title, done, summary, Form, onSave }) {
  const [editing, setEditing] = useState(false)

  if (done && !editing) {
    return (
      <Card className="flex-row items-center gap-4 rounded-[1.5rem] border-0 bg-secondary px-5 py-5 text-secondary-foreground shadow-none">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card/60">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold">{title}</h2>
          <p className="truncate text-sm opacity-85">{summary(done)}</p>
        </div>
        <Button variant="ghost" size="icon-lg" className="rounded-xl" onClick={() => setEditing(true)} aria-label={`${title} aanpassen`}>
          <Pencil />
        </Button>
      </Card>
    )
  }
  return <Form icon={Icon} initial={done} onSave={(v) => (onSave(v), setEditing(false))} />
}

function FormCard({ icon: Icon, title, onSubmit, children }) {
  return (
    <Card className="gap-6 rounded-[1.5rem] border-0 px-5 py-6 shadow-soft sm:px-6">
      <form className="flex flex-col gap-6" onSubmit={(e) => (e.preventDefault(), onSubmit())}>
        <h2 className="flex items-center gap-2.5 text-lg font-bold">
          <Icon className="size-5 text-primary" aria-hidden="true" />
          {title}
        </h2>
        {children}
      </form>
    </Card>
  )
}

function TextField({ id, label, ...props }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-[0.95rem] font-semibold">
        {label}
      </Label>
      <Input id={id} className="h-12 rounded-xl bg-muted px-4 text-base" {...props} />
    </div>
  )
}

function MorningForm({ icon, initial = {}, onSave }) {
  const [sleep, setSleep] = useState(initial.sleep ?? 3)
  const [energy, setEnergy] = useState(initial.energy ?? 5)
  const [urge, setUrge] = useState(initial.urge ?? 2)
  const [intention, setIntention] = useState(initial.intention ?? '')

  return (
    <FormCard icon={icon} title="Ochtend" onSubmit={() => onSave({ sleep, energy, urge, intention })}>
      <Scale label="Slaap" value={sleep} onChange={setSleep} max={5} low="slecht" high="goed" />
      <Scale label="Energie" value={energy} onChange={setEnergy} low="leeg" high="vol" />
      <Scale label="Drang" value={urge} onChange={setUrge} low="geen" high="heel sterk" />
      <TextField
        id="intention"
        label="Eén intentie voor vandaag"
        value={intention}
        onChange={(e) => setIntention(e.target.value)}
        placeholder="Bijvoorbeeld: lunchen zonder telefoon"
      />
      <Button type="submit" size="touch">
        Opslaan
      </Button>
    </FormCard>
  )
}

function EveningForm({ icon, initial = {}, onSave }) {
  const [proud, setProud] = useState(initial.proud ?? '')
  const [hard, setHard] = useState(initial.hard ?? '')
  const [urge, setUrge] = useState(initial.urge ?? 2)
  const [scroll, setScroll] = useState(initial.scroll ?? 'normaal')

  return (
    <FormCard icon={icon} title="Avond" onSubmit={() => onSave({ proud, hard, urge, scroll })}>
      <TextField id="proud" label="Waar ben je trots op vandaag?" value={proud} onChange={(e) => setProud(e.target.value)} placeholder="Klein mag ook" />
      <TextField id="hard" label="Wat was moeilijk, en deed je toch?" value={hard} onChange={(e) => setHard(e.target.value)} />
      <Scale label="Sterkste drang vandaag" value={urge} onChange={setUrge} low="geen" high="heel sterk" />
      <div className="flex flex-col gap-3">
        <Label className="text-[0.95rem] font-semibold">Hoeveel heb je gescrold?</Label>
        <Chips options={['weinig', 'normaal', 'veel']} value={scroll} onChange={setScroll} label="Hoeveel heb je gescrold?" />
      </div>
      <Button type="submit" size="touch">
        Dag afsluiten
      </Button>
    </FormCard>
  )
}
