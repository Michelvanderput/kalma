import { useRef, useState } from 'react'
import { Download, ExternalLink, LifeBuoy, RotateCcw, ShieldCheck, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '../store.jsx'
import { Confirm, PageHeader, Reveal } from '../components.jsx'
import Dashy, { useDashyMood } from '../Dashy.jsx'
import { daysSince, todayKey } from '../utils.js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const KEYS = ['settings', 'checkins', 'urges', 'proof']

export default function Settings() {
  const { data, change } = useStore()
  const [form, setForm] = useState({ name: '', cleanSince: '', buddyName: '', buddyPhone: '', message: '', ...data.settings })
  const [confirmRestart, setConfirmRestart] = useState(false)
  const [pendingBackup, setPendingBackup] = useState(null)
  const fileInput = useRef(null)
  const [mood, react] = useDashyMood('idle')

  const field = (name) => ({
    id: name,
    value: form[name],
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
  })

  const save = (e) => {
    e.preventDefault()
    change('settings', (s) => ({ ...s, ...form }))
    react('nodding')
    toast.success('Opgeslagen')
  }

  // Een terugval wist niets uit: de vorige periode blijft bewaard.
  const restart = () => {
    const today = todayKey()
    change('settings', (s) => ({
      ...s,
      cleanSince: today,
      streaks: s.cleanSince ? [...(s.streaks ?? []), { from: s.cleanSince, days: daysSince(s.cleanSince) }] : s.streaks,
    }))
    setForm((f) => ({ ...f, cleanSince: today }))
    react('determined', 3000)
    toast('Dag één. Je staat er weer.')
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), ...data }, null, 2)], {
      type: 'application/json',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `kalma-backup-${todayKey()}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    toast.success('Back-up gedownload')
  }

  const readBackup = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      const backup = JSON.parse(await file.text())
      if (!backup.settings || !Array.isArray(backup.proof)) throw new Error('geen Kalma-back-up')
      setPendingBackup(backup)
    } catch {
      react('confused')
      toast.error('Dit bestand kan ik niet lezen als Kalma-back-up.')
    }
  }

  const restoreBackup = () => {
    for (const key of KEYS) {
      if (pendingBackup[key]) change(key, () => pendingBackup[key])
    }
    setForm((f) => ({ ...f, ...pendingBackup.settings }))
    setPendingBackup(null)
    react('success')
    toast.success('Back-up teruggezet')
  }

  const backupDate = pendingBackup?.exportedAt ? new Date(pendingBackup.exportedAt).toLocaleDateString('nl-NL') : 'onbekende datum'
  const streaks = data.settings.streaks ?? []
  const longest = Math.max(0, ...streaks.map((s) => s.days), data.settings.cleanSince ? daysSince(data.settings.cleanSince) : 0)

  return (
    <>
      <Reveal className="flex items-end justify-between gap-4">
        <PageHeader eyebrow="Ik" title="Jouw vangnet" />
        <Dashy state={mood} size={84} label="Dashy" className="mb-1" />
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="rounded-[1.5rem] border-0 px-5 py-6 shadow-soft sm:px-6">
          <form className="flex flex-col gap-5" onSubmit={save}>
            <Field label="Je naam">
              <Input {...field('name')} autoComplete="given-name" className={inputClass} />
            </Field>
            <Field label="Vrij sinds" htmlFor="cleanSince">
              <Input type="date" {...field('cleanSince')} className={inputClass} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Naam van je buddy" htmlFor="buddyName">
                <Input {...field('buddyName')} placeholder="Iemand die je mag bellen" className={inputClass} />
              </Field>
              <Field label="Telefoonnummer buddy" htmlFor="buddyPhone">
                <Input type="tel" {...field('buddyPhone')} placeholder="06 12345678" className={inputClass} />
              </Field>
            </div>
            <Field label="Bericht aan jezelf, voor als de drang komt" htmlFor="message">
              <Textarea
                rows={5}
                {...field('message')}
                placeholder="Schrijf dit op een goede dag. Wat wil je dan horen?"
                className="rounded-xl bg-muted px-4 py-3 text-base"
              />
            </Field>
            <Button type="submit" size="touch">
              Opslaan
            </Button>
          </form>
        </Card>
      </Reveal>

      <Reveal delay={0.1}>
        <Section icon={RotateCcw} title="Terugval">
          <p className="text-muted-foreground text-pretty">
            Het kan gebeuren. Het is informatie, geen oordeel. Je langste periode tot nu toe:{' '}
            <strong className="text-foreground">{longest} dagen</strong>. Die blijft van jou.
          </p>
          <Button variant="secondary" size="touch" onClick={() => setConfirmRestart(true)}>
            Opnieuw beginnen vanaf vandaag
          </Button>
        </Section>
      </Reveal>

      <Reveal delay={0.15}>
        <Section icon={LifeBuoy} title="Hulp buiten de app">
          <ul className="flex flex-col gap-2">
            <HelpLink href="https://www.loketkansspel.nl" title="Loket Kansspel" text="anoniem advies over gokken" />
            <HelpLink href="https://kansspelautoriteit.nl" title="Kansspelautoriteit" text="informatie over Cruks, het uitsluitingsregister" />
          </ul>
        </Section>
      </Reveal>

      <Reveal delay={0.2}>
        <Section icon={ShieldCheck} title="Je data">
          <p className="text-muted-foreground">Alles staat alleen op dit toestel. Maak af en toe een back-up.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" size="touch" onClick={exportData}>
              <Download aria-hidden="true" />
              Back-up downloaden
            </Button>
            <Button variant="secondary" size="touch" onClick={() => fileInput.current.click()}>
              <Upload aria-hidden="true" />
              Back-up terugzetten
            </Button>
            <input ref={fileInput} type="file" accept="application/json,.json" onChange={readBackup} hidden />
          </div>
        </Section>
      </Reveal>

      <Confirm
        open={confirmRestart}
        onOpenChange={setConfirmRestart}
        title="Opnieuw beginnen vanaf vandaag?"
        description="Je teller start op nul. Je vorige periode blijft bewaard, en alles in je Bewijsarchief ook."
        action="Opnieuw beginnen"
        onConfirm={restart}
      />
      <Confirm
        open={pendingBackup !== null}
        onOpenChange={(o) => !o && setPendingBackup(null)}
        title={`Back-up van ${backupDate} terugzetten?`}
        description="Wat nu in de app staat wordt vervangen door de back-up."
        action="Terugzetten"
        onConfirm={restoreBackup}
      />
    </>
  )
}

const inputClass = 'h-12 rounded-xl bg-muted px-4 text-base'

function Field({ label, htmlFor, children }) {
  const id = htmlFor ?? children.props.id
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={id} className="text-[0.95rem] font-semibold">
        {label}
      </Label>
      {children}
    </div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <Card className="gap-4 rounded-[1.5rem] border-0 px-5 py-6 shadow-soft sm:px-6">
      <h2 className="flex items-center gap-2.5 text-lg font-bold">
        <Icon className="size-5 text-primary" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </Card>
  )
}

function HelpLink({ href, title, text }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3 transition-colors outline-none hover:bg-secondary focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-primary">{title}</span>
          <span className="block text-sm text-muted-foreground">{text}</span>
        </span>
        <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </a>
    </li>
  )
}
