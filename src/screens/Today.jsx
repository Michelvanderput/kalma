import { useState } from 'react'
import { useStore } from '../store.jsx'
import { Chips, Scale } from '../components.jsx'
import Companion from '../Companion.jsx'
import { daysSince, greeting, todayKey, uid } from '../utils.js'

// Vanaf dit uur maakt de ochtendcheck-in plaats voor de avond.
const EVENING_HOUR = 17

export default function Today({ onUrge, goTo }) {
  const { data, change } = useStore()
  const { settings, checkins } = data
  const key = todayKey()
  const day = checkins[key] ?? {}
  const clean = settings.cleanSince ? daysSince(settings.cleanSince) : null
  const hour = new Date().getHours()
  const evening = hour >= EVENING_HOUR
  const mood = hour >= 22 || hour < 6 ? 'slaperig' : day.evening ? 'trots' : day.morning ? 'blij' : 'rust'

  const saveCheckin = (part, values) =>
    change('checkins', (all) => ({ ...all, [key]: { ...all[key], [part]: { ...values, at: Date.now() } } }))

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
  }

  return (
    <>
      <header className="hero hero-row">
        <div>
          <p className="eyebrow">{greeting(settings.name)}</p>
          {clean !== null ? (
            <h1>
              <span className="big-number">{clean}</span>
              <span className="big-label">dagen vrij</span>
            </h1>
          ) : (
            <h1>Welkom bij Kalma</h1>
          )}
        </div>
        <Companion mood={mood} />
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

      {(!evening || day.morning) && (
        <Checkin
          done={day.morning}
          summary={(m) => (m.intention ? `Intentie: ${m.intention}` : 'Ingevuld.')}
          title="Ochtend"
          Form={MorningForm}
          onSave={(v) => saveCheckin('morning', v)}
        />
      )}

      {evening ? (
        <Checkin
          done={day.evening}
          summary={() => 'Dag afgesloten. Goed gedaan.'}
          title="Avond"
          Form={EveningForm}
          onSave={saveEvening}
        />
      ) : (
        <p className="muted hint">De avondcheck-in verschijnt om {EVENING_HOUR}:00.</p>
      )}
    </>
  )
}

function Checkin({ done, summary, title, Form, onSave }) {
  const [editing, setEditing] = useState(false)

  if (done && !editing) {
    return (
      <section className="card done">
        <div className="card-head">
          <h2>{title}</h2>
          <button className="link" onClick={() => setEditing(true)}>
            Aanpassen
          </button>
        </div>
        <p>{summary(done)}</p>
      </section>
    )
  }
  return <Form initial={done} onSave={(v) => (onSave(v), setEditing(false))} />
}

function MorningForm({ initial = {}, onSave }) {
  const [sleep, setSleep] = useState(initial.sleep ?? 3)
  const [energy, setEnergy] = useState(initial.energy ?? 5)
  const [urge, setUrge] = useState(initial.urge ?? 2)
  const [intention, setIntention] = useState(initial.intention ?? '')

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

function EveningForm({ initial = {}, onSave }) {
  const [proud, setProud] = useState(initial.proud ?? '')
  const [hard, setHard] = useState(initial.hard ?? '')
  const [urge, setUrge] = useState(initial.urge ?? 2)
  const [scroll, setScroll] = useState(initial.scroll ?? 'normaal')

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
