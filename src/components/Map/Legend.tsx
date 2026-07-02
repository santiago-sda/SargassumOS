'use client'
import { useState } from 'react'

const ITEMS = [
  { label: 'Clear',    color: '#22c55e' },
  { label: 'Light',    color: '#facc15' },
  { label: 'Moderate', color: '#f97316' },
  { label: 'Heavy',    color: '#dc2626' },
]

const INFO_TEXT = 'Beach Conditions shows the current sargassum risk for each beach, based on satellite data from Copernicus and NOAA, local wind direction and speed, and recent visitor reports. All three layers are combined into a single risk level: Clear, Light, Moderate, or Heavy. Satellite data is updated as coverage allows, typically every 1 to 3 days per beach. NOAA regional data updates daily.'

const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

export default function Legend() {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <>
      {/* Legend card */}
      <div className="hidden md:block absolute bottom-8 left-3 z-10 bg-white rounded-2xl shadow-lg px-4 py-3 w-52">
        {/* Header */}
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-bold text-gray-900 text-sm">Beach Conditions</span>
          <button
            onClick={() => setShowInfo(v => !v)}
            className="w-6 h-6 rounded-full border border-gray-300 text-gray-400 text-xs flex items-center justify-center hover:border-gray-400 hover:text-gray-600 transition flex-shrink-0"
          >i</button>
        </div>
        <p className="text-xs text-gray-400 mb-3">Satellite data: {today}</p>

        {/* Condition rows */}
        <div className="flex flex-col gap-2">
          {ITEMS.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
              <span className="text-sm text-gray-700">{label}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">~ = NOAA regional estimate</p>
      </div>

      {/* Info popup */}
      {showInfo && (
        <div className="hidden md:block absolute bottom-[320px] left-3 z-20 bg-white rounded-2xl shadow-xl p-4 w-72">
          <button
            onClick={() => setShowInfo(false)}
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-sm flex items-center justify-center hover:bg-gray-200"
          >×</button>
          <p className="text-sm text-gray-700 leading-relaxed pr-6">{INFO_TEXT}</p>
        </div>
      )}
    </>
  )
}
