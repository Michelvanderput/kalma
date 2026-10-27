import { useState } from 'react'
import Today from './screens/Today.jsx'
import Urge from './screens/Urge.jsx'
import Proof from './screens/Proof.jsx'
import Settings from './screens/Settings.jsx'

const TABS = [
  { id: 'today', label: 'Vandaag' },
  { id: 'proof', label: 'Bewijs' },
  { id: 'settings', label: 'Ik' },
]

export default function App() {
  const [tab, setTab] = useState('today')
  const [urgeOpen, setUrgeOpen] = useState(false)

  if (urgeOpen) return <Urge onClose={() => setUrgeOpen(false)} />

  return (
    <div className="app">
      <main className="screen">
        {tab === 'today' && <Today onUrge={() => setUrgeOpen(true)} goTo={setTab} />}
        {tab === 'proof' && <Proof />}
        {tab === 'settings' && <Settings />}
      </main>
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
