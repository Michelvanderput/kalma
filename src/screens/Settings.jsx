import { useEffect, useRef, useState } from 'react'
import { useStore, loadVoice, saveVoice } from '../store.jsx'
import { daysSince, todayKey } from '../utils.js'

export default function Settings() {
  const { data, change } = useStore()
  const [form, setForm] = useState({ name: '', cleanSince: '', buddyName: '', buddyPhone: '', message: '', ...data.settings })
  const [saved, setSaved] = useState(false)

  const field = (name) => ({
    value: form[name],
    onChange: (e) => (setForm({ ...form, [name]: e.target.value }), setSaved(false)),
  })

  const save = (e) => {
    e.preventDefault()
    change('settings', (s) => ({ ...s, ...form }))
    setSaved(true)
  }

  // Een terugval wist niets uit: de vorige periode blijft bewaard.
  const restart = () => {
    if (!confirm('Opnieuw beginnen vanaf vandaag? Je vorige periode blijft bewaard.')) return
    const today = todayKey()
    change('settings', (s) => ({
      ...s,
      cleanSince: today,
      streaks: s.cleanSince ? [...(s.streaks ?? []), { from: s.cleanSince, days: daysSince(s.cleanSince) }] : s.streaks,
    }))
    setForm((f) => ({ ...f, cleanSince: today }))
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
  }

  const streaks = data.settings.streaks ?? []
  const longest = Math.max(0, ...streaks.map((s) => s.days), data.settings.cleanSince ? daysSince(data.settings.cleanSince) : 0)

  return (
    <>
      <header className="hero">
        <p className="eyebrow">Ik</p>
        <h1>Jouw vangnet</h1>
      </header>

      <form className="card" onSubmit={save}>
        <label className="field">
          <span className="field-label">Je naam</span>
          <input {...field('name')} />
        </label>
        <label className="field">
          <span className="field-label">Vrij sinds</span>
          <input type="date" {...field('cleanSince')} />
        </label>
        <label className="field">
          <span className="field-label">Naam van je buddy</span>
          <input {...field('buddyName')} placeholder="Iemand die je mag bellen als het lastig is" />
        </label>
        <label className="field">
          <span className="field-label">Telefoonnummer buddy</span>
          <input type="tel" {...field('buddyPhone')} placeholder="06 12345678" />
        </label>
        <label className="field">
          <span className="field-label">Bericht aan jezelf, voor als de drang komt</span>
          <textarea rows="5" {...field('message')} placeholder="Schrijf dit op een goede dag. Wat wil je dan horen?" />
        </label>
        <button className="primary">{saved ? 'Opgeslagen' : 'Opslaan'}</button>
      </form>

      <VoiceRecorder />

      <section className="card">
        <h2>Terugval</h2>
        <p className="muted">
          Het kan gebeuren. Het is informatie, geen oordeel. Je langste periode tot nu toe: {longest} dagen. Die
          blijft van jou.
        </p>
        <button className="secondary" onClick={restart}>
          Opnieuw beginnen vanaf vandaag
        </button>
      </section>

      <section className="card">
        <h2>Hulp buiten de app</h2>
        <ul className="links">
          <li>
            <a href="https://www.loketkansspel.nl" target="_blank" rel="noreferrer">
              Loket Kansspel
            </a>{' '}
            anoniem advies over gokken
          </li>
          <li>
            <a href="https://kansspelautoriteit.nl" target="_blank" rel="noreferrer">
              Kansspelautoriteit
            </a>{' '}
            informatie over Cruks, het uitsluitingsregister
          </li>
        </ul>
      </section>

      <section className="card">
        <h2>Je data</h2>
        <p className="muted">Alles staat alleen op dit toestel. Maak af en toe een back-up.</p>
        <button className="secondary" onClick={exportData}>
          Back-up downloaden
        </button>
      </section>
    </>
  )
}

function VoiceRecorder() {
  const [url, setUrl] = useState(null)
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState('')
  const recorder = useRef(null)

  useEffect(() => {
    loadVoice().then((blob) => blob && setUrl(URL.createObjectURL(blob)))
  }, [])

  const start = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const chunks = []
      const rec = new MediaRecorder(stream)
      rec.ondataavailable = (e) => chunks.push(e.data)
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunks, { type: rec.mimeType })
        await saveVoice(blob)
        setUrl(URL.createObjectURL(blob))
      }
      rec.start()
      recorder.current = rec
      setRecording(true)
    } catch {
      setError('Geen toegang tot de microfoon. Check de rechten in je browser.')
    }
  }

  const stop = () => {
    recorder.current?.stop()
    setRecording(false)
  }

  return (
    <section className="card">
      <h2>Spraakbericht aan jezelf</h2>
      <p className="muted">Je eigen stem werkt sterker dan tekst. Dit speelt af als je op de drangknop drukt.</p>
      {url && <audio controls src={url} className="voice" />}
      <button className={recording ? 'primary recording' : 'secondary'} onClick={recording ? stop : start}>
        {recording ? 'Stop opname' : url ? 'Opnieuw opnemen' : 'Opnemen'}
      </button>
      {error && <p className="error">{error}</p>}
    </section>
  )
}
