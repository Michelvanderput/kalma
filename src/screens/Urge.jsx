import { useEffect, useState } from 'react'
import { useStore } from '../store.jsx'
import { Chips, Scale } from '../components.jsx'
import { uid, whatsappNumber } from '../utils.js'

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

  const finish = () => {
    const at = Date.now()
    change('urges', (list) => [...list, { id: uid(), at, before, after, triggers, note }])
    change('proof', (list) => [
      ...list,
      { id: uid(), at, type: 'drang', text: note || `Drang van ${before} naar ${after}. Niet toegegeven.` },
    ])
    setStep(5)
  }

  return (
    <div className="urge">
      <button className="urge-close" onClick={onClose} aria-label="Sluiten">
        Sluiten
      </button>

      {step === 0 && <Message settings={settings} onNext={() => setStep(1)} />}

      {step === 1 && (
        <section className="urge-step">
          <h1>Hoe sterk is de drang nu?</h1>
          <Scale label="Drang" value={before} onChange={setBefore} low="rustig" high="heel sterk" />
          <button className="primary" onClick={() => setStep(2)}>
            Verder
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="urge-step">
          <h1>Wat zit eronder?</h1>
          <p className="muted">Kies wat past. Meer dan één mag.</p>
          <Chips options={TRIGGERS} value={triggers} onChange={setTriggers} multi />
          <button className="primary" onClick={() => setStep(3)}>
            Verder
          </button>
        </section>
      )}

      {step === 3 && <Surf settings={settings} onDone={() => setStep(4)} />}

      {step === 4 && (
        <section className="urge-step">
          <h1>En nu?</h1>
          <Scale label="Drang" value={after} onChange={setAfter} low="rustig" high="heel sterk" />
          <label className="field">
            <span className="field-label">Wat hielp? (optioneel)</span>
            <textarea rows="3" value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <button className="primary" onClick={finish}>
            Opslaan
          </button>
        </section>
      )}

      {step === 5 && (
        <section className="urge-step center">
          <p className="eyebrow">Gewonnen</p>
          <h1 className="big-number">{urges.length}</h1>
          <p>
            drangmomenten heb je zo doorstaan. Dit staat nu in je Bewijsarchief, en niemand kan het je
            afpakken.
          </p>
          <button className="primary" onClick={onClose}>
            Terug naar vandaag
          </button>
        </section>
      )}
    </div>
  )
}

function Message({ settings, onNext }) {
  return (
    <section className="urge-step">
      <p className="eyebrow">Je drukte op de knop. Dat is al winnen.</p>
      {settings.message ? (
        <blockquote className="letter">{settings.message}</blockquote>
      ) : (
        <blockquote className="letter">
          Dit gevoel is echt, en het gaat over. Je hoeft nu niets te doen behalve de volgende tien minuten
          doorkomen.
        </blockquote>
      )}
      <button className="primary" onClick={onNext}>
        Verder
      </button>
    </section>
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
  // Ademritme: 4 seconden in, 6 seconden uit.
  const inhale = ((SURF_MINUTES * 60000 - left) / 1000) % 10 < 4
  const wa = whatsappNumber(settings.buddyPhone)
  const waText = encodeURIComponent('Hey, ik heb even een lastig moment. Kun je me bellen?')

  return (
    <section className="urge-step center">
      <h1>Surf op de golf</h1>
      <p className="muted">Een drang komt op, piekt en zakt weer. Jij hoeft alleen te ademen.</p>
      <div className={inhale ? 'breath in' : 'breath out'}>
        <span>{inhale ? 'Adem in' : 'Adem uit'}</span>
      </div>
      <p className="timer" aria-live="off">
        {min}:{String(sec).padStart(2, '0')}
      </p>
      {settings.buddyPhone && (
        <div className="buddy-row">
          <a className="secondary" href={`tel:${settings.buddyPhone}`}>
            Bel {settings.buddyName || 'buddy'}
          </a>
          <a className="secondary" href={`https://wa.me/${wa}?text=${waText}`} target="_blank" rel="noreferrer">
            App {settings.buddyName || 'buddy'}
          </a>
        </div>
      )}
      <button className={left === 0 ? 'primary' : 'ghost'} onClick={onDone}>
        {left === 0 ? 'Verder' : 'Ik ben er klaar voor'}
      </button>
    </section>
  )
}
