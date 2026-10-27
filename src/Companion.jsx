// Een rustige metgezel in de stijl van Dashy: een zacht blok met twee ogen.
// Hij reageert op het moment, maar vraagt nooit om aandacht.
const EYES = {
  rust: (
    <g className="eyes-blink">
      <rect x="40" y="44" width="11" height="19" rx="5.5" />
      <rect x="69" y="44" width="11" height="19" rx="5.5" />
    </g>
  ),
  blij: (
    <g className="eyes-line">
      <path d="M39 58 q6.5 -10 13 0" />
      <path d="M68 58 q6.5 -10 13 0" />
    </g>
  ),
  trots: (
    <>
      <g className="eyes-line">
        <path d="M39 56 q6.5 -10 13 0" />
        <path d="M68 56 q6.5 -10 13 0" />
      </g>
      <circle className="blush" cx="36" cy="68" r="5" />
      <circle className="blush" cx="84" cy="68" r="5" />
    </>
  ),
  slaperig: (
    <g className="eyes-line">
      <path d="M39 58 h13" />
      <path d="M68 58 h13" />
    </g>
  ),
}

export default function Companion({ mood = 'rust', size = 96, label }) {
  return (
    <svg
      className={`companion companion-${mood}`}
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={label ?? `Kalma is ${mood}`}
    >
      <ellipse className="companion-shadow" cx="60" cy="108" rx="30" ry="5" />
      <g className="companion-body">
        <rect x="18" y="16" width="84" height="84" rx="26" />
        {EYES[mood] ?? EYES.rust}
      </g>
    </svg>
  )
}
