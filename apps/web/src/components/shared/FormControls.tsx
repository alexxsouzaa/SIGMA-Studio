export function Toggle({ checked, onChange }: { checked: boolean; onChange?: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      style={{
        width: 40, height: 22,
        background: checked ? 'var(--accent)' : 'var(--border)',
        borderRadius: 11, position: 'relative', flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute', left: checked ? 21 : 3, top: 3,
          width: 16, height: 16, borderRadius: '50%',
          background: checked ? 'var(--accent-fg)' : 'var(--bg)',
          transition: 'left 150ms ease',
        }}
      />
    </button>
  )
}

export function Slider({
  value, onChange, min, max, suffix,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  suffix: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div />
        <span
          style={{
            fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg)',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '2px 8px',
          }}
        >
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%', height: 4, appearance: 'none',
          background: 'var(--border)', borderRadius: 2, outline: 'none',
        }}
      />
    </div>
  )
}
