'use client'

export type MapTab = 'beach-conditions' | 'incoming-risk'

interface Props {
  active: MapTab
  onChange: (tab: MapTab) => void
  className?: string
}

const TABS: { value: MapTab; label: string; emoji: string }[] = [
  { value: 'beach-conditions', label: 'Beach Conditions', emoji: '🏖️' },
  { value: 'incoming-risk',    label: 'Incoming Risk',    emoji: '🌊' },
]

export default function MapTabs({ active, onChange, className }: Props) {
  return (
    <div
      className={className}
      style={{
        background: '#fff',
        borderRadius: 999,
        padding: '4px',
        display: 'flex',
        gap: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
      }}
    >
      {TABS.map(tab => {
        const isActive = active === tab.value
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              background: isActive ? '#1a3a5c' : 'transparent',
              color: isActive ? '#fff' : '#6b7280',
              fontWeight: isActive ? 700 : 500,
              fontSize: 14,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
