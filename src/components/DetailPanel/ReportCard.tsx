'use client'
import type { Report } from '@/types'
import ConditionBadge from './ConditionBadge'

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function ReportCard({ report }: { report: Report }) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      {report.photo_url && (
        <img
          src={report.photo_url}
          alt="Beach condition"
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <ConditionBadge condition={report.condition} />
          <span className="text-xs text-gray-400">{timeAgo(report.created_at)}</span>
        </div>
        {report.note && (
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{report.note}</p>
        )}
      </div>
    </div>
  )
}
