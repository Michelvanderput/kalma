import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { get, set } from 'idb-keyval'

// Alles staat lokaal in IndexedDB op dit toestel. Niets gaat naar een server.
const DEFAULTS = {
  settings: {},
  checkins: {}, // { 'YYYY-MM-DD': { morning, evening } }
  urges: [], // gelogde drangmomenten
  proof: [], // het Bewijsarchief
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [data, setData] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    Promise.all(Object.entries(DEFAULTS).map(([key, fallback]) => get(key).then((v) => [key, v ?? fallback]))).then(
      (entries) => {
        ref.current = Object.fromEntries(entries)
        setData(ref.current)
      },
    )
    // Vraag de browser om de data niet op te ruimen bij weinig opslagruimte.
    navigator.storage?.persist?.()
  }, [])

  const change = useCallback((key, fn) => {
    const value = fn(ref.current[key])
    ref.current = { ...ref.current, [key]: value }
    setData(ref.current)
    set(key, value)
  }, [])

  if (!data) return null
  return <StoreContext.Provider value={{ data, change }}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)
