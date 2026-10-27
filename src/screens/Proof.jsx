import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '../store.jsx'
import { Chips, Confirm, PageHeader, Reveal } from '../components.jsx'
import Dashy, { useDashyMood } from '../Dashy.jsx'
import { PROOF_TYPES, formatDate, uid } from '../utils.js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

// Typen die je zelf toevoegt; drang, trots en moeilijk komen automatisch binnen.
const MANUAL = ['compliment', 'belofte', 'gesprek', 'anders']

const TONE = {
  drang: 'bg-urge',
  compliment: 'bg-gold',
  belofte: 'bg-gold',
  gesprek: 'bg-gold',
}

export default function Proof() {
  const { data, change } = useStore()
  const { proof } = data
  const [type, setType] = useState(PROOF_TYPES.compliment)
  const [text, setText] = useState('')
  const [filter, setFilter] = useState('Alles')
  const [removing, setRemoving] = useState(null)
  const [mood, react] = useDashyMood(proof.length ? 'proud' : 'curious')

  const count = (...types) => proof.filter((p) => types.includes(p.type)).length
  const typeKey = Object.keys(PROOF_TYPES).find((k) => PROOF_TYPES[k] === type)
  const filterKey = Object.keys(PROOF_TYPES).find((k) => PROOF_TYPES[k] === filter)
  const shown = [...proof].reverse().filter((p) => !filterKey || p.type === filterKey)

  const add = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    change('proof', (list) => [...list, { id: uid(), at: Date.now(), type: typeKey, text: text.trim() }])
    setText('')
    react('starstruck', 2400)
    toast.success('Bewaard in je Bewijsarchief')
  }

  const remove = () => {
    change('proof', (list) => list.filter((p) => p.id !== removing))
    setRemoving(null)
  }

  return (
    <>
      <Reveal className="flex items-end justify-between gap-4">
        <PageHeader eyebrow="Bewijsarchief" title="Feiten, geen gevoel">
          Als je innerlijke criticus iets roept, is dit het tegenbewijs.
        </PageHeader>
        <Dashy state={mood} size={84} label="Dashy" className="mb-1 hidden min-[380px]:block" />
      </Reveal>

      <Reveal delay={0.05} className="grid grid-cols-3 gap-2.5">
        <Stat n={count('drang')} label="drangmomenten gewonnen" />
        <Stat n={count('trots', 'moeilijk')} label="trots en doorgezet" />
        <Stat n={count('compliment', 'gesprek', 'belofte')} label="contact en beloftes" />
      </Reveal>

      <Reveal delay={0.1}>
        <Card className="gap-5 rounded-[1.5rem] border-0 px-5 py-6 shadow-soft sm:px-6">
          <form className="flex flex-col gap-5" onSubmit={add}>
            <h2 className="text-lg font-bold">Bewijs toevoegen</h2>
            <Chips options={MANUAL.map((k) => PROOF_TYPES[k])} value={type} onChange={setType} label="Soort bewijs" />
            <div className="flex flex-col gap-2">
              <Label htmlFor="proof-text" className="text-[0.95rem] font-semibold">
                Wat gebeurde er?
              </Label>
              <Textarea id="proof-text" rows={2} value={text} onChange={(e) => setText(e.target.value)} className="rounded-xl bg-muted px-4 py-3 text-base" />
            </div>
            <Button type="submit" size="touch" disabled={!text.trim()}>
              <Plus aria-hidden="true" />
              Bewaren
            </Button>
          </form>
        </Card>
      </Reveal>

      <Reveal delay={0.15} className="-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
        <div className="w-max">
          <Chips options={['Alles', ...Object.values(PROOF_TYPES)]} value={filter} onChange={setFilter} label="Filter" />
        </div>
      </Reveal>

      {shown.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Nog niets hier. Het eerste bewijs komt vanzelf.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {shown.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: -10 }}
                transition={{ duration: 0.22 }}
              >
                <Card className="flex-row items-start gap-3 rounded-2xl border-0 px-4 py-4 shadow-soft">
                  <span className={cn('mt-1.5 size-2.5 shrink-0 rounded-full bg-primary', TONE[p.type])} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground/80">{PROOF_TYPES[p.type]}</span>
                      <span>{formatDate(p.at)}</span>
                    </div>
                    <p className="mt-1 break-words">{p.text}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="-mr-1 shrink-0 rounded-xl text-muted-foreground" onClick={() => setRemoving(p.id)} aria-label="Verwijderen">
                    <Trash2 />
                  </Button>
                </Card>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <Confirm
        open={removing !== null}
        onOpenChange={(o) => !o && setRemoving(null)}
        title="Dit bewijs verwijderen?"
        description="Het verdwijnt uit je archief. Dat kun je niet ongedaan maken."
        action="Verwijderen"
        destructive
        onConfirm={remove}
      />
    </>
  )
}

function Stat({ n, label }) {
  return (
    <Card className="gap-1 rounded-2xl border-0 px-3 py-4 shadow-soft">
      <strong className="text-3xl leading-none font-extrabold text-primary tabular-nums">{n}</strong>
      <span className="text-xs leading-snug text-muted-foreground">{label}</span>
    </Card>
  )
}
