import { motion } from 'motion/react'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

// Bevestiging in de stijl van de app, in plaats van de kale browser-confirm.
export function Confirm({ open, onOpenChange, title, description, action, onConfirm, destructive = false }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100%-2rem)] rounded-[1.5rem]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="touch">Annuleren</AlertDialogCancel>
          <AlertDialogAction size="touch" variant={destructive ? 'destructive' : 'default'} onClick={onConfirm}>
            {action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function Scale({ label, value, onChange, low, high, max = 10 }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <Label className="text-[0.95rem] font-semibold">{label}</Label>
        <span className="min-w-9 rounded-full bg-secondary px-2.5 py-0.5 text-center text-sm font-bold tabular-nums text-secondary-foreground">
          {value}
        </span>
      </div>
      <Slider value={[value]} min={0} max={max} step={1} onValueChange={([v]) => onChange(v)} aria-label={label} />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  )
}

export function Chips({ options, value, onChange, multi = false, label }) {
  const pill =
    'h-10 flex-none rounded-full border border-border bg-muted px-4 text-[0.925rem] font-medium shadow-none data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'

  if (multi) {
    return (
      <ToggleGroup type="multiple" value={value} onValueChange={onChange} spacing={2} className="w-full flex-wrap" aria-label={label}>
        {options.map((opt) => (
          <ToggleGroupItem key={opt} value={opt} className={pill}>
            {opt}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    )
  }
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v)}
      spacing={2}
      className="w-full flex-wrap"
      aria-label={label}
    >
      {options.map((opt) => (
        <ToggleGroupItem key={opt} value={opt} className={pill}>
          {opt}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

// Rustige in-animatie voor kaarten en stappen.
export function Reveal({ children, className, delay = 0 }) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

export function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="px-1 pt-2">
      <p className="mb-1 text-sm font-semibold text-muted-foreground">{eyebrow}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-balance">{title}</h1>
      {children && <p className="mt-2 text-muted-foreground text-pretty">{children}</p>}
    </header>
  )
}
