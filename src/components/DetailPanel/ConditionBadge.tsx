'use client'
import type { Condition } from '@/types'

const STYLES: Record<Condition, string> = {
  clean:    'bg-green-100 text-green-800',
  light:    'bg-yellow-100 text-yellow-800',
  moderate: 'bg-orange-100 text-orange-800',
  heavy:    'bg-red-100 text-red-800',
  unknown:  'bg-gray-100 text-gray-600',
}

export default function ConditionBadge({ condition }: { condition: Condition }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STYLES[condition]}`}>
      {condition}
    </span>
  )
}
