import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { mountDashy } from './dashy/dashy.js'
import definition from './dashy/dashy.json'
import { cn } from '@/lib/utils'

// Dashy, geëxporteerd uit Dashy Studio. De runtime tekent en animeert zelf,
// volgt de aanwijzer, reageert op tikken en respecteert prefers-reduced-motion.
const Dashy = forwardRef(function Dashy({ state = 'idle', size = 96, label = 'Dashy', className }, ref) {
  const host = useRef(null)
  const api = useRef(null)

  useEffect(() => {
    const dashy = mountDashy(host.current, { definition, initialState: state })
    api.current = dashy
    return () => {
      dashy.destroy()
      api.current = null
    }
    // Alleen bij mount: daarna sturen we via setState.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    api.current?.setState(state)
  }, [state])

  useImperativeHandle(ref, () => ({
    play: (name) => api.current?.play(name),
    poke: () => api.current?.poke(),
  }))

  return (
    <div
      ref={host}
      className={cn('dashy-host', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    />
  )
})

export default Dashy

// Een basisstemming met af en toe een korte reactie erbovenop.
export function useDashyMood(base) {
  const [flash, setFlash] = useState(null)
  const timer = useRef(null)

  const react = useCallback((state, ms = 2200) => {
    clearTimeout(timer.current)
    setFlash(state)
    timer.current = setTimeout(() => setFlash(null), ms)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  return [flash ?? base, react]
}
