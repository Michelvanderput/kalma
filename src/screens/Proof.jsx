import { useState } from 'react'
import { useStore } from '../store.jsx'
import { Chips } from '../components.jsx'
import { PROOF_TYPES, formatDate, uid } from '../utils.js'

// Typen die je zelf toevoegt; drang, trots en moeilijk komen automatisch binnen.
const MANUAL = ['compliment', 'belofte', 'gesprek', 'anders']

export default function Proof() {
  const { data, change } = useStore()
  const { proof } = data
  const [type, setType] = useState(PROOF_TYPES.compliment)
  const [text, setText] = useState('')
  const [filter, setFilter] = useState('Alles')

  const count = (t) => proof.filter((p) => p.type === t).length
  const typeKey = Object.keys(PROOF_TYPES).find((k) => PROOF_TYPES[k] === type)
  const filterKey = Object.keys(PROOF_TYPES).find((k) => PROOF_TYPES[k] === filter)
  const shown = [...proof].reverse().filter((p) => !filterKey || p.type === filterKey)

  const add = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    change('proof', (list) => [...list, { id: uid(), at: Date.now(), type: typeKey, text: text.trim() }])
    setText('')
  }

  const remove = (id) => {
    if (confirm('Dit bewijs verwijderen?')) change('proof', (list) => list.filter((p) => p.id !== id))
  }

  return (
    <>
      <header className="hero">
        <p className="eyebrow">Bewijsarchief</p>
        <h1>Feiten, geen gevoel</h1>
        <p className="muted">Als je innerlijke criticus iets roept, is dit het tegenbewijs.</p>
      </header>

      <div className="stats">
        <Stat n={count('drang')} label="drangmomenten gewonnen" />
        <Stat n={count('trots') + count('moeilijk')} label="trots en doorgezet" />
        <Stat n={count('compliment') + count('gesprek') + count('belofte')} label="contact en beloftes" />
      </div>

      <form className="card" onSubmit={add}>
        <h2>Bewijs toevoegen</h2>
        <Chips options={MANUAL.map((k) => PROOF_TYPES[k])} value={type} onChange={setType} />
        <label className="field">
          <span className="field-label">Wat gebeurde er?</span>
          <textarea rows="2" value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <button className="primary">Bewaren</button>
      </form>

      <Chips options={['Alles', ...Object.values(PROOF_TYPES)]} value={filter} onChange={setFilter} />

      {shown.length === 0 ? (
        <p className="muted empty">Nog niets hier. Het eerste bewijs komt vanzelf.</p>
      ) : (
        <ul className="proof-list">
          {shown.map((p) => (
            <li key={p.id} className={`proof proof-${p.type}`}>
              <div className="proof-meta">
                <span>{PROOF_TYPES[p.type]}</span>
                <span>{formatDate(p.at)}</span>
              </div>
              <p>{p.text}</p>
              <button className="link" onClick={() => remove(p.id)}>
                Verwijderen
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function Stat({ n, label }) {
  return (
    <div className="stat">
      <strong>{n}</strong>
      <span>{label}</span>
    </div>
  )
}
