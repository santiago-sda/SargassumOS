'use client'
import { useState } from 'react'

const ITEMS = [
  { label: 'Low',     color: '#22c55e' },
  { label: 'Warning', color: '#facc15' },
  { label: 'Medium',  color: '#f97316' },
  { label: 'High',    color: '#dc2626' },
]

const INFO_TEXT = 'Incoming Risk shows sargassum detected by NOAA satellite within 50 to 100km of each Caribbean coastline. A high risk zone means sargassum is close offshore and may reach the beach within days. Actual beach conditions depend on wind, tides, and local currents. Data updated daily by NOAA AOML.'

const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

export default function IncomingRiskLegend() {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <>
      {/* Legend card */}
      <div className="hidden md:block absolute bottom-8 left-3 z-10 bg-white rounded-2xl shadow-lg px-4 py-3 w-52">
        {/* Header */}
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-bold text-gray-900 text-sm">Incoming Risk</span>
          <button
            onClick={() => setShowInfo(v => !v)}
            className="w-6 h-6 rounded-full border border-gray-300 text-gray-400 text-xs flex items-center justify-center hover:border-gray-400 hover:text-gray-600 transition flex-shrink-0"
          >i</button>
        </div>
        <p className="text-xs text-gray-400 mb-3">Last updated: {today}</p>

        {/* Risk rows */}
        <div className="flex flex-col gap-2">
          {ITEMS.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span style={{ width: 14, height: 14, borderRadius: 3, background: color, display: 'inline-block', flexShrink: 0 }} />
              <span className="text-sm text-gray-700">{label}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">Regional sargassum inundation risk (NOAA)</p>
      </div>

      {/* Info popup */}
      {showInfo && (
        <div className="hidden md:block absolute bottom-[320px] left-3 z-20 bg-white rounded-2xl shadow-xl p-4 w-72">
          <h3 className="font-bold text-gray-900 text-sm mb-2">About Incoming Risk</h3>
          <button
            onClick={() => setShowInfo(false)}
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-sm flex items-center justify-center hover:bg-gray-200"
          >×</button>
          <p className="text-sm text-gray-700 leading-relaxed pr-2">{INFO_TEXT}</p>
        </div>
      )}
    </>
  )
}
