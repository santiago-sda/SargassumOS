'use client'
import { useEffect, useState, useCallback } from 'react'
import type { Beach, Report } from '@/types'
import ConditionBadge from './ConditionBadge'
import ReportCard from './ReportCard'
import ReportForm from './ReportForm'
import BeachCharts from './BeachCharts'

interface Props {
  beach: Beach | null
  onClose: () => void
  onReport: () => void
}

function timeAgo(date: string | null) {
  if (!date) return 'never'
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function DetailPanel({ beach, onClose, onReport }: Props) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const loadReports = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/beaches/${id}/reports`)
      const data = await res.json()
      setReports(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!beach) { setReports([]); setShowForm(false); return }
    setShowForm(false)
    loadReports(beach.id)
  }, [beach?.id, loadReports])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!beach) return null

  function handleSuccess() {
    setShowForm(false)
    loadReports(beach!.id)
    setTimeout(onReport, 800)
  }

  return (
    <>
      <div className="absolute inset-0 z-20 md:hidden" onClick={onClose} />

      <div className="absolute bottom-0 left-0 right-0 md:bottom-auto md:top-0 md:left-auto md:right-0 md:h-full md:w-96 z-30 bg-white shadow-2xl rounded-t-2xl md:rounded-none flex flex-col max-h-[80vh] md:max-h-full">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg leading-tight">{beach.name}</h2>
            {beach.country && <p className="text-sm text-gray-500">{beach.country}</p>}
            <div className="mt-2 flex items-center gap-2">
              <ConditionBadge condition={beach.current_condition} />
              <span className="text-xs text-gray-400">Updated {timeAgo(beach.last_updated)}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-2">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {showForm ? (
            <ReportForm
              beachId={beach.id}
              beachName={beach.name}
              onSuccess={handleSuccess}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <>
              {/* AI Webcam Snapshot */}
              {beach.webcam_snapshot_url && (
                <div className="mb-4">
                  <div className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
                    <img
                      src={beach.webcam_snapshot_url}
                      alt={`${beach.name} sargassum detection`}
                      className="w-full h-full object-cover"
                    />
                    {beach.sargassum_coverage !== null && (
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                        {beach.sargassum_coverage.toFixed(1)}% coverage · {beach.detection_patches} patches
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                      🤖 AI Detection · {timeAgo(beach.detection_updated_at)}
                    </div>
                  </div>
                </div>
              )}

              <BeachCharts reports={reports} />
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Reports</h3>
              {loading && <p className="text-sm text-gray-400">Loading…</p>}
              {!loading && reports.length === 0 && (
                <p className="text-sm text-gray-400">No reports yet. Be the first!</p>
              )}
              {reports.map(r => <ReportCard key={r.id} report={r} />)}
            </>
          )}
        </div>

        {/* CTA — hidden when form is open */}
        {!showForm && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
            >
              Report conditions
            </button>
          </div>
        )}
      </div>
    </>
  )
}
