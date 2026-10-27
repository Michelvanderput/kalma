import { useState } from 'react'
import Today from './screens/Today.jsx'
import Urge from './screens/Urge.jsx'
import Proof from './screens/Proof.jsx'
import Settings from './screens/Settings.jsx'

const ICONS = {
  today: <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" />,
  proof: <path d="M12 3.5 14.6 9l6 .7-4.5 4.1 1.2 5.9L12 16.8l-5.3 2.9 1.2-5.9L3.4 9.7l6-.7z" />,
  settings: (
    <>
      <circle cx="12" cy="8.5" r="3.75" />
      <path d="M4.5 20c.8-3.7 3.8-5.75 7.5-5.75s6.7 2.05 7.5 5.75" />
    </>
  ),
}

const TABS = [
  { id: 'today', label: 'Vandaag' },
  { id: 'proof', label: 'Bewijs' },
  { id: 'settings', label: 'Ik' },
]

// De snelkoppeling op het app-icoon opent /?drang=1 en gaat meteen naar het protocol.
function openedFromShortcut() {
  const params = new URLSearchParams(location.search)
  if (!params.has('drang')) return false
  history.replaceState(null, '', location.pathname)
  return true
}

export default function App() {
  const [tab, setTab] = useState('today')
  const [urgeOpen, setUrgeOpen] = useState(openedFromShortcut)

  if (urgeOpen) return <Urge onClose={() => setUrgeOpen(false)} />

  return (
    <div className="app">
      <main className="screen" key={tab}>
        {tab === 'today' && <Today onUrge={() => setUrgeOpen(true)} goTo={setTab} />}
        {tab === 'proof' && <Proof />}
        {tab === 'settings' && <Settings />}
      </main>
      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'active' : ''}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => setTab(t.id)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {ICONS[t.id]}
            </svg>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
