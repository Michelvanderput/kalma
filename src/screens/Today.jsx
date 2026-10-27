import { useState } from 'react'
import { useStore } from '../store.jsx'
import { Chips, Scale } from '../components.jsx'
import { daysSince, greeting, todayKey, uid } from '../utils.js'

export default function Today({ onUrge, goTo }) {
  const { data, change } = useStore()
  const { settings, checkins } = data
  const key = todayKey()
  const day = checkins[key] ?? {}
  const clean = settings.cleanSince ? daysSince(settings.cleanSince) : null

  const saveCheckin = (part, values) =>
    change('checkins', (all) => ({ ...all, [key]: { ...all[key], [part]: { ...values, at: Date.now() } } }))

  const saveEvening = (values) => {
    saveCheckin('evening', values)
    const at = Date.now()
    const entries = [
      values.proud && { id: uid(), at, type: 'trots', text: values.proud },
      values.hard && { id: uid(), at, type: 'moeilijk', text: values.hard },
    ].filter(Boolean)
    if (entries.length) change('proof', (list) => [...list, ...entries])
  }

  return (
    <>
      <header className="hero">
        <p className="eyebrow">{greeting(settings.name)}</p>
        {clean !== null ? (
          <h1>
            <span className="big-number">{clean}</span> dagen vrij
          </h1>
        ) : (
          <h1>Welkom bij Kalma</h1>
        )}
      </header>

      <button className="urge-button" onClick={onUrge}>
        <span className="urge-title">Ik voel drang</span>
        <span className="urge-sub">Druk hier. Tien minuten, stap voor stap.</span>
      </button>

      {!settings.name && (
        <section className="card">
          <h2>Eerst even instellen</h2>
          <p className="muted">Je naam, je startdatum, je buddy en een bericht aan jezelf. Twee minuten.</p>
          <button className="secondary" onClick={() => goTo('settings')}>
            Instellen
          </button>
        </section>
      )}

      {day.morning ? (
        <DoneCard title="Ochtend" text={day.morning.intention ? `Intentie: ${day.morning.intention}` : 'Ingevuld.'} />
      ) : (
        <MorningForm onSave={(v) => saveCheckin('morning', v)} />
      )}

      {day.evening ? (
        <DoneCard title="Avond" text="Ingevuld. Goed gedaan dat je de dag afsluit." />
      ) : (
        <EveningForm onSave={saveEvening} />
      )}
    </>
  )
}

function DoneCard({ title, text }) {
  return (
    <section className="card done">
      <h2>{title}</h2>
      <p>{text}</p>
    </section>
  )
}

function MorningForm({ onSave }) {
  const [sleep, setSleep] = useState(3)
  const [energy, setEnergy] = useState(5)
  const [urge, setUrge] = useState(2)
  const [intention, setIntention] = useState('')

  return (
    <form className="card" onSubmit={(e) => (e.preventDefault(), onSave({ sleep, energy, urge, intention }))}>
      <h2>Ochtend</h2>
      <Scale label="Slaap" value={sleep} onChange={setSleep} max={5} low="slecht" high="goed" />
      <Scale label="Energie" value={energy} onChange={setEnergy} low="leeg" high="vol" />
      <Scale label="Drang" value={urge} onChange={setUrge} low="geen" high="heel sterk" />
      <label className="field">
        <span className="field-label">Eén intentie voor vandaag</span>
        <input value={intention} onChange={(e) => setIntention(e.target.value)} placeholder="Bijvoorbeeld: lunchen zonder telefoon" />
      </label>
      <button className="primary">Opslaan</button>
    </form>
  )
}

function EveningForm({ onSave }) {
  const [proud, setProud] = useState('')
  const [hard, setHard] = useState('')
  const [urge, setUrge] = useState(2)
  const [scroll, setScroll] = useState('normaal')

  return (
    <form className="card" onSubmit={(e) => (e.preventDefault(), onSave({ proud, hard, urge, scroll }))}>
      <h2>Avond</h2>
      <label className="field">
        <span className="field-label">Waar ben je trots op vandaag?</span>
        <input value={proud} onChange={(e) => setProud(e.target.value)} placeholder="Klein mag ook" />
      </label>
      <label className="field">
        <span className="field-label">Wat was moeilijk, en deed je toch?</span>
        <input value={hard} onChange={(e) => setHard(e.target.value)} />
      </label>
      <Scale label="Sterkste drang vandaag" value={urge} onChange={setUrge} low="geen" high="heel sterk" />
      <div className="field">
        <span className="field-label">Hoeveel heb je gescrold?</span>
        <Chips options={['weinig', 'normaal', 'veel']} value={scroll} onChange={setScroll} />
      </div>
      <button className="primary">Dag afsluiten</button>
    </form>
  )
}
