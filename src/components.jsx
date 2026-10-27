export function Scale({ label, value, onChange, low, high, max = 10 }) {
  return (
    <label className="field">
      <span className="field-label">
        {label} <strong className="scale-value">{value}</strong>
      </span>
      <input type="range" min="0" max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span className="scale-ends">
        <span>{low}</span>
        <span>{high}</span>
      </span>
    </label>
  )
}

export function Chips({ options, value, onChange, multi = false }) {
  const toggle = (opt) => {
    if (!multi) return onChange(opt)
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt])
  }
  return (
    <div className="chips">
      {options.map((opt) => {
        const on = multi ? value.includes(opt) : value === opt
        return (
          <button type="button" key={opt} className={on ? 'chip on' : 'chip'} aria-pressed={on} onClick={() => toggle(opt)}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}
