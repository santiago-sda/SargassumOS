'use client'
import type { Condition } from '@/types'

const OPTIONS: { value: Condition | 'all'; label: string; color: string }[] = [
  { value: 'all',      label: 'All',      color: 'bg-gray-200 text-gray-700' },
  { value: 'clean',    label: 'Clean',    color: 'bg-green-100 text-green-800' },
  { value: 'light',    label: 'Light',    color: 'bg-yellow-100 text-yellow-800' },
  { value: 'moderate', label: 'Moderate', color: 'bg-orange-100 text-orange-800' },
  { value: 'heavy',    label: 'Heavy',    color: 'bg-red-100 text-red-800' },
]

interface Props {
  active: Condition | 'all'
  onChange: (v: Condition | 'all') => void
  className?: string
}

export default function ConditionFilter({ active, onChange, className }: Props) {
  return (
    <div className={className ?? 'absolute top-3 left-1/2 -translate-x-1/2 z-10 flex gap-2 flex-wrap justify-center px-3'}>
      {OPTIONS.map(({ value, label, color }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium shadow transition-all
            ${color}
            ${active === value ? 'ring-2 ring-offset-1 ring-gray-400 scale-105' : 'opacity-80 hover:opacity-100'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
